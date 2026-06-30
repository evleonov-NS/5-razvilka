"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DbProfile, DbProfileInfo } from "@/lib/view-db/config";

type Props = {
  profiles: DbProfileInfo[];
  current: DbProfile;
};

export function DbSelector({ profiles, current }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function selectProfile(profile: DbProfile) {
    setError(null);

    const info = profiles.find((p) => p.id === profile);
    if (!info?.configured) {
      setError(
        profile === "prod"
          ? "Задайте DATABASE_URL_PROD в .env для рабочей БД"
          : "Задайте DATABASE_URL в .env",
      );
      return;
    }

    const res = await fetch("/api/view-db/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Не удалось переключить БД");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="mb-3 text-sm font-medium">База данных</p>
      <div className="flex flex-wrap gap-2">
        {profiles.map((profile) => {
          const active = profile.id === current;
          const disabled = !profile.configured || pending;

          return (
            <button
              key={profile.id}
              type="button"
              disabled={disabled}
              onClick={() => selectProfile(profile.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] bg-neutral-50 hover:bg-neutral-100"
              } ${disabled && !active ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {profile.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {profiles.find((p) => p.id === current)?.description}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
