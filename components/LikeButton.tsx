"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  decisionId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ decisionId, initialLiked, initialCount }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/decisions/${decisionId}/like`, {
        method: "POST",
      });

      if (res.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        router.push(
          `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Не удалось поставить лайк");
      }

      const data = (await res.json()) as { liked: boolean; likesCount: number };
      setLiked(data.liked);
      setCount(data.likesCount);
      router.refresh();
    } catch (err) {
      setLiked(prevLiked);
      setCount(prevCount);
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-pressed={liked}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors disabled:opacity-50 ${landingFocus} ${
          liked
            ? "bg-accent/15 text-accent-ink"
            : "text-text-muted hover:bg-surface-2 hover:text-text"
        }`}
      >
        <ThumbsUp
          className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
          aria-hidden
        />
        <span>{count}</span>
        <span className="sr-only">
          {liked ? "Убрать лайк" : "Поставить лайк"}
        </span>
      </button>
      {error ? <span className="mt-1 text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
