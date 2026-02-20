import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensurePastPapersSeeded } from "@/lib/db/seedPapers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  await ensurePastPapersSeeded();
  const scheme = await prisma.markingScheme.findFirst({
    where: { questionId: params.id },
  });

  return NextResponse.json({ scheme });
}

export const runtime = "nodejs";
