# CHANGELOG — «Развилка»

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

---

## [Unreleased]

### Planned (MVP)
- LLM-слой, создание решения, экран результата, дерево, ревью

### Changed
- **`/`:** без сессии — новый лендинг; с сессией — редирект в `/cabinet` через `getCurrentUser()` (ADR-013).
- **Тема:** семантические CSS-токены (`--bg`, `--accent`, `--accent-ink`…) + класс `.dark`/`.light` на `<html>`; `ThemeToggle` без FOUC; без `dark:` в разметке (ADR-014, ADR-015).
- **Лендинг:** геометрия max-w-6xl, ритм секций, 2 разделителя; метки LOW/MEDIUM/HIGH по насыщенности акцента.

### Added
- **Лендинг (редизайн):** полноценный гостевой лендинг на `/` — секции в `components/landing/*`, FAQ на `<details>`, `/register` для CTA; шрифты Source Serif 4 / Source Sans 3 через `next/font`.
- **Лендинг (ранее):** превью публичных разборов (`LandingPreviewSection`) — компонент сохранён, с гостевой `/` снят.
- **Социальные механики:** `isPublic` на Decision, `DecisionLike`, лента `/explore`, toggle лайков и публикации.
- **Личный кабинет:** `/cabinet` (журнал, открытые, решённые), `DELETE /api/decisions/[id]`.
- Компоненты кабинета, `lucide-react`, заглушки `/decisions/new`, `/decisions/[id]`.

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
