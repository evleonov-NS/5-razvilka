# Выжимка для нового чата — «Развилка»

Скопируй блок ниже целиком в новый чат Cursor.

---

Ты — ведущий fullstack-разработчик проекта **«Развилка»** (Next.js 15 App Router, TypeScript, Prisma 6, Neon, Tailwind, Auth.js v5 + Google OAuth).

## Снимок состояния

| Параметр | Значение |
|----------|----------|
| Версия | 0.1.0 (`lib/version.ts`) |
| Production | https://5-razvilka.vercel.app |
| Последний коммит | этап 7 — дерево развилок (см. `docs/STATUS.md`) |
| Локально | `npm run dev` → http://localhost:3015 |
| Текущий этап | **8 — ревью по исходу**; далее 9 |

## Что уже сделано

### Этапы 0–3
- Каркас, домен Prisma, Auth.js + Google, кабинет, лендинг, `/explore`
- LLM-слой: `lib/json.ts`, `lib/llm/*` (DeepSeek по умолчанию, BYOK DeepSeek/Qwen/OpenAI)
- Квоты: `OWNER_EMAIL` безлимит; остальные 1 бесплатный разбор; `LlmUsage`; `/cabinet/settings`

### Этап 4 ✅ (ядро)
- `POST /api/decisions`: промпт 9.1 → `ScenarioResponseSchema` → транзакция Decision + Scenario[3] + FailureMode[3–5]
- Невалидный LLM → без записи (ADR-023)

### Этап 5 ✅ (экран результата)
- `/decisions/[id]`: сценарии, pre-mortem, `LoadingState` / `ErrorMessage`, `loading.tsx` / `error.tsx`
- Кнопки «В журнал», «Что получилось?» → заглушка `/decisions/[id]/review` (форма — этап 8)

### Этап 7 ✅ (дерево)
- `POST /api/decisions/[id]/tree`: промпт 9.2 → `TreeResponseSchema` → `Decision.tree`
- `DecisionTree` + `TreeSection` (tree_idle / generating / ready / error)
- Follow-up без повторного списания кредита (`skipFreeCreditCheck`); идемпотентность если tree уже есть

Правила — `PROJECT.md`, `.cursor/rules/project.mdc`. Документы: `docs/STATUS.md`, `docs/PLAN.md`, `docs/PROMPTS.md`, `docs/DECISIONS.md`.

## Env (локально уже есть; на Vercel — на этапе 9)

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

## Следующий шаг — Этап 8: ревью по исходу

См. `docs/PROMPTS.md` Промпт 8, `docs/PLAN.md` § этап 8, `PROJECT.md` §5.5 / §9.3.

- `POST /api/decisions/[id]/resolve`: принять `{ outcome }`, промпт 9.3 → `ReviewResponseSchema`
- Сохранить `outcome`, `reviewClosestScenario`, `reviewMissed`, `lesson`; `status=RESOLVED`, `resolvedAt`
- Заменить заглушку `/decisions/[id]/review` на форму ввода факта → ближайший сценарий + упущение + 1 урок
- Владелец только; `requireUser()`; LLM только на сервере
- Follow-up: `skipFreeCreditCheck` (как у дерева), не списывать кредит повторно

После этапа 8: **9** полировка и деплой.

### На этапе 9 (обязательно напомнить пользователю)
Внести LLM-ключи в Vercel Environment Variables (иначе prod не генерирует на платформенном ключе):
- Ссылка: https://vercel.com/dashboard → проект **5-razvilka** → **Settings** → **Environment Variables**
- Добавить (Production + Preview по необходимости), значения как в локальном `.env`, **без кавычек**:

| Key | Пример / форма | Обязательно |
|-----|----------------|-------------|
| `DEEPSEEK_API_KEY` | `sk-...` (ключ DeepSeek) | да (платформа по умолчанию) |
| `LLM_DEFAULT_PROVIDER` | `DEEPSEEK` | желательно |
| `LLM_MODEL` | `deepseek-chat` | желательно |
| `OWNER_EMAIL` | `evleonov79@gmail.com` | да (безлимит владельца) |
| `QWEN_API_KEY` | ключ Qwen | опционально |
| `OPENAI_API_KEY` | `sk-...` | опционально |

После сохранения — **Redeploy**. Auth/DB переменные уже должны быть (см. `docs/AUTH_GOOGLE_VERCEL.md`).

```powershell
npm run build
# при EPERM Prisma на Windows — агент сам повторяет build 1–2 раза; dev не останавливать
```

## Очередь

| Этап | Что |
|------|-----|
| 8 | Ревью + status=RESOLVED (промпт 9.3); заменить заглушку review |
| 9 | Полировка + **ключи LLM в Vercel** + migrate deploy |
| 2а | Демо-кнопки в `/cabinet/settings` |

## Правила
- Мутации — Route Handlers; чтение — Server Components
- LLM только на сервере; ответы → `lib/json.ts` → Zod
- Enum UPPERCASE; комментарии на русском; версия только `lib/version.ts`
- **kip** = commit + push (заголовок + тело на русском)
- Shell не дергать без просьбы; примеры команд — PowerShell

## Известные нюансы
- Старые Decision без Scenario → «Разбор ещё не готов» (ожидаемо)
- На Windows `build` рядом с `dev` допустим; при EPERM агент ретраит сам, не просит остановить `dev`
- Перегенерации пустой карточки нет — только новое решение
- Дерево: повторный POST при уже сохранённом tree отдаёт существующее без LLM
- `/decisions/[id]/review` пока заглушка — не ломать маршрут при этапе 8

Начни с чтения `docs/STATUS.md`, `docs/PLAN.md` (этап 8), `docs/PROMPTS.md` (Промпт 8).
