/** Призрачное превью разбора — показать форму результата, не реальные данные. */

type Likelihood = "LOW" | "MEDIUM" | "HIGH";

const scenarios: {
  label: string;
  likelihood: Likelihood;
  narrative: string;
}[] = [
  {
    label: "Оптимистичный",
    likelihood: "LOW",
    narrative:
      "За год находишь роль с более сильной командой и задачами, которые снимают ощущение потолка. Переход проходит без долгого простоя.",
  },
  {
    label: "Базовый",
    likelihood: "HIGH",
    narrative:
      "Поиск занимает заметную часть года. Предложения появляются неравномерно; часть из них слабее ожиданий. Смена происходит с компромиссами.",
  },
  {
    label: "Пессимистичный",
    likelihood: "MEDIUM",
    narrative:
      "Страх потерять стабильность тормозит активный поиск. Горизонт заканчивается без перехода — потолок на текущем месте сохраняется.",
  },
];

const likelihoodClass: Record<Likelihood, string> = {
  LOW: "border-border text-text-muted",
  MEDIUM: "border-accent text-accent-ink",
  HIGH: "border-accent bg-accent/15 text-accent-ink",
};

export function GhostResultPreview() {
  return (
    <div className="pointer-events-none relative mt-12 select-none" aria-hidden="true">
      <p className="mb-4 text-xs uppercase tracking-wider text-text-faint">
        Так выглядит готовый разбор
      </p>

      <ul className="grid gap-4 opacity-60 md:grid-cols-3">
        {scenarios.map((s) => (
          <li
            key={s.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-text">{s.label}</h3>
              <span
                className={`inline-block shrink-0 rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${likelihoodClass[s.likelihood]}`}
              >
                {s.likelihood}
              </span>
            </div>
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-text-muted">
              {s.narrative}
            </p>
          </li>
        ))}
      </ul>

      {/* Мягкое затухание к фону снизу */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
