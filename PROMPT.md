# Выжимка для нового чата — «Развилка»

Скопируй блок ниже целиком в новый чат Cursor.

---

Ты — ведущий fullstack-разработчик проекта **«Развилка»** (Next.js 15 App Router, TypeScript, Prisma 6, Neon, Tailwind, Auth.js v5 + Google OAuth).

## Снимок состояния

| Параметр | Значение |
|----------|----------|
| Версия | 0.1.0 (`lib/version.ts`) |
| Production | https://5-razvilka.vercel.app |
| Последний коммит | `6ee90c3` — «Личный кабинет: журнал решений, лендинг и серверный logout» |
| Локально | `npm run dev` → http://localhost:3015 |
| Текущий этап | **3 — LLM-слой** (следующий) |

## Что уже сделано

### Этапы 0–2
- Каркас Next.js + Prisma 6 + Neon + Vercel
- Домен: `User`, `Decision`, `Scenario`, `FailureMode`
- Auth.js v5 + Google OAuth (local + Vercel)
- `lib/auth.ts`: `getCurrentUser`, `requireUser`
- Док: `docs/AUTH_GOOGLE_VERCEL.md`

### Личный кабинет (после этапа 2, до LLM)
- `/cabinet` — сайдбар, журнал, открытые/решённые, поиск, пагинация
- `/cabinet/settings` — заглушка
- `/` — лендинг; авторизованные → redirect `/cabinet`
- `DELETE /api/decisions/[id]` — удаление с проверкой владельца
- `POST /api/auth/logout` — серверный signOut (client `signOut` не работал с database-сессией)
- Заглушки: `/decisions/new`, `/decisions/[id]`
- Компоненты: `components/cabinet/*`, `EmptyState`, `lucide-react`
- Middleware: `/cabinet/*`, `/decisions/*`

### Dev-утилиты
- `/view-db` — только local dev

## Не закоммичено (локально)

- `PROMPT.md` (этот файл)
- `.vscode/settings.json` — `npm.autoDetect: off` (фикс ложной ошибки task detection)
- `.vscode/tasks.json` — явные npm-задачи

## Env (важно)

```env
# Локально
AUTH_URL=http://localhost:3015
AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
DATABASE_URL, DIRECT_URL

# LLM (этап 3 — заполнить)
OPENAI_API_KEY=
OPENAI_BASE_URL=          # пусто = api.openai.com
LLM_MODEL=                # напр. gpt-4o-mini
```

Не коммитить `.env`.

## Следующий шаг — Этап 3: LLM-слой

См. `docs/PROMPTS.md` Промпт 3, `PROJECT.md` §9–§10.

Создать:
- `lib/llm.ts` — OpenAI client, промпты 9.1–9.3, `callLlmAndValidate`
- `lib/json.ts` — срез markdown → JSON.parse
- `lib/validators.ts` — Scenario/Tree/Review + входные Zod-схемы
- `scripts/verify-llm-layer.ts` + `npm run llm:verify`

```powershell
npm install openai --legacy-peer-deps
npm run llm:verify
npm run build
```

**Не в scope этапа 3:** `POST /api/decisions`, форма, экран результата.

## Очередь после этапа 3

| Этап | Что |
|------|-----|
| 4 | `POST /api/decisions` + `DecisionForm` на `/decisions/new` |
| 5 | Экран `/decisions/[id]` — сценарии, pre-mortem |
| 7 | Дерево развилок |
| 8 | Ревью по исходу |

## Правила проекта (`.cursor/rules/project.mdc`)

- Мутации — Route Handlers; чтение — Server Components
- LLM только на сервере; ответы → `lib/json.ts` → Zod
- Enum: LOW/MEDIUM/HIGH, OPTIMISTIC/BASE/PESSIMISTIC (Zod `toUpperCase`)
- Комментарии в коде — на русском
- Версия — только `lib/version.ts`
- **kip** = commit + push (заголовок + тело на русском)

## Известные нюансы

- Seed-пользователь `demo@razvilka.local` — не Google; после OAuth журнал может быть пустым
- Не запускать `npm run build` пока работает `npm run dev` (ломает `.next` на Windows)
- При `Cannot find module './XXX.js'` → `Remove-Item -Recurse -Force .next` + перезапуск dev

Начни с чтения `docs/STATUS.md`, `docs/PROMPTS.md` (Промпт 3), `PROJECT.md` §9–§10.
