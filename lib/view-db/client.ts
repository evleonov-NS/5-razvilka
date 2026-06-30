import { PrismaClient } from "@prisma/client";
import { DbProfile, getDatabaseUrl } from "./config";

const clients = new Map<string, PrismaClient>();

/** Отдельный PrismaClient для выбранного профиля БД (не синглтон приложения). */
export function getViewDbClient(profile: DbProfile): PrismaClient {
  const url = getDatabaseUrl(profile);

  let client = clients.get(url);
  if (!client) {
    client = new PrismaClient({
      datasources: { db: { url } },
      log: ["error"],
    });
    clients.set(url, client);
  }

  return client;
}
