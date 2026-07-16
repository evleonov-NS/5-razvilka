import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

const bodySchema = z.object({
  isPublic: z.boolean(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id: rawId } = await context.params;

    const parsedId = idSchema.safeParse(rawId);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Некорректный идентификатор" }, { status: 400 });
    }

    const body = bodySchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    const decision = await prisma.decision.findUnique({
      where: { id: parsedId.data },
      select: { userId: true },
    });

    if (!decision) {
      return NextResponse.json({ error: "Решение не найдено" }, { status: 404 });
    }

    if (decision.userId !== user.id) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const updated = await prisma.decision.update({
      where: { id: parsedId.data },
      data: { isPublic: body.data.isPublic },
      select: { isPublic: true },
    });

    return NextResponse.json({ isPublic: updated.isPublic });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("PATCH /api/decisions/[id]/visibility:", error);
    return NextResponse.json({ error: "Попробуйте позже" }, { status: 500 });
  }
}
