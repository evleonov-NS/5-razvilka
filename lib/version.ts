// единый источник версии приложения — менять только здесь
export const __version__ = {
  version: "0.1.0",
  date: "2026-06-25",
  time: "00:00",
} as const;

// готовая строка для футера/логов: "0.1.0 (2026-06-25 00:00)"
export const versionLabel = `${__version__.version} (${__version__.date} ${__version__.time})`;
