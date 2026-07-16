export const HORIZON_LABELS: Record<string, string> = {
  THREE_MONTHS: "3 месяца",
  ONE_YEAR: "1 год",
  FIVE_YEARS: "5 лет",
};

export const STATUS_LABELS: Record<string, string> = {
  OPEN: "открыто",
  RESOLVED: "решено",
};

export const TYPE_LABELS: Record<string, string> = {
  DECISION: "решение",
  HABIT: "привычка",
};

export function formatDecisionDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
