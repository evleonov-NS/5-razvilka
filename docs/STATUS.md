# STATUS.md — текущее состояние проекта «Развилка»

**Обновлено:** 2026-07-26  
**Версия приложения:** 0.1.0 (`lib/version.ts`)  
**Последний коммит:** этап 5 (экран результата) — см. git log  
**Текущий этап:** 7 — дерево развилок; далее 8 → 9  
**Dev-log:** [26.07.26-CRS-Этап_4_сценарии_pre-mortem-v0.1.0.md](./26.07.26-CRS-Этап_4_сценарии_pre-mortem-v0.1.0.md)

---

## Сводка (этап 5 закрыт)

| Вопрос | Ответ |
|--------|--------|
| Что умеет продукт сейчас | Войти → описать решение → 3 сценария + pre-mortem → экран результата с кнопками «В журнал» / «Что получилось?» |
| Чего ещё нет | Дерево (7), ревью / RESOLVED (8), полировка prod + ключи LLM в Vercel (9) |
| Где смотреть | Локально: `/decisions/new` → `/decisions/[id]`; prod: https://5-razvilka.vercel.app |
| Риск для prod | Без `DEEPSEEK_API_KEY` в Vercel генерация на платформенном ключе не работает — **внести на этапе 9** (чеклист в PLAN) |

| Область | Статус | Комментарий |
|---------|--------|-------------|
| Доменная схема Prisma | ✅ Готово | + `LlmUsage`, поля LLM у User |
| Auth (Google OAuth) | ✅ Готово | Auth.js v5 |
| LLM / провайдеры | ✅ Слой + настройки | DeepSeek по умолчанию; BYOK; квоты; стоимость |
| Создание решения | ✅ Этап 4 | промпт 9.1 → Scenario + FailureMode |
| Экран результата | ✅ Этап 5 | Loading/Error, «Что получилось?» → заглушка review |
| Личный кабинет | ✅ Готово | настройки API в `/cabinet/settings` |
| Деплой Vercel | ✅ сайт | LLM-ключи в env — чеклист этапа 9 |

---

## Этапы (прогресс)

| Этап | Название | Статус |
|------|----------|--------|
| 0 | Каркас + smoke-тест деплоя | ✅ Завершён |
| 1 | Доменная схема | ✅ Завершён |
| 2 | Авторизация (Google) | ✅ Завершён |
| 3 | LLM-слой и валидация | ✅ Завершён |
| 4 | Создание решения (ядро) | ✅ Завершён |
| 5 | Экран результата | ✅ Завершён |
| 6 | Журнал (главная) | ✅ Готово | кабинет; `/` — лендинг гостя |
| 7 | Дерево развилок | ⚪ Ожидает |
| 8 | Ревью по исходу | ⚪ Ожидает | тогда OPEN → RESOLVED |
| 9 | Полировка и деплой | ⚪ Ожидает | + **API-ключи LLM в Vercel** |
| 2а | Настройки: демо-данные (UI) | ⚪ Запланирован |
| 10 | Социальные механики | ✅ Завершён |

---

## Готово (Этап 5 — экран результата, 2026-07-26)

- [x] `LoadingState`, `ErrorMessage`
- [x] `app/decisions/[id]/loading.tsx`, `error.tsx`
- [x] Кнопка «Что получилось?» → `/decisions/[id]/review` (заглушка до этапа 8)
- [x] Пустое состояние разбора через `EmptyState`
- [x] Placeholder дерева без кнопки генерации (этап 7)

## Готово (Этап 4 — ядро создания решения, 2026-07-26)

- [x] `POST /api/decisions`: `resolveLlmCredentials` → промпт 9.1 → `parseJsonSafe` → `ScenarioResponseSchema`
- [x] Транзакция `Decision` + `Scenario[3]` + `FailureMode[3–5]` только после валидного LLM
- [x] Невалидный JSON/схема — без записи в БД, лог сырого ответа, 502/422
- [x] `recordLlmUsage`; `consumePlatformCredit` только при платформенном ключе (не owner)
- [x] `/decisions/[id]`: `ScenarioCard`, `FailureModeList` из БД
- [x] `lib/prompts.ts` (промпт 9.1); ADR-023
- [x] Ручная проверка: разбор «проверка» — 3 сценария + pre-mortem
- [x] `npm run build` ок; dev-log + `PROMPT.md` для следующего чата

## Готово (LLM: провайдеры + квоты + стоимость, 2026-07-23)

- [x] Платформа по умолчанию — DeepSeek (`DEEPSEEK_API_KEY`)
- [x] `/cabinet/settings` — провайдер / модель / свой ключ; блок стоимости запросов
- [x] Квоты: `OWNER_EMAIL` (evleonov79@…) безлимит; остальные — 1 бесплатный разбор
- [x] `LlmUsage` + оценка USD; ключ AES-GCM (`AUTH_SECRET`)
- [x] Миграция `user_llm_settings` (нужен `migrate deploy`)
- [x] ADR-022

Env: `DEEPSEEK_API_KEY`, `QWEN_API_KEY`, `OPENAI_API_KEY`, `LLM_DEFAULT_PROVIDER`, `LLM_MODEL`, `OWNER_EMAIL` — см. `.env.example`.

## Готово (Этап 3 — LLM-слой, 2026-07-23)

- [x] `lib/json.ts` — срез markdown-fence, `parseJsonSafe`
- [x] `lib/llm/*` — клиент, провайдеры, квоты, usage
- [x] `lib/validators.ts` — `CreateDecisionInputSchema`, `ScenarioResponseSchema`, заготовки Tree/Review
- [x] `scripts/verify-llm-layer.ts` + `npm run llm:verify`

---

## Готово (кабинет UI, 2026-07-20)

- [x] Сайдбар на токенах + ThemeToggle + мобильный drawer; сайдбар на `/decisions/*` и `/demo` (ADR-019)
- [x] Пустой журнал: пресеты, призрачное превью (ADR-017); ссылка на `/demo` (ADR-020)
- [x] Разные пустые состояния Открытые / Решённые; единая шапка с «Новое решение»
- [x] Форма `/decisions/new` + шаги ожидания; `POST /api/decisions`
- [x] Навигация MVP без «Сообщество» (ADR-018); настройки — профиль/тема/выход
- [x] Сетка превью без горизонтального скролла; контент `max-w-4xl` по центру
- [x] Sticky-сайдбар без overflow у предков (ADR-021); демо-разбор: дерево/pre-mortem/ревью

## Готово (социальные механики)

- [x] `Decision.isPublic`, модель `DecisionLike`, миграция `decision_public_likes`
- [x] `POST /api/decisions/[id]/like`, `PATCH /api/decisions/[id]/visibility`
- [x] `/explore` — лента, sort=popular|recent; `/explore/[id]` — публичный просмотр
- [x] `LikeButton`, `VisibilityToggle`, `PublicDecisionCard`
- [x] Промпт: [PROMPT-socium.md](./PROMPT-socium.md)

## Готово (личный кабинет)

- [x] `/cabinet` — сайдбар, журнал, фильтры OPEN/RESOLVED, поиск, пагинация
- [x] `/` — продуктовый лендинг для гостей (`components/landing/*`), редирект авторизованных → `/cabinet`; `/register` для CTA
- [x] `DELETE /api/decisions/[id]` — проверка владельца
- [x] `lucide-react`, компоненты `components/cabinet/*`

## Готово (Этап 2)

- [x] `next-auth` beta + `@auth/prisma-adapter`
- [x] Миграция `auth_google`, Account/Session, VerificationToken
- [x] `auth.ts`, `/api/auth/[...nextauth]`, `/login`, Header
- [x] `lib/auth.ts` — getCurrentUser, requireUser
- [x] Google OAuth: local + production
- [x] Dev-log: `docs/05.07.26-CRS-Этап_2_Google_OAuth-v0.1.0.md`

---

## Следующий шаг

**Этап 7** — дерево развилок (`POST /api/decisions/[id]/tree`, промпт 9.2, `DecisionTree`).

Затем **8** ревью (RESOLVED) → **9** полировка + **внести LLM-ключи в Vercel** (чеклист в [PLAN.md](./PLAN.md) § этап 9).

Промпт для нового чата: корневой [PROMPT.md](../PROMPT.md).

---

## Документация

| Документ | Назначение |
|----------|------------|
| [AUTH_GOOGLE_VERCEL.md](./AUTH_GOOGLE_VERCEL.md) | OAuth: Google, .env, Vercel |
| [PLAN.md](./PLAN.md) | План MVP (+ чеклист ключей LLM на этапе 9) |
| [PROMPTS.md](./PROMPTS.md) | Промпты Cursor |
| [PROMPT.md](../PROMPT.md) | Выжимка для следующего чата |
| [26.07.26-CRS-Этап_4…](./26.07.26-CRS-Этап_4_сценарии_pre-mortem-v0.1.0.md) | Dev-log этапа 4 |
