const theses = [
  {
    title: "Решения вслепую",
    body: "Важные выборы часто делаются без картины последствий — только интуиция и срочность.",
  },
  {
    title: "Риски задним числом",
    body: "Слабые места обычно видны уже после того, как выбор сделан и цена заплачена.",
  },
  {
    title: "Опыт не копится",
    body: "Прогноз редко сверяют с фактом — поэтому калибровка суждений не улучшается со временем.",
  },
] as const;

export function LandingProblem() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
        В чём проблема
      </h2>
      <p className="mt-4 max-w-[40ch] text-[var(--landing-muted)]">
        Три причины, из‑за которых развилки остаются непрозрачными.
      </p>
      <ul className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {theses.map((item) => (
          <li key={item.title}>
            <div
              className="mb-4 h-px w-10 bg-[var(--landing-accent)]"
              aria-hidden="true"
            />
            <h3 className="text-base font-medium text-[var(--landing-fg)]">
              {item.title}
            </h3>
            <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-[var(--landing-muted)]">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
