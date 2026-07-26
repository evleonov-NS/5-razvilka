"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { LlmProviderKind } from "@prisma/client";
import { CostUsagePanel } from "@/components/cabinet/CostUsagePanel";

type ProviderPublic = {
  id: LlmProviderKind;
  label: string;
  docsUrl: string;
  defaultModel: string;
  models: Array<{
    id: string;
    label: string;
    pricing: { inputPer1M: number; outputPer1M: number };
  }>;
};

type QuotaDto = {
  isOwner: boolean;
  hasOwnKey: boolean;
  canGenerate: boolean;
  freeLimit: number;
  freeRemaining: number | null;
  platformCreditsUsed: number;
  message: string | null;
  reason: string | null;
  platformKeyEnabled: boolean;
};

type PeriodCost = {
  key: string;
  label: string;
  requestCount: number;
  costUsdLabel: string;
  costRubLabel: string | null;
};

type PeriodsDto = {
  rate: number | null;
  rateLabel: string | null;
  personal: PeriodCost[];
  platform: PeriodCost[] | null;
};

type UsageDto = {
  requestCount: number;
  promptTokens: number;
  completionTokens: number;
  costUsdMicros: number;
  costLabel: string;
  recent: Array<{
    id: string;
    provider: LlmProviderKind;
    model: string;
    promptTokens: number;
    completionTokens: number;
    costLabel: string;
    billedTo: string;
    createdAt: string;
  }>;
};

type SettingsDto = {
  provider: LlmProviderKind;
  model: string;
  hasApiKey: boolean;
  apiKeyPreview: string | null;
};

type LoadState = {
  providers: ProviderPublic[];
  settings: SettingsDto;
  quota: QuotaDto;
  usage: UsageDto;
  periods: PeriodsDto;
  appSettings: { platformKeyEnabled: boolean } | null;
};

export function LlmSettingsPanel({
  demoSlot,
}: {
  /** Демо и прочие блоки правой колонки над «Доступом». */
  demoSlot?: ReactNode;
}) {
  const [data, setData] = useState<LoadState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingPlatform, setTogglingPlatform] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [provider, setProvider] = useState<LlmProviderKind>("DEEPSEEK");
  const [model, setModel] = useState("deepseek-chat");
  const [apiKey, setApiKey] = useState("");
  const [clearKey, setClearKey] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/llm");
      const body = (await res.json().catch(() => null)) as
        | (LoadState & { error?: string })
        | null;
      if (!res.ok) {
        throw new Error(body?.error ?? "Не удалось загрузить настройки");
      }
      if (!body?.settings) {
        throw new Error("Пустой ответ сервера");
      }
      setData(body);
      setProvider(body.settings.provider);
      setModel(body.settings.model);
      setApiKey("");
      setClearKey(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentProvider = useMemo(
    () => data?.providers.find((p) => p.id === provider),
    [data?.providers, provider],
  );

  const models = currentProvider?.models ?? [];

  function onProviderChange(next: LlmProviderKind) {
    setProvider(next);
    const p = data?.providers.find((x) => x.id === next);
    if (p) setModel(p.defaultModel);
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const payload: {
        provider: LlmProviderKind;
        model: string;
        apiKey?: string | null;
      } = { provider, model };

      if (clearKey) {
        payload.apiKey = "";
      } else if (apiKey.trim()) {
        payload.apiKey = apiKey.trim();
      }

      const res = await fetch("/api/settings/llm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        settings?: SettingsDto;
        quota?: QuotaDto;
      } | null;

      if (!res.ok) {
        throw new Error(body?.error ?? "Не удалось сохранить");
      }

      setApiKey("");
      setClearKey(false);
      setSaved(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handlePlatformToggle(enabled: boolean) {
    if (togglingPlatform || !data?.quota.isOwner) return;
    setTogglingPlatform(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformKeyEnabled: enabled }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        platformKeyEnabled?: boolean;
      } | null;
      if (!res.ok) {
        throw new Error(body?.error ?? "Не удалось сохранить флаг");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setTogglingPlatform(false);
    }
  }

  if (loading && !data) {
    return (
      <p
        className="text-sm text-text-muted lg:col-span-2"
        aria-live="polite"
      >
        Загрузка настроек API…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-accent-ink lg:col-span-2" role="alert">
        {error ?? "Нет данных"}
      </p>
    );
  }

  const { quota, usage, settings, periods } = data;
  const platformEnabled =
    data.appSettings?.platformKeyEnabled ?? quota.platformKeyEnabled;

  // contents — дети участвуют в родительской сетке настроек (стоимость на 2 колонки)
  return (
    <div className="contents">
      <div className="space-y-8">
        {demoSlot}
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-medium text-text">Доступ к разборам</h2>
          <p className="mt-1 text-xs text-text-muted">
            По умолчанию — DeepSeek на стороне сервиса. Свой ключ снимает лимит.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-text">
            {quota.isOwner ? (
              <li>
                Режим владельца: безлимитные разборы на платформенном ключе.
              </li>
            ) : quota.hasOwnKey ? (
              <li>Подключён свой API — разборы без лимита сервиса.</li>
            ) : !quota.platformKeyEnabled ? (
              <li className="text-accent-ink">
                Платформенный ключ отключён. Добавьте свой API ниже.
              </li>
            ) : quota.freeRemaining !== null && quota.freeRemaining > 0 ? (
              <li>
                Остался{" "}
                <span className="font-medium text-accent-ink">
                  {quota.freeRemaining}
                </span>{" "}
                бесплатный тестовый разбор.
              </li>
            ) : (
              <li className="text-accent-ink">
                Бесплатный разбор использован. Добавьте свой API ниже, чтобы
                продолжить.
              </li>
            )}
            {!quota.canGenerate && quota.message ? (
              <li className="text-text-muted">{quota.message}</li>
            ) : null}
          </ul>
        </section>

        {quota.isOwner ? (
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-medium text-text">
              Токен по умолчанию
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Разрешить обычным пользователям один бесплатный разбор на
              платформенном ключе. Владелец всегда может пользоваться платформой.
            </p>
            <label className="mt-4 flex items-center gap-3 text-sm text-text">
              <input
                type="checkbox"
                checked={platformEnabled}
                disabled={togglingPlatform}
                onChange={(e) => void handlePlatformToggle(e.target.checked)}
              />
              Разрешить платформенный ключ (бесплатный разбор)
            </label>
            <p className="mt-3">
              <Link
                href="/cabinet/stats"
                className="text-sm text-accent-ink underline-offset-2 hover:underline"
              >
                Статистика и обратная связь →
              </Link>
            </p>
          </section>
        ) : null}
      </div>

      <div className="lg:col-span-2">
        <CostUsagePanel
          rateLabel={periods.rateLabel}
          personal={periods.personal}
          platform={periods.platform}
          totals={{
            requestCount: usage.requestCount,
            costLabel: usage.costLabel,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
          }}
          recent={usage.recent}
        />
      </div>

      <section className="rounded-lg border border-border bg-surface p-5 lg:col-span-2 lg:max-w-xl">
        <h2 className="text-sm font-medium text-text">API и модель</h2>
        <p className="mt-1 text-xs text-text-muted">
          DeepSeek, Qwen или OpenAI — ключ хранится в зашифрованном виде и не
          показывается целиком.
        </p>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="llm-provider"
              className="block text-xs font-medium text-text-muted"
            >
              Провайдер
            </label>
            <select
              id="llm-provider"
              value={provider}
              onChange={(e) =>
                onProviderChange(e.target.value as LlmProviderKind)
              }
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {data.providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {currentProvider ? (
              <p className="mt-1 text-xs text-text-faint">
                Ключ:{" "}
                <a
                  href={currentProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-ink underline-offset-2 hover:underline"
                >
                  кабинет провайдера
                </a>
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="llm-model"
              className="block text-xs font-medium text-text-muted"
            >
              Модель
            </label>
            <select
              id="llm-model"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setSaved(false);
              }}
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} · in ${m.pricing.inputPer1M}/1M · out $
                  {m.pricing.outputPer1M}/1M
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="llm-api-key"
              className="block text-xs font-medium text-text-muted"
            >
              API-ключ
            </label>
            <input
              id="llm-api-key"
              type="password"
              autoComplete="off"
              value={apiKey}
              disabled={clearKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setSaved(false);
              }}
              placeholder={
                settings.hasApiKey
                  ? `Сохранён: ${settings.apiKeyPreview ?? "****"}`
                  : "sk-… или ключ провайдера"
              }
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
            />
            {settings.hasApiKey ? (
              <label className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={clearKey}
                  onChange={(e) => {
                    setClearKey(e.target.checked);
                    if (e.target.checked) setApiKey("");
                    setSaved(false);
                  }}
                />
                Удалить сохранённый ключ
              </label>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-accent-ink" role="alert">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="text-sm text-text-muted" role="status">
              Сохранено.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          >
            {saving ? "Сохраняем…" : "Сохранить"}
          </button>
        </form>
      </section>
    </div>
  );
}
