import Link from "next/link";
import { Plus } from "lucide-react";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel = "Новое решение",
  actionHref = "/decisions/new",
}: Props) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-12 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      {actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
