/**
 * Квоты платформенного LLM: владелец — безлимит; остальные — FREE_PLATFORM_CREDITS
 * (если платформенный ключ разрешён в AppSettings).
 */
import { FREE_PLATFORM_CREDITS } from "@/lib/llm/providers";
import { isOwnerEmail } from "@/lib/owner";

export type QuotaUser = {
  email: string;
  llmApiKeyEnc: string | null;
  platformCreditsUsed: number;
};

export type QuotaOptions = {
  /** false — обычным юзерам без своего ключа генерация недоступна (лок без бесплатных кредитов). */
  platformKeyEnabled?: boolean;
};

export type QuotaStatus = {
  isOwner: boolean;
  hasOwnKey: boolean;
  platformCreditsUsed: number;
  freeLimit: number;
  /** Можно ли сейчас вызвать LLM (свой ключ / owner / остался бесплатный кредит). */
  canGenerate: boolean;
  /** Осталось бесплатных разборов за счёт платформы (null у owner = безлимит). */
  freeRemaining: number | null;
  reason?: "NEED_API_KEY" | "NO_PLATFORM_KEY";
  message?: string;
  platformKeyEnabled: boolean;
};

export function getQuotaStatus(
  user: QuotaUser,
  options: QuotaOptions = {},
): QuotaStatus {
  const platformKeyEnabled = options.platformKeyEnabled ?? true;
  const isOwner = isOwnerEmail(user.email);
  const hasOwnKey = Boolean(user.llmApiKeyEnc);
  const freeLimit =
    !platformKeyEnabled && !isOwner ? 0 : FREE_PLATFORM_CREDITS;
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
      platformKeyEnabled,
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
        platformKeyEnabled,
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
      platformKeyEnabled,
    };
  }

  // Обычный пользователь без своего ключа
  if (!platformKeyEnabled || user.platformCreditsUsed >= freeLimit) {
    return {
      isOwner,
      hasOwnKey,
      platformCreditsUsed: user.platformCreditsUsed,
      freeLimit,
      canGenerate: false,
      freeRemaining: 0,
      platformKeyEnabled,
      reason: "NEED_API_KEY",
      message: !platformKeyEnabled
        ? "Платформенный ключ отключён. Добавьте свой API-ключ в настройках (DeepSeek, Qwen или OpenAI)."
        : "Бесплатные разборы использованы. Добавьте свой API-ключ в настройках (DeepSeek, Qwen или OpenAI).",
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
      platformKeyEnabled,
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
    platformKeyEnabled,
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

/** @deprecated используйте isOwnerEmail из lib/owner */
export { isOwnerEmail };
