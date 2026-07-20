import {
  landingCard,
  landingH2,
  landingLead,
  landingSection,
} from "@/components/landing/landingLayout";

const blocks = [
  {
    title: "Три сценария будущего",
    body: "Оптимистичный, базовый и пессимистичный — связные нарративы на выбранный горизонт. Каждый сценарий показывает, как решение разворачивается во времени, без процентов и ложной точности.",
    span: true,
  },
  {
    title: "Pre-mortem",
    body: "Предположение, что выбор провалился: причины и предупреждающие действия на сейчас.",
    span: false,
  },
  {
    title: "Дерево развилок",
    body: "Ключевые точки выбора и куда ведёт каждая ветка — без лишней детализации.",
    span: false,
  },
  {
    title: "Журнал решений",
    body: "Все разборы в одном месте: можно вернуться, сравнить и не терять контекст.",
    span: false,
  },
  {
    title: "Ревью фактического исхода",
    body: "Когда результат известен — сверка с прогнозом и один урок на будущее.",
    span: false,
  },
] as const;

export function LandingFeatures() {
  return (
    <section className={landingSection}>
      <h2 className={landingH2}>Что внутри разбора</h2>
      <p className={landingLead}>
        Пять частей, из которых складывается полный разбор решения.
      </p>
      <ul className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <li
            key={block.title}
            className={`${landingCard} ${block.span ? "lg:col-span-2" : ""}`}
          >
            <h3 className="text-base font-medium text-text">{block.title}</h3>
            <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-text-muted">
              {block.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
