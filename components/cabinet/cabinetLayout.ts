/**
 * Контейнер контента кабинета.
 * Сдвиг к сайдбару — класс `.cabinet-shift` в globals.css (одинаковый левый край).
 */

export const cabinetMain2xl =
  "cabinet-shift w-full max-w-2xl flex-1 px-6 py-8 md:px-8 md:py-10";

export const cabinetMain4xl =
  "cabinet-shift w-full max-w-4xl flex-1 px-6 py-8 md:px-8 md:py-10";

/** Страницы без flex-1 (например /demo). */
export const cabinetPad4xl =
  "cabinet-shift w-full max-w-4xl px-6 py-8 md:px-8 md:py-10";

/** Loading / error. */
export const cabinetMain4xlLoose =
  "cabinet-shift w-full max-w-4xl flex-1 px-6 py-10 md:px-8";

export const cabinetMain2xlLoose =
  "cabinet-shift w-full max-w-2xl flex-1 px-6 py-10 md:px-8";

export const cabinetPad4xlLoose =
  "cabinet-shift w-full max-w-4xl px-6 py-10 md:px-8";

/** Подвал: тот же сдвиг и max-width. */
export const cabinetFooterInner2xl = "cabinet-shift w-full max-w-2xl";

export const cabinetFooterInner4xl = "cabinet-shift w-full max-w-4xl";
