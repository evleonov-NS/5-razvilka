"use client";

import Link from "next/link";
import { useState } from "react";
import { DecisionTree } from "@/components/DecisionTree";
import { ErrorMessage } from "@/components/ErrorMessage";
import { landingFocus } from "@/components/landing/landingLayout";
import type { TreeResponse } from "@/lib/validators";

type TreeUiState =
  | "tree_idle"
  | "tree_generating"
  | "tree_ready"
  | "tree_error";

type Props = {
  decisionId: string;
  initialTree: TreeResponse | null;
};

/** Секция дерева: idle → generating → ready / error (ADR-008). */
export function TreeSection({ decisionId, initialTree }: Props) {
  const [tree, setTree] = useState<TreeResponse | null>(initialTree);
  const [state, setState] = useState<TreeUiState>(
    initialTree ? "tree_ready" : "tree_idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [needSettings, setNeedSettings] = useState(false);

  async function generateTree() {
    if (state === "tree_generating") return;

    setError(null);
    setNeedSettings(false);
    setState("tree_generating");

    try {
      const res = await fetch(`/api/decisions/${decisionId}/tree`, {
        method: "POST",
      });

      const body = (await res.json().catch(() => null)) as {
        tree?: TreeResponse;
        error?: string;
        code?: string;
        settingsPath?: string;
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
          body?.error ??
            "Не удалось сгенерировать дерево. Попробуйте ещё раз.",
        );
        setState("tree_error");
        return;
      }

      if (!body?.tree) {
        setError("Пустой ответ сервера. Попробуйте ещё раз.");
        setState("tree_error");
        return;
      }

      setTree(body.tree);
      setState("tree_ready");
    } catch {
      setError("Сеть недоступна. Проверьте соединение и попробуйте снова.");
      setState("tree_error");
    }
  }

  return (
    <section className="mt-12">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text">
        Дерево развилок
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Ключевые точки выбора и куда они ведут. Генерируется отдельно от
        сценариев.
      </p>

      <div className="mt-6">
        {state === "tree_ready" && tree ? (
          <DecisionTree tree={tree} />
        ) : null}

        {state === "tree_idle" ? (
          <div className="rounded-lg border border-border bg-surface px-6 py-8 text-center">
            <p className="text-sm text-text-muted">
              Дерево ещё не построено. Можно сгенерировать сейчас или вернуться
              позже.
            </p>
            <button
              type="button"
              onClick={generateTree}
              className={`mt-6 inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
            >
              Сгенерировать дерево развилок
            </button>
          </div>
        ) : null}

        {state === "tree_generating" ? (
          <div
            className="rounded-lg border border-border bg-surface px-6 py-8"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <p className="text-sm text-text-muted">Строим дерево развилок…</p>
            <div className="mt-6 space-y-3">
              <div className="h-5 w-2/3 max-w-sm animate-pulse rounded-md bg-surface-2" />
              <div className="h-4 w-1/2 max-w-xs animate-pulse rounded-md bg-surface-2" />
              <div className="mt-4 space-y-3 border-l border-border pl-5">
                <div className="h-4 w-3/4 max-w-md animate-pulse rounded-md bg-surface-2" />
                <div className="h-4 w-2/3 max-w-sm animate-pulse rounded-md bg-surface-2" />
              </div>
            </div>
          </div>
        ) : null}

        {state === "tree_error" ? (
          <div className="space-y-4">
            <ErrorMessage
              title="Не удалось построить дерево"
              message={error ?? "Попробуйте ещё раз."}
              actionLabel="Повторить"
              onAction={generateTree}
            />
            {needSettings ? (
              <p className="text-center text-sm text-text-muted">
                <Link
                  href="/cabinet/settings"
                  className={`text-accent-ink hover:underline ${landingFocus}`}
                >
                  Открыть настройки API
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
