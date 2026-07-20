"use client";

import { useLandingTheme } from "@/components/landing/LandingThemeProvider";

/** Переключатель светлой/тёмной темы лендинга (инлайн-SVG). */
export function LandingThemeToggle() {
  const { theme, toggleTheme } = useLandingTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--landing-border)] text-[var(--landing-muted)] transition-colors duration-200 hover:border-[var(--landing-muted)] hover:text-[var(--landing-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
      aria-label={isLight ? "Включить тёмную тему" : "Включить светлую тему"}
      title={isLight ? "Тёмная тема" : "Светлая тема"}
      aria-pressed={isLight}
    >
      {isLight ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5 5.5 5.5 0 1 0 13.5 9.2Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx="8"
            cy="8"
            r="3.25"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <path
            d="M8 1.5 V2.75 M8 13.25 V14.5 M1.5 8 H2.75 M13.25 8 H14.5 M3.4 3.4 L4.28 4.28 M11.72 11.72 L12.6 12.6 M12.6 3.4 L11.72 4.28 M4.28 11.72 L3.4 12.6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
