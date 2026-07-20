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
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
        Как это работает
      </h2>
      <p className="mt-4 max-w-[40ch] text-[var(--landing-muted)]">
        Три шага от описания выбора до калибровки по факту.
      </p>

      <ol className="relative mt-14 space-y-0">
        {/* линия-ветка, соединяющая шаги */}
        <svg
          className="pointer-events-none absolute left-[1.15rem] top-3 hidden h-[calc(100%-1.5rem)] w-8 text-[var(--landing-line)] sm:block"
          viewBox="0 0 32 400"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M8 0 V130"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
          />
          <path
            d="M8 130 C8 160 24 170 24 200"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
          />
          <path
            d="M24 200 C24 230 8 240 8 270"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
          />
          <path
            d="M8 270 V400"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
          />
        </svg>

        {steps.map((step) => (
          <li
            key={step.n}
            className="relative flex gap-5 py-6 sm:gap-8 sm:py-8"
          >
            <span
              className="relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg)] text-xs font-medium text-[var(--landing-accent)]"
              aria-hidden="true"
            >
              {step.n}
            </span>
            <div>
              <h3 className="text-lg font-medium text-[var(--landing-fg)]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-[var(--landing-muted)]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
