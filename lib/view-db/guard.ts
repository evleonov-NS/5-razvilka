import { NextResponse } from "next/server";

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
