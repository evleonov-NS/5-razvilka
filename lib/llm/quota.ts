/**
 * Квоты платформенного LLM: владелец — безлимит; остальные — FREE_PLATFORM_CREDITS.
 */
import { FREE_PLATFORM_CREDITS } from "@/lib/llm/providers";

export const OWNER_EMAIL_DEFAULT = "evleonov79@gmail.com";

export function getOwnerEmail(): string {
  return (
    process.env.OWNER_EMAIL?.trim().toLowerCase() || OWNER_EMAIL_DEFAULT
  );
}

export function isOwnerEmail(email: string): boolean {
  return email.trim().toLowerCase() === getOwnerEmail();
}

export type QuotaUser = {
  email: string;
  llmApiKeyEnc: string | null;
  platformCreditsUsed: number;
};

export type QuotaStatus = {
  isOwner: boolean;
  hasOwnKey: boolean;
  platformCreditsUsed: number;
  freeLimit: number;
  /** Можно ли сейчас вызвать LLM (свой ключ / owner / остался бесплатный кредит). */
  canGenerate: boolean;
  /** Осталось бесплатных разборов за счёт платформы (0 у owner с безлимитом — Infinity в UI как null). */
  freeRemaining: number | null;
  reason?: "NEED_API_KEY" | "NO_PLATFORM_KEY";
  message?: string;
};

export function getQuotaStatus(user: QuotaUser): QuotaStatus {
  const isOwner = isOwnerEmail(user.email);
  const hasOwnKey = Boolean(user.llmApiKeyEnc);
  const freeLimit = FREE_PLATFORM_CREDITS;
  const freeRemaining = isOwner
    ? null
    : Math.max(0, freeLimit - user.platformCreditsUsed);

  if (hasOwnKey) {
    return {
      isOwner,
      hasOwnKey,
      platformCreditsUsed: user.platformCreditsUsed,
      freeLimit,
      canGenerate: true,
      freeRemaining,
    };
  }

  if (isOwner) {
    if (!isPlatformLlmConfigured()) {
      return {
        isOwner,
        hasOwnKey,
        platformCreditsUsed: user.platformCreditsUsed,
        freeLimit,
        canGenerate: false,
        freeRemaining,
        reason: "NO_PLATFORM_KEY",
        message:
          "Платформенный ключ не настроен (DEEPSEEK_API_KEY). Добавьте свой API в настройках.",
      };
    }
    return {
      isOwner,
      hasOwnKey,
      platformCreditsUsed: user.platformCreditsUsed,
      freeLimit,
      canGenerate: true,
      freeRemaining,
    };
  }

  // Обычный пользователь без своего ключа
  if (user.platformCreditsUsed >= freeLimit) {
    return {
      isOwner,
      hasOwnKey,
      platformCreditsUsed: user.platformCreditsUsed,
      freeLimit,
      canGenerate: false,
      freeRemaining: 0,
      reason: "NEED_API_KEY",
      message:
        "Бесплатный тестовый разбор уже использован. Добавьте свой API-ключ в настройках (DeepSeek, Qwen или OpenAI).",
    };
  }

  if (!isPlatformLlmConfigured()) {
    return {
      isOwner,
      hasOwnKey,
      platformCreditsUsed: user.platformCreditsUsed,
      freeLimit,
      canGenerate: false,
      freeRemaining,
      reason: "NO_PLATFORM_KEY",
      message:
        "Сервис временно без платформенного ключа. Добавьте свой API в настройках.",
    };
  }

  return {
    isOwner,
    hasOwnKey,
    platformCreditsUsed: user.platformCreditsUsed,
    freeLimit,
    canGenerate: true,
    freeRemaining,
  };
}

/** Есть ли хотя бы один платформенный ключ (по умолчанию DeepSeek). */
export function isPlatformLlmConfigured(): boolean {
  return Boolean(
    process.env.DEEPSEEK_API_KEY?.trim() ||
      process.env.QWEN_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim(),
  );
}
