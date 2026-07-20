import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: string;
};

function buildHref(basePath: string, page: number, query?: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function DecisionPagination({ page, totalPages, basePath, query }: Props) {
  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-6 flex items-center justify-between text-sm"
      aria-label="Пагинация"
    >
      {prevPage ? (
        <Link
          href={buildHref(basePath, prevPage, query)}
          className={`inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Назад
        </Link>
      ) : (
        <span />
      )}

      <span className="text-text-muted">
        Страница {page} из {totalPages}
      </span>

      {nextPage ? (
        <Link
          href={buildHref(basePath, nextPage, query)}
          className={`inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
        >
          Далее
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
