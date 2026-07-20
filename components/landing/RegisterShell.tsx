"use client";

import type { ReactNode } from "react";
import { LandingThemeProvider } from "@/components/landing/LandingThemeProvider";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";

/** Оболочка /register: тоггл темы внутри того же клиентского дерева, что и Provider. */
export function RegisterShell({ children }: { children: ReactNode }) {
  return (
    <LandingThemeProvider className="flex flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 flex justify-end">
          <LandingThemeToggle />
        </div>
        {children}
      </div>
    </LandingThemeProvider>
  );
}
