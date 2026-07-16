import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: rawId } = await context.params;

    const parsed = idSchema.safeParse(rawId);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некорректный идентификатор" }, { status: 400 });
    }

    const decision = await prisma.decision.findUnique({
      where: { id: parsed.data },
      select: { id: true, isPublic: true },
    });

    if (!decision || !decision.isPublic) {
      return NextResponse.json({ error: "Решение не найдено" }, { status: 404 });
    }

    const existing = await prisma.decisionLike.findUnique({
      where: {
        userId_decisionId: { userId: user.id, decisionId: parsed.data },
      },
    });

    if (existing) {
      await prisma.decisionLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.decisionLike.create({
        data: { userId: user.id, decisionId: parsed.data },
      });
    }

    const likesCount = await prisma.decisionLike.count({
      where: { decisionId: parsed.data },
    });

    return NextResponse.json({ liked: !existing, likesCount });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("POST /api/decisions/[id]/like:", error);
    return NextResponse.json({ error: "Попробуйте позже" }, { status: 500 });
  }
}
