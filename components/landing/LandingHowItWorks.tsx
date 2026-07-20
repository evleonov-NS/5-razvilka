import {
  landingH2,
  landingLead,
  landingSection,
} from "@/components/landing/landingLayout";

const steps = [
  {
    n: "01",
    title: "Описать решение и горизонт",
    body: "Сформулируй выбор или привычку, добавь контекст и срок, на котором смотришь последствия.",
  },
  {
    n: "02",
    title: "Получить сценарии и pre-mortem",
    body: "Три связных сценария будущего и разбор: почему может провалиться и что сделать уже сейчас.",
  },
  {
    n: "03",
    title: "Отметить исход и взять урок",
    body: "Когда факт известен — сверить прогноз с реальностью и зафиксировать один урок.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section className={landingSection}>
      <h2 className={landingH2}>Как это работает</h2>
      <p className={landingLead}>
        Три шага от описания выбора до калибровки по факту.
      </p>

      <ol className="relative mt-10 space-y-10 md:mt-12">
        <svg
          className="pointer-events-none absolute left-4 top-2 hidden h-[calc(100%-0.5rem)] w-6 text-border-strong sm:block"
          viewBox="0 0 24 400"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M6 0 V130"
            stroke="currentColor"
            strokeWidth="0.75"
            fill="none"
          />
          <path
            d="M6 130 C6 160 18 170 18 200"
            stroke="currentColor"
            strokeWidth="0.75"
            fill="none"
          />
          <path
            d="M18 200 C18 230 6 240 6 270"
            stroke="currentColor"
            strokeWidth="0.75"
            fill="none"
          />
          <path
            d="M6 270 V400"
            stroke="currentColor"
            strokeWidth="0.75"
            fill="none"
          />
        </svg>

        {steps.map((step) => (
          <li key={step.n} className="relative flex gap-5 sm:gap-8">
            <span
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-sm tabular-nums text-accent-ink"
              aria-hidden="true"
            >
              {step.n}
            </span>
            <div>
              <h3 className="text-lg font-medium text-text">{step.title}</h3>
              <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-text-muted">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
