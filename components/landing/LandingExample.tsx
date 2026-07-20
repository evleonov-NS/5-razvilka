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

function LikelihoodBadge({ value }: { value: Likelihood }) {
  return (
    <span className="inline-block rounded border border-[var(--landing-border)] px-2 py-0.5 text-[11px] font-medium tracking-wide text-[var(--landing-accent)]">
      {value}
    </span>
  );
}

export function LandingExample() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
        Пример разбора
      </h2>
      <p className="mt-4 max-w-[48ch] text-[var(--landing-muted)]">
        Демо-кейс: «Сменить работу в течение года». Контекст — потолок по развитию и
        доходу, страх потерять стабильность, семья и обязательства.
      </p>

      <ul className="mt-12 grid gap-6 lg:grid-cols-3">
        {scenarios.map((s) => (
          <li
            key={s.kind}
            className="border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-[var(--landing-fg)]">
                {s.label}
              </h3>
              <LikelihoodBadge value={s.likelihood} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--landing-muted)]">
              {s.narrative}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5 sm:p-6">
        <h3 className="text-sm font-medium text-[var(--landing-fg)]">
          Pre-mortem — почему может провалиться
        </h3>
        <ul className="mt-5 space-y-5">
          {preMortem.map((item) => (
            <li key={item.cause} className="text-sm leading-relaxed">
              <p className="text-[var(--landing-fg)]">
                <span className="text-[var(--landing-accent)]">Причина.</span>{" "}
                {item.cause}
              </p>
              <p className="mt-2 text-[var(--landing-muted)]">
                <span className="text-[var(--landing-fg)]">Сейчас.</span>{" "}
                {item.prevention}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
