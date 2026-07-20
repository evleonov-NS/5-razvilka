import {
  landingCard,
  landingH2,
  landingLead,
  landingSection,
} from "@/components/landing/landingLayout";

type Likelihood = "LOW" | "MEDIUM" | "HIGH";

const scenarios: {
  kind: string;
  label: string;
  likelihood: Likelihood;
  narrative: string;
}[] = [
  {
    kind: "OPTIMISTIC",
    label: "Оптимистичный",
    likelihood: "LOW",
    narrative:
      "За год находишь роль с более сильной командой и задачами, которые снимают ощущение потолка. Переход проходит без долгого простоя: семья и обязательства удаётся удержать в привычном ритме.",
  },
  {
    kind: "BASE",
    label: "Базовый",
    likelihood: "HIGH",
    narrative:
      "Поиск занимает заметную часть года. Предложения появляются неравномерно; часть из них слабее ожиданий. В итоге смена происходит, но с компромиссами по уровню роли или срокам выхода.",
  },
  {
    kind: "PESSIMISTIC",
    label: "Пессимистичный",
    likelihood: "MEDIUM",
    narrative:
      "Страх потерять стабильность тормозит активный поиск. Горизонт заканчивается без перехода — потолок на текущем месте сохраняется, а ощущение упущенного времени усиливается.",
  },
];

const preMortem = [
  {
    cause: "Поиск откладывается «до удобного момента», пока обязательства давят сильнее любопытства.",
    prevention:
      "Зафиксировать минимальный ритм: сколько часов в неделю уходит на контакты и отклики — и держать его как привычку, а не как рывок.",
  },
  {
    cause: "Критерии новой роли размыты — сравнивать предложения не с чем, поэтому легко остаться на месте.",
    prevention:
      "Записать заранее: что обязательно должно измениться (задачи, рост, среда) и что можно уступить.",
  },
] as const;

const likelihoodClass: Record<Likelihood, string> = {
  LOW: "border-border text-text-muted",
  MEDIUM: "border-accent text-accent-ink",
  HIGH: "border-accent bg-accent/15 text-accent-ink",
};

function LikelihoodBadge({ value }: { value: Likelihood }) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs uppercase tracking-wider ${likelihoodClass[value]}`}
    >
      {value}
    </span>
  );
}

export function LandingExample() {
  return (
    <section className={landingSection}>
      <h2 className={landingH2}>Пример разбора</h2>
      <p className={landingLead}>
        Демо-кейс: «Сменить работу в течение года». Контекст — потолок по развитию и
        доходу, страх потерять стабильность, семья и обязательства.
      </p>

      <ul className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-3">
        {scenarios.map((s) => (
          <li key={s.kind} className={landingCard}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-medium text-text">{s.label}</h3>
              <LikelihoodBadge value={s.likelihood} />
            </div>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              {s.narrative}
            </p>
          </li>
        ))}
      </ul>

      <div className={`mt-6 ${landingCard}`}>
        <h3 className="text-base font-medium text-text">
          Pre-mortem — почему может провалиться
        </h3>
        <ul className="mt-5 space-y-5">
          {preMortem.map((item) => (
            <li key={item.cause} className="text-base leading-relaxed">
              <p className="text-text">
                <span className="text-accent-ink">Причина.</span> {item.cause}
              </p>
              <p className="mt-2 text-text-muted">
                <span className="text-accent-ink">Сейчас.</span>{" "}
                {item.prevention}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
