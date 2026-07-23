# STATUS.md — текущее состояние проекта «Развилка»

**Обновлено:** 2026-07-23  
**Версия приложения:** 0.1.0 (`lib/version.ts`)  
**Последний коммит:** 9698f1a (кабинет + /demo)  
**Текущий этап:** 4 — создание решения (ядро); 2а — демо в настройках (запланирован)

---

## Сводка

| Область | Статус | Комментарий |
|---------|--------|-------------|
| Доменная схема Prisma | ✅ Готово | + `LlmUsage`, поля LLM у User |
| Auth (Google OAuth) | ✅ Готово | Auth.js v5 |
| LLM / провайдеры | ✅ Слой + настройки | DeepSeek по умолчанию; BYOK DeepSeek/Qwen/OpenAI; квоты; стоимость |
| Личный кабинет | ✅ Готово | настройки API в `/cabinet/settings` |
| Деплой Vercel | ✅ | https://5-razvilka.vercel.app |

---

## Этапы (прогресс)

| Этап | Название | Статус |
|------|----------|--------|
| 0 | Каркас + smoke-тест деплоя | ✅ Завершён |
| 1 | Доменная схема | ✅ Завершён |
| 2 | Авторизация (Google) | ✅ Завершён |
| 3 | LLM-слой и валидация | ✅ Завершён |
| 4 | Создание решения (ядро) | 🟡 Частично | форма + `POST /api/decisions`, без LLM-сохранения Scenario |
| 5 | Экран результата | ⚪ Ожидает |
| 6 | Журнал (главная) | ✅ Готово | кабинет; `/` — лендинг гостя |
| 7 | Дерево развилок | ⚪ Ожидает |
| 8 | Ревью по исходу | ⚪ Ожидает |
| 9 | Полировка и деплой | ⚪ Ожидает |
| 2а | Настройки: демо-данные (UI) | ⚪ Запланирован |
| 10 | Социальные механики | ✅ Завершён |

---

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
- [x] `POST /api/decisions` — валидация + квота (генерация Scenario — этап 4)

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
- [x] Миграция `auth_google`, Account/Session/VerificationToken
- [x] `auth.ts`, `/api/auth/[...nextauth]`, `/login`, Header
- [x] `lib/auth.ts` — getCurrentUser, requireUser
- [x] Google OAuth: local + production
- [x] Dev-log: `docs/05.07.26-CRS-Этап_2_Google_OAuth-v0.1.0.md`

---

## Следующий шаг

**Этап 4 — создание решения:** промпт 9.1 → `ScenarioResponseSchema` → транзакция Decision + Scenario[] + FailureMode[]; экран `/decisions/[id]` с данными из БД.

Параллельно **этап 2а** — кнопки «Загрузить / удалить демо-данные» в `/cabinet/settings`.

Проверка слоя: `npm run llm:verify` (smoke LLM — если ключ в `.env`).

Подробности: [PLAN.md](./PLAN.md), [PROMPTS.md](./PROMPTS.md).

---

## Документация

| Документ | Назначение |
|----------|------------|
| [AUTH_GOOGLE_VERCEL.md](./AUTH_GOOGLE_VERCEL.md) | OAuth: Google, .env, Vercel |
| [PLAN.md](./PLAN.md) | План MVP |
| [PROMPTS.md](./PROMPTS.md) | Промпты Cursor |
