/**
 * Публичный фасад LLM-слоя (сервер).
 * Не импортировать в Client Components.
 */
export {
  chatCompletion,
  chatCompletionPlatform,
  isLlmConfigured,
  resetLlmClient,
  type LlmChatMessage,
  type LlmChatOptions,
  type LlmChatResult,
} from "@/lib/llm/client";

export {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  FREE_PLATFORM_CREDITS,
  LLM_PROVIDERS,
  estimateCostUsdMicros,
  formatUsd,
  getModel,
  getProvider,
  listProvidersPublic,
  microsToUsd,
} from "@/lib/llm/providers";

export {
  getOwnerEmail,
  getQuotaStatus,
  isOwnerEmail,
  isPlatformLlmConfigured,
  type QuotaStatus,
} from "@/lib/llm/quota";

export {
  LlmResolveError,
  resolveLlmCredentials,
  resolvePlatformDefaults,
  type LlmCredentials,
} from "@/lib/llm/resolve";

export {
  getUsageSummary,
  recordLlmUsage,
  consumePlatformCredit,
  type UsageSummary,
} from "@/lib/llm/usage";

export { encryptSecret, decryptSecret, maskApiKey } from "@/lib/llm/crypto";
