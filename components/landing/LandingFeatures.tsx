const blocks = [
  {
    title: "Три сценария будущего",
    body: "Оптимистичный, базовый и пессимистичный — связные нарративы на выбранный горизонт.",
  },
  {
    title: "Pre-mortem",
    body: "Предположение, что выбор провалился: причины и предупреждающие действия на сейчас.",
  },
  {
    title: "Дерево развилок",
    body: "Ключевые точки выбора и куда ведёт каждая ветка — без лишней детализации.",
  },
  {
    title: "Журнал решений",
    body: "Все разборы в одном месте: можно вернуться, сравнить и не терять контекст.",
  },
  {
    title: "Ревью фактического исхода",
    body: "Когда результат известен — сверка с прогнозом и один урок на будущее.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
        Что внутри разбора
      </h2>
      <p className="mt-4 max-w-[40ch] text-[var(--landing-muted)]">
        Пять частей, из которых складывается полный разбор решения.
      </p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block, i) => (
          <li
            key={block.title}
            className={`border-t border-[var(--landing-border)] pt-5 ${
              i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <h3 className="text-base font-medium text-[var(--landing-fg)]">
              {block.title}
            </h3>
            <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-[var(--landing-muted)]">
              {block.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
