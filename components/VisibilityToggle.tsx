"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe, Lock } from "lucide-react";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  decisionId: string;
  initialIsPublic: boolean;
};

export function VisibilityToggle({ decisionId, initialIsPublic }: Props) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !isPublic;

    if (next) {
      const confirmed = window.confirm(
        "Сделать разбор публичным? Его увидят другие пользователи в ленте «Сообщество». " +
          "Данные ревью (исход, урок) не показываются, контекст — с обрезкой.",
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/decisions/${decisionId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Не удалось изменить видимость");
      }

      const data = (await res.json()) as { isPublic: boolean };
      setIsPublic(data.isPublic);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors disabled:opacity-50 ${landingFocus} ${
          isPublic
            ? "border-accent bg-accent/15 text-accent-ink"
            : "border-border bg-surface text-text-muted hover:border-border-strong hover:bg-surface-2"
        }`}
      >
        {isPublic ? (
          <Globe className="h-4 w-4" aria-hidden />
        ) : (
          <Lock className="h-4 w-4" aria-hidden />
        )}
        {isPublic ? "Публичный разбор" : "Только для меня"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
