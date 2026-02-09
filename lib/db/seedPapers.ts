import { prisma } from "@/lib/db/prisma";
import {
  pastPapers,
  pastPaperQuestions,
  markingSchemes,
} from "@/features/papers/data/past-papers";

export const ensurePastPapersSeeded = async () => {
  const count = await prisma.pastPaper.count();
  if (count > 0) {
    const legacy = await prisma.markingScheme.findFirst({
      where: { scheme: { contains: "Max height" } },
      select: { id: true },
    });
    if (!legacy) return;
  }

  await prisma.markingScheme.deleteMany();
  await prisma.pastPaperQuestion.deleteMany();
  await prisma.pastPaper.deleteMany();

  for (const paper of pastPapers) {
    await prisma.pastPaper.create({
      data: {
        id: paper.id,
        year: paper.year,
        subject: paper.subject,
        title: paper.title,
        source: paper.source ?? null,
      },
    });
  }

  for (const question of pastPaperQuestions) {
    await prisma.pastPaperQuestion.create({
      data: {
        id: question.id,
        paperId: question.paperId,
        number: question.number,
        prompt: question.prompt,
        topics: question.topics ? JSON.stringify(question.topics) : null,
      },
    });
  }

  for (const scheme of markingSchemes) {
    await prisma.markingScheme.create({
      data: {
        id: scheme.id,
        questionId: scheme.questionId,
        scheme: scheme.scheme,
        marks: scheme.marks,
      },
    });
  }
};
