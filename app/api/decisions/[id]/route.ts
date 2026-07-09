import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: rawId } = await context.params;

    const parsed = idSchema.safeParse(rawId);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некорректный идентификатор" }, { status: 400 });
    }

    const decision = await prisma.decision.findUnique({
      where: { id: parsed.data },
      select: { userId: true },
    });

    if (!decision) {
      return NextResponse.json({ error: "Решение не найдено" }, { status: 404 });
    }

    // Защита от DELETE с чужим id — в UI чужих решений нет, на API проверяем владельца
    if (decision.userId !== user.id) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    await prisma.decision.delete({ where: { id: parsed.data } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("DELETE /api/decisions/[id]:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
