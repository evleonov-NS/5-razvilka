import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import {
  countDemoDecisions,
  deleteDemoDecisions,
  seedDemoDecisions,
} from "@/lib/demo-data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const count = await countDemoDecisions(user.id);
    return NextResponse.json({ count });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("GET /api/user/demo-data:", err);
    return NextResponse.json(
      { error: "Не удалось получить счётчик демо" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    const result = await seedDemoDecisions(user.id);
    await trackEvent("LOAD_DEMO", user.id, { created: result.created });
    return NextResponse.json({
      ok: true,
      created: result.created,
      publicCount: result.publicCount,
      count: result.created,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("POST /api/user/demo-data:", err);
    return NextResponse.json(
      { error: "Не удалось загрузить демо-данные" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    const deleted = await deleteDemoDecisions(user.id);
    await trackEvent("DELETE_DEMO", user.id, { deleted });
    return NextResponse.json({ ok: true, deleted, count: 0 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("DELETE /api/user/demo-data:", err);
    return NextResponse.json(
      { error: "Не удалось удалить демо-данные" },
      { status: 500 },
    );
  }
}
