import {
  landingH2,
  landingLead,
  landingSection,
} from "@/components/landing/landingLayout";

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
    <section className={landingSection}>
      <h2 className={landingH2}>В чём проблема</h2>
      <p className={landingLead}>
        Три причины, из‑за которых развилки остаются непрозрачными.
      </p>
      <ul className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-6">
        {theses.map((item) => (
          <li key={item.title}>
            <div className="mb-4 h-px w-10 bg-accent" aria-hidden="true" />
            <h3 className="text-base font-medium text-text">{item.title}</h3>
            <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-text-muted">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
