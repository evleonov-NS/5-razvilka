type Props = {
  label?: string;
};

/** Компактное состояние загрузки для страниц App Router. */
export function LoadingState({ label = "Загрузка…" }: Props) {
  return (
    <div
      className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-sm text-text-muted">{label}</p>
      <div className="mt-6 space-y-4">
        <div className="h-8 w-2/3 max-w-md animate-pulse rounded-md bg-surface-2" />
        <div className="h-4 w-1/3 max-w-xs animate-pulse rounded-md bg-surface-2" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
          <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
          <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
        </div>
      </div>
    </div>
  );
}
