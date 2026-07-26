"use client";

import { useCallback, useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function DemoDataPanel() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"load" | "delete" | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/user/demo-data");
      const body = (await res.json().catch(() => null)) as {
        count?: number;
        error?: string;
      } | null;
      if (!res.ok) throw new Error(body?.error ?? "Ошибка загрузки");
      setCount(body?.count ?? 0);
      setStatus("idle");
      setMessage(null);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Ошибка");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleLoad() {
    if (busy) return;
    setBusy("load");
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/user/demo-data", { method: "POST" });
      const body = (await res.json().catch(() => null)) as {
        count?: number;
        created?: number;
        error?: string;
      } | null;
      if (!res.ok) throw new Error(body?.error ?? "Не удалось загрузить");
      setCount(body?.count ?? body?.created ?? 0);
      setStatus("success");
      setMessage(`Загружено демо-решений: ${body?.created ?? body?.count ?? 0}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (busy) return;
    const ok = window.confirm(
      "Удалить все демо-решения с префиксом «[Демо]»? Свои карточки не затронутся.",
    );
    if (!ok) return;

    setBusy("delete");
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/user/demo-data", { method: "DELETE" });
      const body = (await res.json().catch(() => null)) as {
        deleted?: number;
        error?: string;
      } | null;
      if (!res.ok) throw new Error(body?.error ?? "Не удалось удалить");
      setCount(0);
      setStatus("success");
      setMessage(`Удалено: ${body?.deleted ?? 0}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-medium text-text">Демо-данные</h2>
      <p className="mt-1 text-xs text-text-muted">
        Учебные решения с префиксом «[Демо]» для журнала и ленты. Повторная
        загрузка заменяет только их.
      </p>

      <p className="mt-4 text-sm text-text" aria-live="polite">
        {status === "loading" && !busy
          ? "Считаем…"
          : `${count} демо-решений`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleLoad()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          {busy === "load" ? "Загружаем…" : "Загрузить демо-данные"}
        </button>
        <button
          type="button"
          disabled={busy !== null || count === 0}
          onClick={() => void handleDelete()}
          className="rounded-md border border-border px-4 py-2 text-sm text-text transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          {busy === "delete" ? "Удаляем…" : "Удалить демо-данные"}
        </button>
      </div>

      {message ? (
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-accent-ink" : "text-text-muted"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
