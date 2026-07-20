"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";
const LEGACY_KEY = "razvilka-landing-theme";

type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage недоступен
  }
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.classList.remove("dark", "light");
  root.classList.add(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // игнор
  }
  // два rAF — снять блокировку после применения стилей
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

/** Единственный клиентский переключатель темы (класс на <html>). */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = document.documentElement.classList.contains("dark")
      ? "dark"
      : document.documentElement.classList.contains("light")
        ? "light"
        : readTheme();
    setTheme(current);
    setReady(true);
  }, []);

  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-border-strong hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
      aria-label="Переключить тему"
      aria-pressed={isDark}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      suppressHydrationWarning
    >
      {!ready ? (
        <span className="h-4 w-4" aria-hidden="true" />
      ) : isDark ? (
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
          <path
            d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5 5.5 5.5 0 1 0 13.5 9.2Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
