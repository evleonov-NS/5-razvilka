"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { landingFocus } from "@/components/landing/landingLayout";
import { SCENARIO_KIND_LABELS } from "@/lib/decision-labels";

export type ReviewResult = {
  outcome: string;
  closestScenario: "OPTIMISTIC" | "BASE" | "PESSIMISTIC";
  missed: string;
  lesson: string;
};

type ReviewUiState = "idle" | "generating" | "ready" | "error";

type Props = {
  decisionId: string;
  initialReview: ReviewResult | null;
};

/** Форма исхода и результат ревью (промпт 9.3). */
export function ReviewSection({ decisionId, initialReview }: Props) {
  const [review, setReview] = useState<ReviewResult | null>(initialReview);
  const [outcome, setOutcome] = useState(initialReview?.outcome ?? "");
  const [state, setState] = useState<ReviewUiState>(
    initialReview ? "ready" : "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [needSettings, setNeedSettings] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "generating") return;

    const trimmed = outcome.trim();
    if (!trimmed) {
      setError("Опишите, чем всё закончилось.");
      setState("error");
      return;
    }

    setError(null);
    setNeedSettings(false);
    setState("generating");

    try {
      const res = await fetch(`/api/decisions/${decisionId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: trimmed }),
      });

      const body = (await res.json().catch(() => null)) as {
        outcome?: string;
        closestScenario?: ReviewResult["closestScenario"];
        missed?: string;
        lesson?: string;
        error?: string;
        code?: string;
      } | null;

      if (!res.ok) {
        const code = body?.code;
        if (
          code === "NEED_API_KEY" ||
          code === "NO_PLATFORM_KEY" ||
          code === "INVALID_KEY"
        ) {
          setNeedSettings(true);
        }
        setError(
          body?.error ?? "Не удалось получить ревью. Попробуйте ещё раз.",
        );
        setState("error");
        return;
      }

      if (
        !body?.outcome ||
        !body.closestScenario ||
        !body.missed ||
        !body.lesson
      ) {
        setError("Пустой ответ сервера. Попробуйте ещё раз.");
        setState("error");
        return;
      }

      setReview({
        outcome: body.outcome,
        closestScenario: body.closestScenario,
        missed: body.missed,
        lesson: body.lesson,
      });
      setState("ready");
    } catch {
      setError("Сеть недоступна. Проверьте соединение и попробуйте снова.");
      setState("error");
    }
  }

  if (state === "ready" && review) {
    const kindLabel =
      SCENARIO_KIND_LABELS[review.closestScenario] ?? review.closestScenario;

    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-faint">
            Что получилось
          </p>
          <p className="mt-2 text-base leading-relaxed text-text">
            {review.outcome}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-text-faint">
            Ближе к сценарию
          </p>
          <p className="mt-2">
            <span className="inline-block rounded border border-accent bg-accent/15 px-2 py-0.5 text-xs uppercase tracking-wider text-accent-ink">
              {kindLabel}
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-text-faint">
            Что упущено
          </p>
          <p className="mt-2 text-base leading-relaxed text-text">
            {review.missed}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-text-faint">
            Один урок
          </p>
          <p className="mt-2 rounded-md bg-surface-2 p-4 text-base leading-relaxed text-text">
            {review.lesson}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="outcome"
            className="block text-sm font-medium text-text"
          >
            Что получилось на самом деле?
          </label>
          <p className="mt-1 text-sm text-text-muted">
            Коротко опишите факт: как развернулось решение к концу горизонта.
          </p>
          <textarea
            id="outcome"
            name="outcome"
            rows={6}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            disabled={state === "generating"}
            placeholder="Например: через год перешёл в другую компанию, роль чуть ниже ожиданий…"
            className={`mt-3 w-full resize-y rounded-md border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-faint focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60 ${landingFocus}`}
          />
        </div>

        <button
          type="submit"
          disabled={state === "generating" || !outcome.trim()}
          className={`inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${landingFocus}`}
        >
          {state === "generating" ? "Сверяем с прогнозом…" : "Получить ревью"}
        </button>
      </form>

      {state === "generating" ? (
        <p className="text-sm text-text-muted" aria-live="polite">
          Модель сравнивает факт с тремя сценариями и формулирует один урок…
        </p>
      ) : null}

      {state === "error" && error ? (
        <div className="space-y-3">
          <ErrorMessage
            title="Не удалось получить ревью"
            message={error}
            actionLabel="Повторить"
            onAction={() => {
              setError(null);
              setState("idle");
            }}
          />
          {needSettings ? (
            <p className="text-center text-sm text-text-muted">
              <Link
                href="/cabinet/settings"
                className={`text-accent underline-offset-2 hover:underline ${landingFocus}`}
              >
                Открыть настройки API
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
