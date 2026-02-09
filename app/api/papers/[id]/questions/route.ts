import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensurePastPapersSeeded } from "@/lib/db/seedPapers";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  await ensurePastPapersSeeded();
  const questions = await prisma.pastPaperQuestion.findMany({
    where: { paperId: params.id },
    orderBy: { number: "asc" },
  });

  return NextResponse.json({
    questions: questions.map((question) => ({
      ...question,
      topics: question.topics ? safeParseJson(question.topics) : null,
    })),
  });
}

export const runtime = "nodejs";

const safeParseJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};
