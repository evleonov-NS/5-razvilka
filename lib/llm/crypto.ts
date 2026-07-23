/**
 * Шифрование пользовательских API-ключей (AES-256-GCM).
 * Ключ — SHA-256 от AUTH_SECRET; ciphertext: iv:tag:data (base64).
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET не задан — нельзя шифровать API-ключи");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getEncryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Повреждённый шифротекст API-ключа");
  }
  const decipher = createDecipheriv(
    ALGO,
    getEncryptionKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/** Маска для UI: ****...abcd */
export function maskApiKey(plain: string): string {
  const trimmed = plain.trim();
  if (trimmed.length <= 4) return "****";
  return `****…${trimmed.slice(-4)}`;
}
