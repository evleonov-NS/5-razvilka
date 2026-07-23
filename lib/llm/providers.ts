import type { LlmProviderKind } from "@prisma/client";

/** Оценка USD за 1M токенов (для отображения стоимости; не биллинг провайдера). */
export type ModelPricing = {
  inputPer1M: number;
  outputPer1M: number;
};

export type LlmModelInfo = {
  id: string;
  label: string;
  pricing: ModelPricing;
};

export type LlmProviderInfo = {
  id: LlmProviderKind;
  label: string;
  /** Документация / кабинет ключей. */
  docsUrl: string;
  /** OpenAI-совместимый base URL. */
  baseURL: string;
  /** Имя env для платформенного ключа. */
  platformEnvKey: "DEEPSEEK_API_KEY" | "QWEN_API_KEY" | "OPENAI_API_KEY";
  models: LlmModelInfo[];
  defaultModel: string;
};

/**
 * Каталог провайдеров. Цены ориентировочные (USD / 1M) — для UI «стоимость запросов».
 * Обновлять по прайсу провайдера при необходимости.
 */
export const LLM_PROVIDERS: Record<LlmProviderKind, LlmProviderInfo> = {
  DEEPSEEK: {
    id: "DEEPSEEK",
    label: "DeepSeek",
    docsUrl: "https://platform.deepseek.com/api_keys",
    baseURL: "https://api.deepseek.com",
    platformEnvKey: "DEEPSEEK_API_KEY",
    defaultModel: "deepseek-chat",
    models: [
      {
        id: "deepseek-chat",
        label: "DeepSeek Chat (V3)",
        pricing: { inputPer1M: 0.27, outputPer1M: 1.1 },
      },
      {
        id: "deepseek-reasoner",
        label: "DeepSeek Reasoner (R1)",
        pricing: { inputPer1M: 0.55, outputPer1M: 2.19 },
      },
    ],
  },
  QWEN: {
    id: "QWEN",
    label: "Qwen (DashScope)",
    docsUrl: "https://www.alibabacloud.com/help/en/model-studio/get-api-key",
    // international compatible-mode; для CN можно переопределить через env позже
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    platformEnvKey: "QWEN_API_KEY",
    defaultModel: "qwen-plus",
    models: [
      {
        id: "qwen-turbo",
        label: "Qwen Turbo",
        pricing: { inputPer1M: 0.05, outputPer1M: 0.2 },
      },
      {
        id: "qwen-plus",
        label: "Qwen Plus",
        pricing: { inputPer1M: 0.4, outputPer1M: 1.2 },
      },
      {
        id: "qwen-max",
        label: "Qwen Max",
        pricing: { inputPer1M: 1.6, outputPer1M: 6.4 },
      },
    ],
  },
  OPENAI: {
    id: "OPENAI",
    label: "OpenAI",
    docsUrl: "https://platform.openai.com/api-keys",
    baseURL: "https://api.openai.com/v1",
    platformEnvKey: "OPENAI_API_KEY",
    defaultModel: "gpt-4o-mini",
    models: [
      {
        id: "gpt-4o-mini",
        label: "GPT-4o mini",
        pricing: { inputPer1M: 0.15, outputPer1M: 0.6 },
      },
      {
        id: "gpt-4o",
        label: "GPT-4o",
        pricing: { inputPer1M: 2.5, outputPer1M: 10 },
      },
    ],
  },
};

export const DEFAULT_PROVIDER: LlmProviderKind = "DEEPSEEK";
export const DEFAULT_MODEL = LLM_PROVIDERS.DEEPSEEK.defaultModel;

/** Бесплатных разборов за счёт платформы для обычных пользователей. */
export const FREE_PLATFORM_CREDITS = 1;

export function getProvider(kind: LlmProviderKind): LlmProviderInfo {
  return LLM_PROVIDERS[kind];
}

export function getModel(
  kind: LlmProviderKind,
  modelId: string,
): LlmModelInfo | undefined {
  return LLM_PROVIDERS[kind].models.find((m) => m.id === modelId);
}

/** Оценка стоимости в микродолларах (1 USD = 1e6). */
export function estimateCostUsdMicros(
  kind: LlmProviderKind,
  modelId: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const model = getModel(kind, modelId);
  const pricing = model?.pricing ?? { inputPer1M: 1, outputPer1M: 3 };
  const usd =
    (promptTokens / 1_000_000) * pricing.inputPer1M +
    (completionTokens / 1_000_000) * pricing.outputPer1M;
  return Math.round(usd * 1_000_000);
}

export function microsToUsd(micros: number): number {
  return micros / 1_000_000;
}

export function formatUsd(micros: number): string {
  const usd = microsToUsd(micros);
  if (usd < 0.01 && usd > 0) return `≈$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

/** Публичный каталог для UI (без секретов). */
export function listProvidersPublic() {
  return (Object.values(LLM_PROVIDERS) as LlmProviderInfo[]).map((p) => ({
    id: p.id,
    label: p.label,
    docsUrl: p.docsUrl,
    defaultModel: p.defaultModel,
    models: p.models.map((m) => ({
      id: m.id,
      label: m.label,
      pricing: m.pricing,
    })),
  }));
}
