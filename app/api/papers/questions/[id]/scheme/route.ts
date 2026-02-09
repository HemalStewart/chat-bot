import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensurePastPapersSeeded } from "@/lib/db/seedPapers";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  await ensurePastPapersSeeded();
  const scheme = await prisma.markingScheme.findFirst({
    where: { questionId: params.id },
  });

  return NextResponse.json({ scheme });
}

export const runtime = "nodejs";
