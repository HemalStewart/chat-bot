import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_SESSION_ID = "default";

const ensureSession = async () => {
  const session = await prisma.chatSession.findUnique({
    where: { id: DEFAULT_SESSION_ID },
  });

  if (session) return session;

  return prisma.chatSession.create({
    data: { id: DEFAULT_SESSION_ID, name: "Default Session" },
  });
};

export async function GET() {
  await ensureSession();
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId: DEFAULT_SESSION_ID },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      ...message,
      sources: message.sources ? safeParseJson(message.sources) : null,
    })),
  });
}

export async function POST(request: NextRequest) {
  await ensureSession();
  const body = (await request.json().catch(() => null)) as {
    role?: string;
    content?: string;
    sources?: unknown;
  } | null;

  if (!body?.role || !body.content) {
    return NextResponse.json({ error: "Role and content are required." }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      sessionId: DEFAULT_SESSION_ID,
      role: body.role,
      content: body.content,
      sources: body.sources ? JSON.stringify(body.sources) : null,
    },
  });

  return NextResponse.json({ message });
}

export async function DELETE() {
  await prisma.chatMessage.deleteMany({
    where: { sessionId: DEFAULT_SESSION_ID },
  });
  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";

const safeParseJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};
