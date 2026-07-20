import type { DecisionType, Horizon } from "@prisma/client";

/** Идентификаторы стартовых пресетов для пустого журнала. */
export type PresetId =
  | "job-change"
  | "mortgage"
  | "own-project"
  | "relocate"
  | "invest";

export type DecisionPreset = {
  id: PresetId;
  chipLabel: string;
  title: string;
  /** Заготовка контекста — пользователь правит под себя. */
  context: string;
  horizon: Horizon;
  type: DecisionType;
};

/**
 * Стартовые пресеты: снимают паралич чистого листа.
 * Тексты нейтральные, без цифр и выдуманных фактов.
 */
export const DECISION_PRESETS: Record<PresetId, DecisionPreset> = {
  "job-change": {
    id: "job-change",
    chipLabel: "Сменить работу",
    title: "Сменить работу",
    context:
      "На текущем месте чувствуется потолок по развитию и задачам. Держит стабильность и привычный круг обязательств. Опасаюсь простоя и шага «в никуда». Ограничения: семья, финансы, сроки перехода.",
    horizon: "ONE_YEAR",
    type: "DECISION",
  },
  mortgage: {
    id: "mortgage",
    chipLabel: "Взять ипотеку",
    title: "Взять ипотеку",
    context:
      "Рассматриваю покупку жилья в кредит. Сейчас снимаю или живу в стеснённых условиях. Держит страх долгой нагрузки и неопределённость дохода. Ограничения: первоначальный взнос, платежи, готовность к долгому горизонту.",
    horizon: "ONE_YEAR",
    type: "DECISION",
  },
  "own-project": {
    id: "own-project",
    chipLabel: "Запустить свой проект",
    title: "Запустить свой проект",
    context:
      "Хочу начать собственное дело или продукт рядом с основной работой или вместо неё. Держит страх потерять стабильный доход. Опасаюсь, что идея «размоется» без ритма. Ограничения: время, деньги, навыки, поддержка близких.",
    horizon: "ONE_YEAR",
    type: "DECISION",
  },
  relocate: {
    id: "relocate",
    chipLabel: "Переехать в другой город",
    title: "Переехать в другой город",
    context:
      "Думаю о переезде: работа, учёба или качество жизни. На месте держит привычная среда и связи. Опасаюсь одиночества и стоимости адаптации. Ограничения: жильё, работа на новом месте, близкие.",
    horizon: "ONE_YEAR",
    type: "DECISION",
  },
  invest: {
    id: "invest",
    chipLabel: "Начать регулярно инвестировать",
    title: "Начать регулярно инвестировать",
    context:
      "Хочу выстроить привычку откладывать и вкладывать часть дохода. Сейчас мешают сомнения и отсутствие простого правила. Опасаюсь ошибок и «не того момента». Ограничения: размер свободных денег, горизонт, готовность учиться без спешки.",
    horizon: "ONE_YEAR",
    type: "HABIT",
  },
};

export const PRESET_CHIP_ORDER: PresetId[] = [
  "job-change",
  "mortgage",
  "own-project",
  "relocate",
  "invest",
];

export function getPreset(id: string | null | undefined): DecisionPreset | null {
  if (!id) return null;
  if (id in DECISION_PRESETS) {
    return DECISION_PRESETS[id as PresetId];
  }
  return null;
}
