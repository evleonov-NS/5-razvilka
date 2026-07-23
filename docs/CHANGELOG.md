# CHANGELOG — «Развилка»

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

---

## [Unreleased]

### Planned (MVP)
- Этап 4: генерация сценариев + pre-mortem в `POST /api/decisions`
- Экран результата, дерево, ревью

### Added
- **LLM multi-provider (ADR-022):** DeepSeek по умолчанию; в `/cabinet/settings` — DeepSeek / Qwen / OpenAI, выбор модели, свой API-ключ (AES-GCM); квоты (`OWNER_EMAIL` безлимит, остальные 1 бесплатный разбор); учёт стоимости в `LlmUsage`.
- **`GET|PUT /api/settings/llm`**, `components/cabinet/LlmSettingsPanel.tsx`.
- Миграция `user_llm_settings` (`llmProvider`, `llmModel`, `llmApiKeyEnc`, `platformCreditsUsed`, `LlmUsage`).
- **Этап 3 — LLM-слой:** `lib/json.ts`, `lib/llm/*`, `lib/validators.ts`, `npm run llm:verify`.

### Changed
- **Сайдбар:** пункт «Настройки»; тема светлая/тёмная только на `/cabinet/settings` (убрана из футера сайдбара).
- **`POST /api/decisions`:** проверка квоты; списание бесплатного кредита; ответ `llmReady` / `quota`.
- Env: `DEEPSEEK_API_KEY`, `QWEN_API_KEY`, `OWNER_EMAIL`, `LLM_DEFAULT_PROVIDER` (см. `.env.example`).
- **Сайдбар (ранее):** sticky + `self-start` + `h-[100dvh]`; снят `overflow-x-hidden` с предков (ADR-021); Theme/Выйти через `mt-auto`.
- **Демо `/demo`:** единые h2 снаружи секций; дерево — метка у узла, линия/точка вложенности; pre-mortem парами; ревью с выделенным уроком; sticky-плашка CTA.
- **Кабинет (полировка):** центрирование `max-w-4xl`, единая шапка с «Новое решение», сайдбар на `/decisions/*` и `/demo` (ADR-019); счётчики открытых/решённых; превью-сетка без переполнения.
- **Кабинет (UI):** единые семантические токены с лендингом; сайдбар `bg-surface` + ThemeToggle; тёмная тема; мобильный drawer.
- **Журнал:** однозаголовочные разделы, поиск только при ≥5 решениях; пустое состояние — приглашение с пресетами и призрачным превью.
- **Карточка решения:** вся карточка — ссылка; метаданные + превью базового сценария; статус «Решено» — акцентная точка, без зелёного; подсказки «Дерево не построено» / «Исход не отмечен».
- **Навигация MVP:** Журнал · Открытые · Решённые; «Сообщество» убрано из сайдбара (страница `/explore` сохранена); настройки — профиль/тема/выход без заглушки «Скоро…».
- **`/`:** без сессии — новый лендинг; с сессией — редирект в `/cabinet` через `getCurrentUser()` (ADR-013).
- **Тема:** семантические CSS-токены (`--bg`, `--accent`, `--accent-ink`…) + класс `.dark`/`.light` на `<html>`; `ThemeToggle` без FOUC; без `dark:` в разметке (ADR-014, ADR-015).
- **Лендинг:** геометрия max-w-6xl, ритм секций, 2 разделителя; метки LOW/MEDIUM/HIGH по насыщенности акцента.
- **Шапка:** sticky + матовое стекло (`--bg-rgb`), скрытие при скролле вниз; кнопка «наверх» (ADR-016).
- **Auth:** login/register в `AuthShell` (общая шапка/футер); контраст кнопки Google исправлен.

### Added
- Зависимость `openai` (peer zod@3 optional); `.npmrc` с `legacy-peer-deps=true` для установки без конфликта Zod 4.
- **`/demo`:** полный статический пример разбора (ADR-020), `lib/demo-decision.ts`.
- **Форма `/decisions/new`:** поля + сегменты горизонта/типа, пресеты `?preset=`, шаги ожидания генерации, beforeunload; `POST /api/decisions` (пока без LLM).
- **`lib/presets.ts`:** стартовые заготовки для первого разбора.
- **Лендинг (редизайн):** полноценный гостевой лендинг на `/` — секции в `components/landing/*`, FAQ на `<details>`, `/register` для CTA; шрифты Source Serif 4 / Source Sans 3 через `next/font`.
- **Лендинг (ранее):** превью публичных разборов (`LandingPreviewSection`) — компонент сохранён, с гостевой `/` снят.
- **Социальные механики:** `isPublic` на Decision, `DecisionLike`, лента `/explore`, toggle лайков и публикации.
- **Личный кабинет:** `/cabinet` (журнал, открытые, решённые), `DELETE /api/decisions/[id]`.
- Компоненты кабинета, `lucide-react`.

---

## [0.1.0] — 2026-06-25 … 2026-07-05

### Added
- **Этап 0:** Next.js App Router + Prisma 6 + Neon + Vercel smoke-тест.
- **Этап 1:** доменная схема User, Decision, Scenario, FailureMode.
- **view-db:** dev-утилита `/view-db` — таблицы Neon, CRUD, local/prod.
- **Этап 2 (auth):** Auth.js v5 + Google OAuth; миграция `auth_google`.
- `auth.ts`, `/login`, Header, `getCurrentUser` / `requireUser`.
- Документация: PLAN, STATUS, PROMPTS, DECISIONS, AUTH_SETUP, **AUTH_GOOGLE_VERCEL**.
- Dev-log: Этап 0, Этап 2 (`05.07.26-CRS-Этап_2_Google_OAuth`).

### Changed
- ADR-003: Auth.js + Google вместо JWT+bcrypt.
- Prisma User без `passwordHash`; модели Account, Session.

### Fixed
- `npm run db:seed` — через `prisma db seed`.
- OAuth на Vercel: redirect_uri, AUTH_URL, env (см. AUTH_GOOGLE_VERCEL.md).

### Deploy
- Production: https://5-razvilka.vercel.app
- Коммиты: `02ea110` … `8e9a5bd`

---

## [0.0.1] — 2026-06-25

### Added
- Начальная документация: README, PROJECT.md, план MVP.

---

[Unreleased]: https://github.com/evleonov-NS/5-razvilka/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/evleonov-NS/5-razvilka/compare/v0.0.1...v0.1.0
