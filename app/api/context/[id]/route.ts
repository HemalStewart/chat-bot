import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contextDoc.delete({
      where: { id: params.id },
    });
  } catch (error) {
    // Ignore if the record is already gone.
  }
  return NextResponse.json({ ok: true });
}

export const runtime = "nodejs";
