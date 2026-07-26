/**
 * Системные промпты LLM (PROJECT.md §9 / docs/PROMPTS.md).
 * Подстановка переменных — только на сервере.
 */

export type ScenariosPromptInput = {
  title: string;
  context: string;
  horizon: string;
  type: string;
};

/** Промпт 9.1 — сценарии + pre-mortem (system). */
export function buildScenariosSystemPrompt(input: ScenariosPromptInput): string {
  return `Ты — аналитик решений. Пользователь рассматривает решение или привычку. Не давай
готовый совет «делай / не делай». Смоделируй, как это разворачивается во времени,
и вскрой риски заранее (метод pre-mortem).

Сделай две вещи:
1. СЦЕНАРИИ. Три связных сценария на горизонт: оптимистичный, базовый, пессимистичный.
   Для каждого — метка вероятности (LOW/MEDIUM/HIGH) и краткий нарратив. Базовый — самый правдоподобный.
2. PRE-MORTEM. Представь, что прошёл горизонт и это ПРОВАЛИЛОСЬ. Назови 3-5 главных
   причин провала и на каждую — конкретное предупреждающее действие на СЕЙЧАС.

Не выдумывай цифр и фактов. Вероятность — только метка, не процент.

Название: ${input.title}
Контекст: ${input.context}
Горизонт: ${input.horizon}
Тип: ${input.type}

Верни ТОЛЬКО JSON, без markdown. Значения kind и likelihood — В ВЕРХНЕМ РЕГИСТРЕ:
{
  "scenarios": [
    {"kind": "OPTIMISTIC", "likelihood": "LOW|MEDIUM|HIGH", "narrative": "..."},
    {"kind": "BASE", "likelihood": "...", "narrative": "..."},
    {"kind": "PESSIMISTIC", "likelihood": "...", "narrative": "..."}
  ],
  "failure_modes": [ {"cause": "...", "prevention": "..."} ]
}`;
}

export type TreePromptInput = {
  title: string;
  context: string;
  horizon: string;
};

/** Промпт 9.2 — дерево развилок (system). */
export function buildTreeSystemPrompt(input: TreePromptInput): string {
  return `Построй дерево ключевых развилок — точек, где выбор сильно меняет исход. Глубина 2-3
уровня. Только значимые развилки. На каждой ветке — короткое следствие и метка вероятности.

Название: ${input.title}
Контекст: ${input.context}
Горизонт: ${input.horizon}

Верни ТОЛЬКО JSON, без markdown. likelihood — В ВЕРХНЕМ РЕГИСТРЕ:
{"label": "Решение: ...", "branches": [{"choice": "...", "consequence": "...", "likelihood": "LOW|MEDIUM|HIGH", "branches": []}]}`;
}

export type ReviewScenarioLine = {
  kind: string;
  likelihood: string;
  narrative: string;
};

export type ReviewPromptInput = {
  title: string;
  scenarios: ReviewScenarioLine[];
  outcome: string;
};

/** Промпт 9.3 — ревью-калибровка по факту (system). */
export function buildReviewSystemPrompt(input: ReviewPromptInput): string {
  const scenariosBlock = input.scenarios
    .map(
      (s) =>
        `- ${s.kind} (${s.likelihood}): ${s.narrative}`,
    )
    .join("\n");

  return `Пользователь смоделировал решение, теперь известен исход. Даны сценарии и факт.

Решение: ${input.title}
Прогнозы:
${scenariosBlock}
Факт: ${input.outcome}

Оцени: какой сценарий ближе всего, что упущено, и РОВНО один урок на будущее.

Верни ТОЛЬКО JSON. closest_scenario — В ВЕРХНЕМ РЕГИСТРЕ:
{"closest_scenario": "OPTIMISTIC|BASE|PESSIMISTIC", "missed": "...", "lesson": "..."}`;
}
