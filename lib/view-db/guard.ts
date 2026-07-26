import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/auth";
import { forbiddenResponse, requireOwner } from "@/lib/owner";

/** Dev-утилита: в production только при VIEW_DB_ENABLED=true. */
export function isViewDbEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.VIEW_DB_ENABLED === "true";
}

export function viewDbDisabledResponse(): NextResponse {
  return NextResponse.json(
    { error: "view-db отключён в production (VIEW_DB_ENABLED=true для включения)" },
    { status: 403 },
  );
}

export function assertViewDbEnabled(): void {
  if (!isViewDbEnabled()) {
    throw new Error("view-db disabled");
  }
}

/**
 * API view-db: включён + только owner.
 * null — доступ разрешён; иначе готовый ответ 403/401/403.
 */
export async function viewDbAccessDeniedResponse(): Promise<NextResponse | null> {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();
  try {
    await requireOwner();
    return null;
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return forbiddenResponse();
    }
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    throw err;
  }
}
