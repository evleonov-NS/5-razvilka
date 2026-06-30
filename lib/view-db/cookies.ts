import { cookies } from "next/headers";
import { DbProfile, VIEW_DB_COOKIE } from "./config";

export async function getDbProfileFromCookie(): Promise<DbProfile> {
  const store = await cookies();
  const value = store.get(VIEW_DB_COOKIE)?.value;
  return value === "prod" ? "prod" : "local";
}

export function dbProfileCookieOptions(profile: DbProfile) {
  return {
    name: VIEW_DB_COOKIE,
    value: profile,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
