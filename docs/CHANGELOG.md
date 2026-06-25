# CHANGELOG — «Развилка»

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

---

## [Unreleased]

### Added
- Этап 0: Next.js App Router + Prisma + модель `Note`.
- `app/page.tsx` — главная читает заметки из PostgreSQL (Neon).
- `lib/prisma.ts`, `lib/version.ts`, `prisma/seed.ts`, миграция `init_note`.
- Документация проекта: `docs/PLAN.md`, `docs/STATUS.md`, `docs/CHANGELOG.md`, `docs/PROMPTS.md`, `docs/DECISIONS.md`, `docs/TEMPLATE-dev-log.md`.

---

## [0.1.0] — планируется

MVP: регистрация, журнал решений, сценарии + pre-mortem, дерево развилок, ревью исхода.

### Planned
- Next.js App Router + Prisma 6 + Neon
- JWT auth (httpOnly cookie)
- LLM: сценарии, pre-mortem, дерево, ревью
- Деплой на Vercel

---

[Unreleased]: https://github.com/compare/...HEAD
[0.1.0]: https://github.com/compare/...v0.1.0
