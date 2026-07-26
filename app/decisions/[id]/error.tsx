"use client";

import Link from "next/link";
import { ErrorMessage } from "@/components/ErrorMessage";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DecisionDetailError({ error, reset }: Props) {
  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 md:px-8">
        <ErrorMessage
          title="Не удалось открыть разбор"
          message={
            error.message?.trim() ||
            "Попробуйте ещё раз или вернитесь в журнал."
          }
          actionLabel="Повторить"
          onAction={reset}
        />
        <p className="mt-6 text-center">
          <Link
            href="/cabinet"
            className={`text-sm text-accent-ink hover:underline ${landingFocus}`}
          >
            В журнал
          </Link>
        </p>
      </div>
    </div>
  );
}
