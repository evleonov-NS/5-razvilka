import Link from "next/link";
import { Plus } from "lucide-react";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

/** Пустое состояние для explore и прочих списков вне журнала. */
export function EmptyState({
  title,
  description,
  actionLabel = "Новое решение",
  actionHref = "/decisions/new",
}: Props) {
  return (
    <div className="px-2 py-12 text-center">
      <p className="text-lg font-medium text-text">{title}</p>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
      {actionHref ? (
        <Link
          href={actionHref}
          className={`mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
