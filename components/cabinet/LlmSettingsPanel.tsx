"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LlmProviderKind } from "@prisma/client";

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
};

export function LlmSettingsPanel() {
  const [data, setData] = useState<LoadState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  if (loading && !data) {
    return (
      <p className="text-sm text-text-muted" aria-live="polite">
        Загрузка настроек API…
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-accent-ink" role="alert">
        {error ?? "Нет данных"}
      </p>
    );
  }

  const { quota, usage, settings } = data;

  return (
    <div className="space-y-8">
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

      <section className="rounded-lg border border-border bg-surface p-5">
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

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-text">Стоимость запросов</h2>
        <p className="mt-1 text-xs text-text-muted">
          Оценка по прайсу каталога (не чек провайдера). Появится после
          генераций с учётом токенов.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-text-faint">Запросов</dt>
            <dd className="mt-0.5 font-medium text-text">{usage.requestCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-faint">Оценка</dt>
            <dd className="mt-0.5 font-medium text-text">{usage.costLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-faint">Токены in</dt>
            <dd className="mt-0.5 font-medium text-text">
              {usage.promptTokens.toLocaleString("ru-RU")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-faint">Токены out</dt>
            <dd className="mt-0.5 font-medium text-text">
              {usage.completionTokens.toLocaleString("ru-RU")}
            </dd>
          </div>
        </dl>

        {usage.recent.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">
            Пока нет учтённых запросов.{" "}
            <Link
              href="/decisions/new"
              className="text-accent-ink underline-offset-2 hover:underline"
            >
              Создать разбор
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {usage.recent.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-text">
                    {row.provider} · {row.model}
                  </p>
                  <p className="text-xs text-text-faint">
                    {new Date(row.createdAt).toLocaleString("ru-RU")} ·{" "}
                    {row.billedTo === "USER" ? "свой ключ" : "платформа"} ·{" "}
                    {row.promptTokens + row.completionTokens} ток.
                  </p>
                </div>
                <p className="shrink-0 font-medium text-text">{row.costLabel}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
