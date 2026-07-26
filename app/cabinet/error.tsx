"use client";

import Link from "next/link";
import { ErrorMessage } from "@/components/ErrorMessage";
import { cabinetMain4xlLoose } from "@/components/cabinet/cabinetLayout";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CabinetError({ error, reset }: Props) {
  return (
    <div className={cabinetMain4xlLoose}>
      <ErrorMessage
        title="Не удалось открыть кабинет"
        message={
          error.message?.trim() ||
          "Попробуйте ещё раз или вернитесь на главную."
        }
        actionLabel="Повторить"
        onAction={reset}
      />
      <p className="mt-6 text-center">
        <Link
          href="/"
          className={`text-sm text-accent-ink hover:underline ${landingFocus}`}
        >
          На главную
        </Link>
      </p>
    </div>
  );
}
