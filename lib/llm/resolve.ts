/**
 * Выбор credentials: свой ключ пользователя или платформенный (DeepSeek по умолчанию).
 */
import type { LlmProviderKind } from "@prisma/client";
import { decryptSecret } from "@/lib/llm/crypto";
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  getModel,
  getProvider,
} from "@/lib/llm/providers";
import { getQuotaStatus, isOwnerEmail } from "@/lib/llm/quota";

export type LlmCredentials = {
  provider: LlmProviderKind;
  model: string;
  apiKey: string;
  baseURL: string;
  /** PLATFORM — наш ключ; USER — ключ из настроек. */
  billedTo: "PLATFORM" | "USER";
};

export type ResolveUser = {
  email: string;
  llmProvider: LlmProviderKind;
  llmModel: string;
  llmApiKeyEnc: string | null;
  platformCreditsUsed: number;
};

export class LlmResolveError extends Error {
  code: "NEED_API_KEY" | "NO_PLATFORM_KEY" | "INVALID_KEY";

  constructor(
    code: LlmResolveError["code"],
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}

function platformKeyFor(provider: LlmProviderKind): string | null {
  const envName = getProvider(provider).platformEnvKey;
  const value = process.env[envName]?.trim();
  return value || null;
}

/** Платформенный провайдер по умолчанию (DeepSeek, с fallback). */
export function resolvePlatformDefaults(): {
  provider: LlmProviderKind;
  model: string;
} {
  const fromEnv = process.env.LLM_DEFAULT_PROVIDER?.trim().toUpperCase();
  let provider: LlmProviderKind = DEFAULT_PROVIDER;
  if (fromEnv === "DEEPSEEK" || fromEnv === "QWEN" || fromEnv === "OPENAI") {
    provider = fromEnv;
  }

  // Если у выбранного нет ключа — берём первого с ключом, предпочитая DeepSeek
  const order: LlmProviderKind[] = [
    provider,
    "DEEPSEEK",
    "OPENAI",
    "QWEN",
  ];
  const seen = new Set<LlmProviderKind>();
  for (const p of order) {
    if (seen.has(p)) continue;
    seen.add(p);
    if (platformKeyFor(p)) {
      const model =
        process.env.LLM_MODEL?.trim() || getProvider(p).defaultModel;
      return { provider: p, model };
    }
  }

  return {
    provider: DEFAULT_PROVIDER,
    model: process.env.LLM_MODEL?.trim() || DEFAULT_MODEL,
  };
}

/**
 * Credentials для вызова LLM от имени пользователя.
 * Бросает LlmResolveError, если генерировать нельзя.
 */
export function resolveLlmCredentials(user: ResolveUser): LlmCredentials {
  const quota = getQuotaStatus(user);
  if (!quota.canGenerate) {
    throw new LlmResolveError(
      quota.reason ?? "NEED_API_KEY",
      quota.message ?? "Нет доступа к генерации",
    );
  }

  if (user.llmApiKeyEnc) {
    let apiKey: string;
    try {
      apiKey = decryptSecret(user.llmApiKeyEnc);
    } catch {
      throw new LlmResolveError(
        "INVALID_KEY",
        "Не удалось расшифровать API-ключ. Сохраните ключ заново в настройках.",
      );
    }

    const provider = user.llmProvider;
    const info = getProvider(provider);
    const model =
      getModel(provider, user.llmModel)?.id ?? info.defaultModel;

    return {
      provider,
      model,
      apiKey,
      baseURL: info.baseURL,
      billedTo: "USER",
    };
  }

  // Платформа: owner или бесплатный кредит
  const defaults = resolvePlatformDefaults();
  // Владелец может держать в профиле выбранного провайдера — если есть платформенный ключ
  let provider = defaults.provider;
  let model = defaults.model;

  if (isOwnerEmail(user.email) && platformKeyFor(user.llmProvider)) {
    provider = user.llmProvider;
    model =
      getModel(provider, user.llmModel)?.id ??
      getProvider(provider).defaultModel;
  }

  const apiKey = platformKeyFor(provider);
  if (!apiKey) {
    throw new LlmResolveError(
      "NO_PLATFORM_KEY",
      "Платформенный API-ключ не настроен.",
    );
  }

  return {
    provider,
    model,
    apiKey,
    baseURL: getProvider(provider).baseURL,
    billedTo: "PLATFORM",
  };
}
