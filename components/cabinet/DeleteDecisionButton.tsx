"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  decisionId: string;
  decisionTitle: string;
};

export function DeleteDecisionButton({ decisionId, decisionTitle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Удалить решение «${decisionTitle}»? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/decisions/${decisionId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Не удалось удалить");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title="Удалить"
        className={`rounded-md p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 ${landingFocus}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        <span className="sr-only">Удалить</span>
      </button>
      {error ? (
        <span className="mt-1 max-w-[10rem] text-right text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}
