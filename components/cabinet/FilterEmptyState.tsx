import Link from "next/link";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  variant: "open" | "resolved";
  title: string;
  description: string;
};

/** Короткое пустое состояние для вкладок Открытые / Решённые. */
export function FilterEmptyState({ variant, title, description }: Props) {
  return (
    <div className="flex justify-center px-2 pt-16 md:pt-24">
      <div className="w-full max-w-[42ch] text-left">
        {variant === "open" ? (
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="text-text-faint"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M14 8.5V14l3.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="text-text-faint"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M9.5 14.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <h2 className="mt-5 text-lg font-medium text-text">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
        <Link
          href="/cabinet"
          className={`mt-6 inline-block text-sm text-accent-ink hover:underline ${landingFocus}`}
        >
          Перейти в журнал
        </Link>
      </div>
    </div>
  );
}
