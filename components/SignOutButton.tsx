"use client";

import { useState } from "react";
import { landingFocus } from "@/components/landing/landingLayout";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout failed");
      // Полная перезагрузка — сброс клиентского кэша сессии
      window.location.assign("/");
    } catch (error) {
      console.error("Ошибка выхода:", error);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={`w-full rounded-md border border-border bg-bg px-3 py-2 text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-2 disabled:opacity-50 ${landingFocus}`}
    >
      {loading ? "Выход…" : "Выйти"}
    </button>
  );
}
