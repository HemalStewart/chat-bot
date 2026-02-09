import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensurePastPapersSeeded } from "@/lib/db/seedPapers";

export async function GET() {
  await ensurePastPapersSeeded();
  const papers = await prisma.pastPaper.findMany({
    orderBy: [{ year: "desc" }, { title: "asc" }],
  });

  return NextResponse.json({ papers });
}

export const runtime = "nodejs";
