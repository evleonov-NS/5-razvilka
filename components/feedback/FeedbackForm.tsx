"use client";

import { useState } from "react";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  defaultEmail?: string | null;
};

export function FeedbackForm({ defaultEmail }: Props) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || sent) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) throw new Error(body?.error ?? "Не удалось отправить");
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <p className="text-base text-text" role="status">
        Сообщение отправлено
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="feedback-message"
          className="block text-xs font-medium text-text-muted"
        >
          Сообщение
        </label>
        <textarea
          id="feedback-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>
      <div>
        <label
          htmlFor="feedback-email"
          className="block text-xs font-medium text-text-muted"
        >
          Email (необязательно)
        </label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>
      {error ? (
        <p className="text-sm text-accent-ink" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={sending}
        className={`inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-50 ${landingFocus}`}
      >
        {sending ? "Отправляем…" : "Отправить"}
      </button>
    </form>
  );
}
