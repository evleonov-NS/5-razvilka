export const HORIZON_LABELS: Record<string, string> = {
  THREE_MONTHS: "3 месяца",
  ONE_YEAR: "1 год",
  FIVE_YEARS: "5 лет",
};

export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Открыто",
  RESOLVED: "Решено",
};

export const TYPE_LABELS: Record<string, string> = {
  DECISION: "решение",
  HABIT: "привычка",
};

export const SCENARIO_KIND_LABELS: Record<string, string> = {
  OPTIMISTIC: "Оптимистичный",
  BASE: "Базовый",
  PESSIMISTIC: "Пессимистичный",
};

/** Подписи вероятности в UI (в БД — LOW/MEDIUM/HIGH). */
export const LIKELIHOOD_LABELS: Record<string, string> = {
  LOW: "низкая",
  MEDIUM: "средняя",
  HIGH: "высокая",
};

/** Порядок карточек на экране результата. */
export const SCENARIO_KIND_ORDER = [
  "OPTIMISTIC",
  "BASE",
  "PESSIMISTIC",
] as const;

export function formatDecisionDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
