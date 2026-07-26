import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Блок ошибки с опциональной кнопкой действия (retry / назад). */
export function ErrorMessage({
  title = "Что-то пошло не так",
  message,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div
      className="rounded-lg border border-border bg-surface px-6 py-10 text-center"
      role="alert"
    >
      <p className="text-lg font-medium text-text">{title}</p>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={`mt-6 inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
