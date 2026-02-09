import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { prisma } from "@/lib/db/prisma";
import { extractPdfTextWithOcr } from "@/lib/ocr/pdfOcr";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_TEXT_LENGTH = 200;
const MIN_MEANINGFUL_RATIO = 0.35;

const isLikelyGarbled = (value: string) => {
  if (!value) return true;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length < MIN_TEXT_LENGTH) return true;
  const letters = normalized.match(/\p{L}/gu)?.length ?? 0;
  const digits = normalized.match(/\p{N}/gu)?.length ?? 0;
  const meaningful = letters + digits;
  const ratio = meaningful / Math.max(1, normalized.length);
  return ratio < MIN_MEANINGFUL_RATIO;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const ocrEnabled = formData.get("ocr") === "true";
    const ocrLang = typeof formData.get("lang") === "string" ? String(formData.get("lang")) : "eng";
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "PDF is too large (max 10MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buffer);
    let text = (parsed.text ?? "").trim();

    if (ocrEnabled && isLikelyGarbled(text)) {
      const ocr = await extractPdfTextWithOcr(buffer, ocrLang);
      text = ocr.text?.trim() || text;
    }

    if (!text) {
      return NextResponse.json(
        { error: "No extractable text found in PDF. Enable OCR for scanned PDFs." },
        { status: 400 }
      );
    }

    const doc = await prisma.contextDoc.create({
      data: {
        title: file.name || "PDF Upload",
        content: text,
      },
    });

    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
