"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type LandingTheme = "dark" | "light";

const STORAGE_KEY = "razvilka-landing-theme";

const THEME_VARS: Record<LandingTheme, CSSProperties> = {
  dark: {
    ["--landing-bg" as string]: "#1a1b1d",
    ["--landing-fg" as string]: "#ebe8e3",
    ["--landing-muted" as string]: "#9c9891",
    ["--landing-border" as string]: "#2e3034",
    ["--landing-surface" as string]: "#222326",
    ["--landing-line" as string]: "#3a3c40",
    ["--landing-accent" as string]: "#d4a35c",
    ["--landing-accent-hover" as string]: "#e0b36e",
    ["--landing-accent-fg" as string]: "#1a1b1d",
  },
  light: {
    ["--landing-bg" as string]: "#f3f2ef",
    ["--landing-fg" as string]: "#1c1b19",
    ["--landing-muted" as string]: "#5c5954",
    ["--landing-border" as string]: "#d8d5ce",
    ["--landing-surface" as string]: "#ffffff",
    ["--landing-line" as string]: "#c4c0b7",
    ["--landing-accent" as string]: "#b8893a",
    ["--landing-accent-hover" as string]: "#a67a32",
    ["--landing-accent-fg" as string]: "#ffffff",
  },
};

type LandingThemeContextValue = {
  theme: LandingTheme;
  setTheme: (theme: LandingTheme) => void;
  toggleTheme: () => void;
};

const LandingThemeContext = createContext<LandingThemeContextValue | null>(
  null,
);

function readStoredTheme(): LandingTheme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    // localStorage недоступен
  }
  return null;
}

function preferSystemTheme(): LandingTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

type ProviderProps = {
  children: ReactNode;
  className?: string;
};

/** Тема лендинга: переменные задаём inline — так смена гарантированно видна. */
export function LandingThemeProvider({ children, className = "" }: ProviderProps) {
  const [theme, setThemeState] = useState<LandingTheme>("dark");

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored ?? preferSystemTheme());
  }, []);

  const setTheme = useCallback((next: LandingTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // игнор
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: LandingTheme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // игнор
      }
      return next;
    });
  }, []);

  return (
    <LandingThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div
        className={`landing landing--${theme} min-h-screen ${className}`}
        data-theme={theme}
        style={THEME_VARS[theme]}
      >
        {children}
      </div>
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme(): LandingThemeContextValue {
  const ctx = useContext(LandingThemeContext);
  if (!ctx) {
    throw new Error("useLandingTheme: вне LandingThemeProvider");
  }
  return ctx;
}
