/**
 * Singleton AppSettings (платформенный ключ вкл/выкл для обычных пользователей).
 */
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "default";

export type AppSettingsRow = {
  id: string;
  platformKeyEnabled: boolean;
  updatedAt: Date;
};

export async function getAppSettings(): Promise<AppSettingsRow> {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, platformKeyEnabled: true },
    update: {},
  });
}

export async function getPlatformKeyEnabled(): Promise<boolean> {
  const row = await getAppSettings();
  return row.platformKeyEnabled;
}

export async function setPlatformKeyEnabled(
  enabled: boolean,
): Promise<AppSettingsRow> {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, platformKeyEnabled: enabled },
    update: { platformKeyEnabled: enabled },
  });
}
