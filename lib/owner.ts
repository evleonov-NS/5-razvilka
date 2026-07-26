/**
 * Проверка владельца без plaintext email в клиентском бандле.
 * Сравнение только на сервере: OWNER_EMAIL_HASH (HMAC-SHA256) или OWNER_EMAIL из env.
 */
import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

/** HMAC-SHA256(email_lower, AUTH_SECRET) → hex. */
export function hashOwnerEmail(email: string): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET не задан — нельзя проверить владельца");
  }
  return createHmac("sha256", secret)
    .update(email.trim().toLowerCase())
    .digest("hex");
}

/**
 * Владелец: совпадение с OWNER_EMAIL_HASH, иначе с OWNER_EMAIL из env.
 * Hardcoded fallback email убран — без env никто не owner.
 */
export function isOwnerEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const hashEnv = process.env.OWNER_EMAIL_HASH?.trim().toLowerCase();
  if (hashEnv) {
    try {
      return hashOwnerEmail(normalized) === hashEnv;
    } catch {
      return false;
    }
  }

  const plain = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!plain) return false;
  return normalized === plain;
}

/** Route Handlers / RSC: только владелец, иначе null. */
export async function getOwnerUser(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || !isOwnerEmail(user.email)) return null;
  return user;
}

/** Для Route Handlers: нет сессии → UNAUTHORIZED; не-владелец → FORBIDDEN. */
export async function requireOwner(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!isOwnerEmail(user.email)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function forbiddenResponse(): NextResponse {
  return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
}
