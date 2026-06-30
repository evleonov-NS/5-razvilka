import { DbProfile } from "./config";
import { getDbProfileFromCookie } from "./cookies";

/** Профиль из query (?profile=) или cookie. */
export async function resolveDbProfile(
  profileParam?: string | null,
): Promise<DbProfile> {
  if (profileParam === "local" || profileParam === "prod") {
    return profileParam;
  }
  return getDbProfileFromCookie();
}
