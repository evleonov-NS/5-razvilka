# STATUS.md — текущее состояние проекта «Развилка»

**Обновлено:** 2026-07-20  
**Версия приложения:** 0.1.0 (`lib/version.ts`)  
**Последний коммит:** (локально) кабинет на токенах лендинга + активация первого разбора  
**Текущий этап:** 3 — LLM-слой (следующий); 2а — демо в настройках (запланирован)

---

## Сводка

| Область | Статус | Комментарий |
|---------|--------|-------------|
| Доменная схема Prisma | ✅ Готово | User, Decision, Scenario, FailureMode |
| Auth (Google OAuth) | ✅ Готово | Auth.js v5, local + Vercel; `/login`, `/register` |
| Гостевой лендинг `/` | ✅ Готово | sticky-шапка, ScrollToTop, max-w-6xl |
| Тема UI | ✅ Готово | токены RGB/`--bg-rgb`, ThemeToggle в лендинге и кабинете |
| Auth UI | ✅ Готово | AuthShell на login/register |
| Личный кабинет | ✅ Готово | токены, drawer, пресеты, форма `/decisions/new` |
| Социальные механики | ✅ Готово | `/explore` есть; вне nav кабинета (ADR-018) |
| view-db (dev) | ✅ Готово | `/view-db`, только локально |
| docs/AUTH_GOOGLE_VERCEL.md | ✅ Готово | полная инструкция OAuth |
| LLM / OpenAI | ⏳ Следующий | Этап 3 — сценарии ещё не генерируются |
| Деплой Vercel | ✅ | https://5-razvilka.vercel.app |

---

## Этапы (прогресс)

| Этап | Название | Статус |
|------|----------|--------|
| 0 | Каркас + smoke-тест деплоя | ✅ Завершён |
| 1 | Доменная схема | ✅ Завершён |
| 2 | Авторизация (Google) | ✅ Завершён |
| 3 | LLM-слой и валидация | 🔵 Следующий |
| 4 | Создание решения (ядро) | 🟡 Частично | форма + `POST /api/decisions`, без LLM |
| 5 | Экран результата | ⚪ Ожидает |
| 6 | Журнал (главная) | ✅ Готово | кабинет; `/` — лендинг гостя |
| 7 | Дерево развилок | ⚪ Ожидает |
| 8 | Ревью по исходу | ⚪ Ожидает |
| 9 | Полировка и деплой | ⚪ Ожидает |
| 2а | Настройки: демо-данные (UI) | ⚪ Запланирован |
| 10 | Социальные механики | ✅ Завершён |

---

## Готово (кабинет UI, 2026-07-20)

- [x] Сайдбар на токенах + ThemeToggle + мобильный drawer
- [x] Пустой журнал: пресеты, призрачное превью (ADR-017)
- [x] Разные пустые состояния Открытые / Решённые
- [x] Форма `/decisions/new` + шаги ожидания; `POST /api/decisions`
- [x] Навигация MVP без «Сообщество» (ADR-018); настройки — профиль/тема/выход

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

**Этап 3 — LLM-слой** (критический путь): подключить генерацию сценариев к форме `/decisions/new` и экрану `/decisions/[id]`.

Параллельно **этап 2а** — кнопки «Загрузить / удалить демо-данные» в `/cabinet/settings`.

- `lib/llm.ts`, `lib/json.ts`, `lib/validators.ts`
- env: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `LLM_MODEL`

Подробности: [PLAN.md](./PLAN.md) § сводка этапов, [PROMPTS.md](./PROMPTS.md).

---

## Документация

| Документ | Назначение |
|----------|------------|
| [AUTH_GOOGLE_VERCEL.md](./AUTH_GOOGLE_VERCEL.md) | OAuth: Google, .env, Vercel |
| [PLAN.md](./PLAN.md) | План MVP |
| [PROMPTS.md](./PROMPTS.md) | Промпты Cursor |
