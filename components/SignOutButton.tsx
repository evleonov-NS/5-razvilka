"use client";

import { useState } from "react";

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
      className="w-full rounded-lg border border-sky-200 bg-white/80 px-3 py-2 text-sm font-medium text-sky-900 transition hover:bg-white disabled:opacity-50"
    >
      {loading ? "Выход…" : "Выйти"}
    </button>
  );
}
