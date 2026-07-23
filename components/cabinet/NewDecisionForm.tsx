"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DecisionType, Horizon } from "@prisma/client";
import { getPreset } from "@/lib/presets";
import { landingFocus } from "@/components/landing/landingLayout";

const HORIZON_OPTIONS: { value: Horizon; label: string }[] = [
  { value: "THREE_MONTHS", label: "3 месяца" },
  { value: "ONE_YEAR", label: "1 год" },
  { value: "FIVE_YEARS", label: "5 лет" },
];

const TYPE_OPTIONS: { value: DecisionType; label: string }[] = [
  { value: "DECISION", label: "Решение" },
  { value: "HABIT", label: "Привычка" },
];

const GEN_STEPS = [
  "Разбираем контекст",
  "Строим три сценария",
  "Ищем слабые места",
  "Готовим разбор",
] as const;

const STEP_MS = 7000;
const MIN_WAIT_MS = 2800;

type Props = {
  presetId?: string | null;
};

export function NewDecisionForm({ presetId }: Props) {
  const router = useRouter();
  const preset = useMemo(() => getPreset(presetId), [presetId]);
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(preset?.title ?? "");
  const [context, setContext] = useState(preset?.context ?? "");
  const [horizon, setHorizon] = useState<Horizon>(preset?.horizon ?? "ONE_YEAR");
  const [type, setType] = useState<DecisionType>(preset?.type ?? "DECISION");
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needApiKey, setNeedApiKey] = useState(false);
  const [dirty, setDirty] = useState(false);

  const canSubmit = title.trim().length > 0 && context.trim().length > 0;
  const contextLen = context.trim().length;
  const contextShort = contextLen > 0 && contextLen < 80;

  const missingHint = !title.trim()
    ? !context.trim()
      ? "Укажите название и контекст"
      : "Укажите название"
    : !context.trim()
      ? "Опишите контекст"
      : null;

  // Автофокус только без пресета
  useEffect(() => {
    if (!preset) {
      titleRef.current?.focus();
    }
  }, [preset]);

  // beforeunload при реальных правках
  useEffect(() => {
    if (!dirty || generating) return;

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, generating]);

  useEffect(() => {
    if (!generating) return;

    const id = window.setInterval(() => {
      setStepIndex((prev) =>
        prev < GEN_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [generating]);

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || generating) return;

    setError(null);
    setNeedApiKey(false);
    setGenerating(true);
    setStepIndex(0);
    const started = Date.now();

    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          context: context.trim(),
          horizon,
          type,
        }),
      });

      const body = (await res.json().catch(() => null)) as {
        id?: string;
        error?: string;
        code?: string;
        settingsPath?: string;
      } | null;

      if (!res.ok) {
        if (body?.code === "NEED_API_KEY") {
          setNeedApiKey(true);
          throw new Error(
            body.error ??
              "Бесплатный разбор использован. Добавьте API-ключ в настройках.",
          );
        }
        throw new Error(body?.error ?? "Не удалось разобрать решение");
      }

      if (!body?.id) {
        throw new Error("Сервер не вернул идентификатор решения");
      }

      const elapsed = Date.now() - started;
      if (elapsed < MIN_WAIT_MS) {
        await new Promise((r) => setTimeout(r, MIN_WAIT_MS - elapsed));
      }

      setDirty(false);
      setStepIndex(GEN_STEPS.length - 1);
      router.push(`/decisions/${body.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка запроса");
      setGenerating(false);
    }
  }

  if (generating) {
    return (
      <div className="space-y-10" aria-live="polite" aria-busy="true">
        <div>
          <h2 className="font-[family-name:var(--font-landing-serif)] text-xl text-text">
            Готовим разбор
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Не закрывайте страницу — шаги ниже показывают ход ожидания.
          </p>
        </div>

        <ol className="space-y-3">
          {GEN_STEPS.map((label, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 text-sm transition-colors ${
                  active
                    ? "text-text"
                    : done
                      ? "text-text-muted"
                      : "text-text-faint"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    active
                      ? "border-accent bg-accent/15 text-accent-ink"
                      : done
                        ? "border-border bg-surface-2 text-text-muted"
                        : "border-border text-text-faint"
                  }`}
                  aria-hidden="true"
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={active ? "font-medium" : undefined}>{label}</span>
              </li>
            );
          })}
        </ol>

        <ul
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          aria-hidden="true"
        >
          {["Оптимистичный", "Базовый", "Пессимистичный"].map((label) => (
            <li
              key={label}
              className="min-h-[140px] rounded-lg border border-border bg-surface p-4"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
              <div className="mt-3 h-3 w-12 animate-pulse rounded bg-surface-2" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
                <div className="h-3 w-[90%] animate-pulse rounded bg-surface-2" />
                <div className="h-3 w-[75%] animate-pulse rounded bg-surface-2" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {preset ? (
        <p className="text-sm text-text-muted">
          Это пример — поправьте под свою ситуацию.
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text">
          Название
        </label>
        <input
          ref={titleRef}
          id="title"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          placeholder="Например: сменить работу в течение года"
          className={`mt-2 h-12 w-full rounded-md border border-border bg-surface px-4 text-base text-text outline-none transition placeholder:text-text-faint focus:border-accent-ink ${landingFocus}`}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium text-text">
          Контекст
        </label>
        <textarea
          id="context"
          name="context"
          value={context}
          onChange={(e) => {
            setContext(e.target.value);
            markDirty();
          }}
          rows={8}
          className={`mt-2 min-h-[180px] w-full resize-y rounded-md border border-border bg-surface px-4 py-3 text-base leading-relaxed text-text outline-none transition placeholder:text-text-faint focus:border-accent-ink ${landingFocus}`}
          placeholder="Кратко опишите ситуацию своими словами"
        />
        <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
          <p className="max-w-[48ch] text-sm text-text-muted">
            Что происходит сейчас, что вас держит, чего опасаетесь, какие есть
            ограничения.
          </p>
          <p className="shrink-0 tabular-nums text-xs text-text-faint">
            {contextLen} символов
          </p>
        </div>
        {contextShort ? (
          <p className="mt-1 text-sm text-text-muted">
            Коротковато, добавьте деталей: разбор будет точнее
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-text">Горизонт</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {HORIZON_OPTIONS.map((opt) => {
            const active = horizon === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setHorizon(opt.value);
                  markDirty();
                }}
                aria-pressed={active}
                className={`h-10 rounded-md border text-sm transition-colors ${landingFocus} ${
                  active
                    ? "border-accent bg-accent/15 text-accent-ink"
                    : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-text">Тип</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setType(opt.value);
                  markDirty();
                }}
                aria-pressed={active}
                className={`h-10 rounded-md border text-sm transition-colors ${landingFocus} ${
                  active
                    ? "border-accent bg-accent/15 text-accent-ink"
                    : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <button
          type="submit"
          disabled={!canSubmit || generating}
          className={`flex h-12 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px] ${landingFocus}`}
        >
          Разобрать
        </button>
        {missingHint ? (
          <p className="mt-2 text-sm text-text-muted">{missingHint}</p>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-md border border-border bg-surface-2 p-4">
            <p className="text-sm text-text">{error}</p>
            {needApiKey ? (
              <p className="mt-2 text-sm">
                <Link
                  href="/cabinet/settings"
                  className={`text-accent-ink hover:underline ${landingFocus}`}
                >
                  Открыть настройки API
                </Link>
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-text-muted">
                  Введённые данные сохранены — можно отправить снова.
                </p>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`mt-3 text-sm text-accent-ink hover:underline disabled:opacity-40 ${landingFocus}`}
                >
                  Попробовать снова
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </form>
  );
}
