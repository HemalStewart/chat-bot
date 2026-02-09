import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const docs = await prisma.contextDoc.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ docs });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    title?: string;
    content?: string;
  } | null;
  if (!body?.content) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const doc = await prisma.contextDoc.create({
    data: {
      title: body.title?.trim() || "Untitled source",
      content: body.content.trim(),
    },
  });

  return NextResponse.json({ doc });
}

export async function DELETE() {
  await prisma.contextDoc.deleteMany();
  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
