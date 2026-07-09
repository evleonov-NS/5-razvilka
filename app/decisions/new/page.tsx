import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { versionLabel } from "@/lib/version";

export default function NewDecisionPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <Link
        href="/cabinet"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        В журнал
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Новое решение</h1>
      <p className="mt-2 text-[var(--muted)]">
        Форма создания и генерация сценариев — этап 4 (после LLM-слоя).
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-12 text-center">
        <p className="text-lg font-medium">Скоро…</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Здесь будет форма: название, контекст, горизонт, тип — и вызов модели.
        </p>
      </div>

      <footer className="mt-auto pt-12 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
