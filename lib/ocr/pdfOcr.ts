import { createWorker } from "tesseract.js";
import { createCanvas } from "canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const DEFAULT_SCALE = 2.0;
const DEFAULT_MAX_PAGES = 5;

export type OcrResult = {
  text: string;
  pages: number;
};

const pickLang = (lang: string | undefined) => {
  if (!lang) return "eng";
  const normalized = lang.toLowerCase();
  if (normalized === "sin" || normalized === "sinhala") return "sin";
  if (normalized === "tam" || normalized === "tamil") return "tam";
  if (normalized === "eng" || normalized === "english") return "eng";
  return "eng";
};

export const extractPdfTextWithOcr = async (
  buffer: Buffer,
  lang?: string,
  maxPages: number = DEFAULT_MAX_PAGES
): Promise<OcrResult> => {
  const document = await pdfjsLib.getDocument({ data: buffer }).promise;
  const totalPages = document.numPages;
  const pagesToProcess = Math.min(totalPages, maxPages);

  const ocrLang = pickLang(lang);
  const worker = await createWorker(ocrLang);

  let combinedText = "";

  for (let pageIndex = 1; pageIndex <= pagesToProcess; pageIndex += 1) {
    const page = await document.getPage(pageIndex);
    const viewport = page.getViewport({ scale: DEFAULT_SCALE });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    const image = canvas.toBuffer("image/png");

    const result = await worker.recognize(image);
    const pageText = result.data.text ?? "";
    combinedText += `${pageText}\n`;
  }

  await worker.terminate();

  return {
    text: combinedText.trim(),
    pages: pagesToProcess,
  };
};
