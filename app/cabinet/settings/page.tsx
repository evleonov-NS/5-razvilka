import { Settings } from "lucide-react";
import { versionLabel } from "@/lib/version";

export default function CabinetSettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Личный кабинет</h1>
          <h2 className="mt-1 text-lg text-[var(--muted)]">Настройки</h2>
        </header>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
          <Settings className="h-10 w-10 text-[var(--muted)]" aria-hidden />
          <p className="mt-4 text-lg font-medium">Скоро…</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Здесь появятся настройки профиля и уведомлений.
          </p>
        </div>
      </div>

      <footer className="border-t border-[var(--border)] px-8 py-4 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
