export type DbProfile = "local" | "prod";

export const VIEW_DB_COOKIE = "view-db-profile";

export type DbProfileInfo = {
  id: DbProfile;
  label: string;
  description: string;
  configured: boolean;
};

/** Профили подключения: локальная (.env DATABASE_URL) и рабочая (DATABASE_URL_PROD). */
export function getDbProfileInfos(): DbProfileInfo[] {
  return [
    {
      id: "local",
      label: "Локальная",
      description: "DATABASE_URL из .env",
      configured: Boolean(process.env.DATABASE_URL?.trim()),
    },
    {
      id: "prod",
      label: "Рабочая",
      description: "DATABASE_URL_PROD из .env",
      configured: Boolean(process.env.DATABASE_URL_PROD?.trim()),
    },
  ];
}

export function getDatabaseUrl(profile: DbProfile): string {
  const url =
    profile === "prod"
      ? process.env.DATABASE_URL_PROD?.trim()
      : process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      profile === "prod"
        ? "DATABASE_URL_PROD не задан в .env"
        : "DATABASE_URL не задан в .env",
    );
  }

  return url;
}

export function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = "****";
    return parsed.toString();
  } catch {
    return "(некорректный URL)";
  }
}
