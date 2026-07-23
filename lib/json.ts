/**
 * Разбор ответов LLM: срез markdown-обёртки и безопасный JSON.parse.
 * Сырой текст без валидного JSON в БД не пишем (см. PROJECT.md §10).
 */

/** Убирает ``` / ```json вокруг JSON и обрезает пробелы. */
export function stripMarkdownFences(raw: string): string {
  const text = raw.trim();

  // Полная обёртка ```json ... ``` или ``` ... ```
  const fenced = /^```(?:json|JSON)?\s*\r?\n?([\s\S]*?)\r?\n?```\s*$/;
  const full = text.match(fenced);
  if (full?.[1]) {
    return full[1].trim();
  }

  // Модель иногда добавляет преамбулу до fence — вырезаем первый блок
  const embedded = /```(?:json|JSON)?\s*\r?\n?([\s\S]*?)\r?\n?```/;
  const block = text.match(embedded);
  if (block?.[1]) {
    return block[1].trim();
  }

  return text;
}

export type ParseJsonOk = { ok: true; data: unknown };
export type ParseJsonErr = { ok: false; error: string; raw: string };
export type ParseJsonResult = ParseJsonOk | ParseJsonErr;

/**
 * Срезает markdown и парсит JSON. При ошибке — ok:false, без throw.
 */
export function parseJsonSafe(raw: string): ParseJsonResult {
  const cleaned = stripMarkdownFences(raw);

  if (!cleaned) {
    return { ok: false, error: "Пустой ответ LLM", raw };
  }

  try {
    const data: unknown = JSON.parse(cleaned);
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "JSON.parse failed";
    return { ok: false, error: message, raw };
  }
}
