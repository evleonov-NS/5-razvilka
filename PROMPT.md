# Выжимка для нового чата — «Развилка»

Скопируй блок ниже целиком в новый чат Cursor.

---

Ты — ведущий fullstack-разработчик проекта **«Развилка»** (Next.js 15 App Router, TypeScript, Prisma 6, Neon, Tailwind, Auth.js v5 + Google OAuth).

## Снимок состояния

| Параметр | Значение |
|----------|----------|
| Версия | 0.1.1 (`lib/version.ts`) |
| Production | https://5-razvilka.vercel.app |
| Последний коммит | этап 9 полировка UI (см. `docs/STATUS.md`) |
| Локально | `npm run dev` → http://localhost:3015 |
| Текущий этап | **9 — ключи LLM в Vercel + prod-тест** (код полировки готов) |

## Что уже сделано

### Этапы 0–8 ✅
- Каркас, Prisma, Auth.js + Google, кабинет, лендинг, `/explore`
- LLM: DeepSeek по умолчанию, BYOK, квоты, `LlmUsage`
- Создание решения (9.1), экран результата, дерево (9.2), ревью (9.3) → RESOLVED

### Этап 9 — полировка кода ✅
- Единые `LoadingState` / `EmptyState` / `ErrorMessage`
- Общий `LikelihoodBadge` (лендинг, demo, карточки)
- `npm run vercel-build` = migrate deploy + generate + next build (ADR-026)
- Версия 0.1.1

Правила — `PROJECT.md`, `.cursor/rules/project.mdc`. Документы: `docs/STATUS.md`, `docs/PLAN.md`, `docs/PROMPTS.md`, `docs/DECISIONS.md`.

## Env (локально уже есть; на Vercel — сейчас)

```env
DATABASE_URL=   DIRECT_URL=
AUTH_SECRET=    AUTH_URL=http://localhost:3015
GOOGLE_CLIENT_ID=   GOOGLE_CLIENT_SECRET=
OWNER_EMAIL=evleonov79@gmail.com
LLM_DEFAULT_PROVIDER=DEEPSEEK
LLM_MODEL=deepseek-chat
DEEPSEEK_API_KEY=
# опционально: QWEN_API_KEY, OPENAI_API_KEY
```

Не коммитить `.env`.

## Осталось по этапу 9 (вручную в Vercel)

См. `docs/PLAN.md` § этап 9.

1. Environment Variables (Production): `DEEPSEEK_API_KEY`, `OWNER_EMAIL`, желательно `LLM_DEFAULT_PROVIDER`, `LLM_MODEL`
2. Build Command → `npm run vercel-build`
3. Redeploy
4. Prod-тест §16: войти → `/decisions/new` → разобрать → дерево → ревью

```powershell
npm run build
# при EPERM Prisma на Windows — агент сам повторяет build 1–2 раза; dev не останавливать
```

## Очередь

| Этап | Что |
|------|-----|
| 9 | Ключи LLM в Vercel + vercel-build + prod-тест |
| 2а | Демо-кнопки в `/cabinet/settings` |

## Правила
- Мутации — Route Handlers; чтение — Server Components
- LLM только на сервере; ответы → `lib/json.ts` → Zod
- Enum UPPERCASE; комментарии на русском; версия только `lib/version.ts`
- **kip** = commit + push (заголовок + тело на русском)
- Shell не дергать без просьбы; примеры команд — PowerShell

## Известные нюансы
- Старые Decision без Scenario → «Разбор ещё не готов» (ожидаемо)
- На Windows `build` рядом с `dev` допустим; при EPERM агент ретраит сам
- Дерево / ревью: повторный POST при уже сохранённых данных без LLM
- Повторно сменить исход у RESOLVED через UI нельзя

Начни с чтения `docs/STATUS.md`, `docs/PLAN.md` (этап 9 — чеклист Vercel).
