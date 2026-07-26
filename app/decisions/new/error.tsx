"use client";

import Link from "next/link";
import { ErrorMessage } from "@/components/ErrorMessage";
import { cabinetMain2xlLoose } from "@/components/cabinet/cabinetLayout";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function NewDecisionError({ error, reset }: Props) {
  return (
    <div className={cabinetMain2xlLoose}>
      <ErrorMessage
        title="Не удалось открыть форму"
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
  );
}
