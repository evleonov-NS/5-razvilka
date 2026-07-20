import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Оболочка /register с переключателем темы. */
export function RegisterShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 flex justify-end">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
