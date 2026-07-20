import Link from "next/link";
import {
  DECISION_PRESETS,
  PRESET_CHIP_ORDER,
} from "@/lib/presets";
import { GhostResultPreview } from "@/components/cabinet/GhostResultPreview";
import { landingFocus } from "@/components/landing/landingLayout";

/** Пустой журнал: приглашение с чипсами и призрачным превью. */
export function JournalEmptyState() {
  return (
    <div className="max-w-[54ch]">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
        С чего начнём?
      </h2>
      <p className="mt-3 text-base leading-relaxed text-text-muted">
        Опишите решение или привычку — за минуту увидите три сценария развития,
        слабые места и что можно сделать уже сейчас.
      </p>

      <p className="mt-8 text-sm text-text-muted">Например:</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_CHIP_ORDER.map((id) => {
          const preset = DECISION_PRESETS[id];
          return (
            <Link
              key={id}
              href={`/decisions/new?preset=${id}`}
              className={`inline-flex h-9 items-center rounded-full border border-border bg-surface px-4 text-sm text-text transition-colors hover:border-accent hover:text-accent-ink ${landingFocus}`}
            >
              {preset.chipLabel}
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <Link
          href="/decisions/new"
          className={`inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
        >
          Разобрать своё решение
        </Link>
      </div>

      <GhostResultPreview />
    </div>
  );
}
