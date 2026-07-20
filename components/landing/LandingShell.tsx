"use client";

import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingThemeProvider } from "@/components/landing/LandingThemeProvider";

/** Клиентская оболочка лендинга: шапка и тема в одном дереве. */
export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <LandingThemeProvider>
      <LandingHeader />
      {children}
      <LandingFooter />
    </LandingThemeProvider>
  );
}
