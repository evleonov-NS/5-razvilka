import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export const runtime = "nodejs";

/** Серверный выход: удаляет сессию в БД и cookie (надёжнее client signOut). */
export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.json({ ok: true });
}
