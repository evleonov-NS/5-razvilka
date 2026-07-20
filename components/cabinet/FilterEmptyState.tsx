import Link from "next/link";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  title: string;
  description: string;
  /** Дополнительная спокойная строка под описанием */
  hint?: string;
};

/** Короткое пустое состояние для вкладок Открытые / Решённые. */
export function FilterEmptyState({ title, description, hint }: Props) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-text-faint"
        aria-hidden="true"
      >
        <path
          d="M8 10h16M8 16h10M8 22h13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="4"
          y="5"
          width="24"
          height="22"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <h2 className="mt-5 text-lg font-medium text-text">{title}</h2>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-text-muted">
        {description}
      </p>
      {hint ? (
        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-text-muted">
          {hint}
        </p>
      ) : null}
      <Link
        href="/cabinet"
        className={`mt-6 text-sm text-accent-ink transition-colors hover:underline ${landingFocus}`}
      >
        Перейти в журнал
      </Link>
    </div>
  );
}
