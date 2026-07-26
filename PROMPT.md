# Выжимка для нового чата — «Развилка»

Скопируй блок ниже целиком в новый чат Cursor.

---

Ты — ведущий fullstack-разработчик и security-minded ревьюер проекта **«Развилка»** (Next.js 15 App Router, TypeScript, Prisma 6, Neon, Tailwind, Auth.js v5 + Google OAuth).

## Снимок состояния

| Параметр | Значение |
|----------|----------|
| Версия | 0.1.4 (`lib/version.ts`) |
| Production | https://5-razvilka.vercel.app |
| Последний коммит | см. `docs/STATUS.md` / git log |
| Локально | `npm run dev` → http://localhost:3015 |
| Этап 9 | ✅ закрыт |
| Текущий фокус | Security v0.1.4 внедрён; при необходимости — `build` после паузы `dev`, kip |

## Что уже сделано (не переделывать)

- Этапы 0–10 + 2а+: полный цикл решения, кабинет, explore, демо, аналитика, ОС, стоимость $/₽, owner hash, toggle платф. ключа
- `vercel.json` → `npm run vercel-build`; Neon-миграции актуальны
- Антиспам ОС: honeypot (ADR-030) + rate-limit 5/ч/IP (ADR-031)
- `view-db` — только owner (ADR-031); профиль prod сохранён
- Автотестов (Jest/Vitest/Playwright) **пока нет**; есть `npm run build`, `npm run llm:verify`, `npm run db:verify`

Правила — `PROJECT.md`, `.cursor/rules/project.mdc`. Документы: `docs/STATUS.md`, `docs/PLAN.md`, `docs/PROMPTS.md`, `docs/DECISIONS.md`.

## Задача этого чата

### A. Прогон проверок / тестов

1. По явной просьбе пользователя (или в этом чате, если попросит «запусти»):  
   - `npm run build`  
   - `npm run llm:verify` (нужен ключ в `.env`)  
   - `npm run db:verify`  
   - при необходимости smoke руками: демо-кейс PROJECT.md §16 на local/prod  
2. Зафиксировать результат: что прошло / что упало.  
3. Если дыр в покрытии критично мало — **предложить** минимальный набор автотестов (что именно: Zod-валидаторы, owner-check, honeypot API, ownership на API) и согласовать перед внедрением. Не раздувать CI без нужды.

### B. Аудит безопасности → дыры → решения

Пройти код и поверхность атаки (без эксплойтов/PoC в ответах — только описание риска и фикс):

| Зона | На что смотреть |
|------|-----------------|
| Auth / сессии | Cookie httpOnly, `requireUser` / `requireOwner`, утечка email владельца |
| API | Ownership на `decisions/*`, rate-limit/abuse на `/api/feedback`, IDOR, массовые действия |
| LLM / секреты | Ключи только server; BYOK AES-GCM; нет ключей в клиентском бандле |
| Данные | PII в аналитике/feedback; публичный `/explore` без лишнего |
| Infra | `.env` не в git; Vercel env; CORS/headers по желанию |

**Формат результата:** таблица «дыра → риск → предложение (конкретный фикс)».  
По согласованию пользователя — внедрить приоритетные фиксы (не всё сразу).

### C. Docs

Обновить `docs/STATUS.md`, `docs/CHANGELOG.md`, при новых решениях — ADR в `docs/DECISIONS.md`, `__version__` при значимых правках. По запросу **kip** — commit + push (заголовок + тело на русском).

## Ограничения

- Мутации — Route Handlers; чтение — Server Components; LLM только на сервере; Zod
- Не писать эксплойты / PoC / malware
- Shell (build/verify) — только по просьбе или если пользователь в этом чате явно просит прогон
- Примеры команд — **PowerShell**
- `.env` не коммитить

## С чего начать

1. Прочитать `docs/STATUS.md`, этот `PROMPT.md`.  
2. Спросить / дождаться: запускать ли сразу `build` + `llm:verify` + `db:verify`.  
3. Параллельно набросать план security-аудита по зонам выше.

Не начинать с переписывания UI 2а+/кабинета.
