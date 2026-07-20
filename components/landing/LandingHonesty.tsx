const limits = [
  "Не предсказывает будущее и не обещает точность прогноза.",
  "Не даёт готовый ответ «делай / не делай».",
  "Не использует проценты вероятности — только метки LOW / MEDIUM / HIGH.",
  "Не заменяет юридическую, медицинскую и финансовую консультацию.",
] as const;

export function LandingHonesty() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <div className="max-w-2xl border-l-2 border-[var(--landing-accent)] pl-6 sm:pl-8">
        <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
          Честная рамка
        </h2>
        <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-[var(--landing-muted)]">
          Развилка раскладывает варианты и риски. Это инструмент мышления, а не
          оракул и не замена профессиональной экспертизы.
        </p>
        <ul className="mt-8 space-y-3">
          {limits.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-sm leading-relaxed text-[var(--landing-fg)]"
            >
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--landing-accent)]"
                aria-hidden="true"
              />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
