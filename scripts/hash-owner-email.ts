/**
 * Сгенерировать OWNER_EMAIL_HASH для .env / Vercel.
 * Пример: npx tsx --env-file=.env scripts/hash-owner-email.ts you@email.com
 */
import { hashOwnerEmail } from "../lib/owner";

const email = process.argv[2]?.trim();
if (!email) {
  console.error("Укажите email: npx tsx --env-file=.env scripts/hash-owner-email.ts you@email.com");
  process.exit(1);
}

console.log(hashOwnerEmail(email));
