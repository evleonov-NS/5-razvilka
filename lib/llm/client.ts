/**
 * OpenAI-совместимый клиент. Вызовы только на сервере.
 */
import OpenAI from "openai";
import type { LlmCredentials } from "@/lib/llm/resolve";
import { isPlatformLlmConfigured } from "@/lib/llm/quota";

const DEFAULT_TIMEOUT_MS = 60_000;

export type LlmChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmChatOptions = {
  temperature?: number;
  timeoutMs?: number;
};

export type LlmChatResult = {
  content: string;
  promptTokens: number;
  completionTokens: number;
  provider: LlmCredentials["provider"];
  model: string;
  billedTo: LlmCredentials["billedTo"];
};

/** Есть ли платформенный ключ (DeepSeek / Qwen / OpenAI). */
export function isLlmConfigured(): boolean {
  return isPlatformLlmConfigured();
}

/**
 * Chat-completion с явными credentials (из resolveLlmCredentials).
 * Не кэшируем клиент по ключу пользователя — создаём на вызов (разные ключи).
 */
export async function chatCompletion(
  messages: LlmChatMessage[],
  credentials: LlmCredentials,
  options: LlmChatOptions = {},
): Promise<LlmChatResult> {
  const client = new OpenAI({
    apiKey: credentials.apiKey,
    baseURL: credentials.baseURL,
  });

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const response = await client.chat.completions.create(
    {
      model: credentials.model,
      messages,
      temperature: options.temperature ?? 0.7,
    },
    { timeout: timeoutMs },
  );

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("LLM вернул пустой ответ (choices[0].message.content)");
  }

  return {
    content,
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    provider: credentials.provider,
    model: credentials.model,
    billedTo: credentials.billedTo,
  };
}

/**
 * Smoke / verify: платформенный клиент без пользователя.
 * Предпочитает DeepSeek, иначе OpenAI/Qwen из env.
 */
export async function chatCompletionPlatform(
  messages: LlmChatMessage[],
  options: LlmChatOptions & { model?: string } = {},
): Promise<LlmChatResult> {
  const { resolvePlatformDefaults } = await import("@/lib/llm/resolve");
  const { getProvider } = await import("@/lib/llm/providers");
  const defaults = resolvePlatformDefaults();
  const provider = defaults.provider;
  const info = getProvider(provider);
  const apiKey = process.env[info.platformEnvKey]?.trim();
  if (!apiKey) {
    throw new Error(
      `Платформенный ключ ${info.platformEnvKey} не задан. См. .env.example.`,
    );
  }

  return chatCompletion(
    messages,
    {
      provider,
      model: options.model?.trim() || defaults.model,
      apiKey,
      baseURL: info.baseURL,
      billedTo: "PLATFORM",
    },
    options,
  );
}

/** @deprecated совместимость со старым verify — нет синглтона. */
export function resetLlmClient(): void {
  // no-op: клиент больше не кэшируется глобально
}
