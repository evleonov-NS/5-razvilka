# CHANGELOG — «Развилка»

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

---

## [Unreleased]

### Planned (MVP)
- Доменная схема, auth, LLM, журнал, дерево, ревью

---

## [0.1.0] — 2026-06-25

### Added
- **Этап 0 (smoke-тест):** Next.js App Router + Prisma 6 + Neon + Vercel.
- Модель `Note`, миграция `init_note`, seed (3 заметки).
- `app/page.tsx` — главная читает заметки из PostgreSQL.
- `lib/prisma.ts`, `lib/version.ts`.
- Документация: `docs/PLAN.md`, `STATUS.md`, `PROMPTS.md`, `DECISIONS.md`, `TEMPLATE-dev-log.md`.
- Правило **kip** в `.cursor/rules/project.mdc`.
- Dev-log: `docs/25.06.25-CRS-Этап_0_smoke-тест-v0.1.0.md`.

### Fixed
- `npm run db:seed` — через `prisma db seed` (загрузка `.env`).

### Deploy
- Vercel Production: `5-razvilka-git-main-evgenyleonovns.vercel.app`
- Коммиты: `02ea110`, `5b4af00`

---

## [0.0.1] — 2026-06-25

### Added
- Начальная документация: README, PROJECT.md, план MVP.

---

[Unreleased]: https://github.com/evleonov-NS/5-razvilka/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/evleonov-NS/5-razvilka/compare/v0.0.1...v0.1.0
