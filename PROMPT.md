# Выжимка для нового чата — «Развилка»

Скопируй блок ниже целиком в новый чат Cursor.

---

Ты — ведущий fullstack-разработчик проекта **«Развилка»** (Next.js 15 App Router, TypeScript, Prisma 6, Neon, Tailwind, Auth.js v5 + Google OAuth).

## Снимок состояния

| Параметр | Значение |
|----------|----------|
| Версия | 0.1.0 (`lib/version.ts`) |
| Production | https://5-razvilka.vercel.app |
| Последний коммит | этап 4 — сценарии + pre-mortem (см. `docs/STATUS.md`) |
| Локально | `npm run dev` → http://localhost:3015 |
| Текущий этап | **5 — экран результата (полировка)**; далее 7 → 8 → 9 |

## Что уже сделано

### Этапы 0–3
- Каркас, домен Prisma, Auth.js + Google, кабинет, лендинг, `/explore`
- LLM-слой: `lib/json.ts`, `lib/llm/*` (DeepSeek по умолчанию, BYOK DeepSeek/Qwen/OpenAI)
- Квоты: `OWNER_EMAIL` безлимит; остальные 1 бесплатный разбор; `LlmUsage`; `/cabinet/settings`

### Этап 4 ✅ (ядро)
- `POST /api/decisions`: `resolveLlmCredentials` → промпт 9.1 (`lib/prompts.ts`) → `parseJsonSafe` → `ScenarioResponseSchema` → транзакция Decision + Scenario[3] + FailureMode[3–5]
- Невалидный LLM → без записи, лог raw, 502/422 (ADR-023)
- `recordLlmUsage`; `consumePlatformCredit` только PLATFORM + не-owner
- `/decisions/[id]`: `ScenarioCard`, `FailureModeList`, `LikelihoodBadge`
- Форма `/decisions/new` с шагами ожидания (не ломать радикально)
- Статус `OPEN` → `RESOLVED` **ещё нет** (этап 8)

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

## Следующий шаг — Этап 5: экран результата

См. `docs/PROMPTS.md` Промпт 5, `docs/PLAN.md` § этап 5, `PROJECT.md` §5.4.

Довести `/decisions/[id]`:
- сценарии + pre-mortem уже есть (этап 4)
- кнопки «В журнал» (есть), «Отметить исход» (заглушка/ссылка под этап 8)
- единые LoadingState / ErrorMessage по желанию
- placeholder дерева (этап 7) — уже текст-заглушка
- не полный этап 7/8

После этапа 5 по плану: **7** дерево → **8** ревью (RESOLVED) → **9** полировка и деплой.

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
# при EPERM Prisma — остановить npm run dev, повторить
```

## Очередь

| Этап | Что |
|------|-----|
| 5 | Полировка `/decisions/[id]`, «Отметить исход» |
| 7 | Дерево развилок (промпт 9.2) |
| 8 | Ревью + status=RESOLVED (промпт 9.3) |
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
- Не `build` параллельно с `dev` на Windows
- Перегенерации пустой карточки нет — только новое решение

Начни с чтения `docs/STATUS.md`, `docs/PLAN.md` (этап 5), `docs/PROMPTS.md` (Промпт 5).
