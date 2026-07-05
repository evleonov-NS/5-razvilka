# STATUS.md — текущее состояние проекта «Развилка»

**Обновлено:** 2026-06-30  
**Версия приложения:** 0.1.0 (`lib/version.ts`)  
**Последний коммит:** `e09cf1c` — «Этап 1: доменная схема Prisma и DATABASE.md»  
**Текущий этап:** 2 — авторизация (следующий, не начат)

---

## Сводка

| Область | Статус | Комментарий |
|---------|--------|-------------|
| Доменная схема Prisma | ✅ Готово | User, Decision, Scenario, FailureMode |
| docs/DATABASE.md | ✅ Готово | sample → docs/DATABASE.sample.md |
| Миграция domain_init | ✅ Применена | Note удалена |
| seed + db:verify | ✅ Готово | демо §16 + smoke связей |
| Главная (Decision) | ✅ Готово | `app/page.tsx` — список всех Decision |
| Auth | ⏳ Следующий | Этап 2 — Auth.js v5 + Google OAuth |
| LLM / Zod | ⚪ Ожидает | Этап 3 — зависимости не установлены |
| Деплой Vercel | ⚠️ Уточнить | После Этапа 1 push/деплой не зафиксирован в CHANGELOG |

---

## Этапы (прогресс)

| Этап | Название | Статус |
|------|----------|--------|
| 0 | Каркас + smoke-тест деплоя | ✅ Завершён |
| 1 | Доменная схема | ✅ Завершён |
| 2 | Авторизация | 🔵 Следующий |
| 3 | LLM-слой и валидация | ⚪ Ожидает |
| 4 | Создание решения (ядро) | ⚪ Ожидает |
| 5 | Экран результата | ⚪ Ожидает |
| 6 | Журнал (главная) | ⚪ Ожидает |
| 7 | Дерево развилок | ⚪ Ожидает |
| 8 | Ревью по исходу | ⚪ Ожидает |
| 9 | Полировка и деплой | ⚪ Ожидает |

**Легенда:** ✅ готово · 🔵 в работе / следующий · ⚪ ожидает · 🔴 заблокировано

---

## Заблокировано

_Нет блокеров для Этапа 2._

---

## В работе

_Пусто — Этап 1 закрыт в коде и закоммичен, готов Этап 2 (auth)._

**Локально не закоммичено:** `.cursor/rules/project.mdc` (правила Agent, не влияет на приложение).

---

## Готово

### Этап 0
- [x] Next.js + Prisma + Neon + Vercel smoke-тест
- [x] Dev-log: `docs/25.06.25-CRS-Этап_0_smoke-тест-v0.1.0.md`

### Этап 1
- [x] `docs/DATABASE.md`, `docs/DATABASE.sample.md`
- [x] Доменная схема Prisma, миграция `20250625230000_domain_init`
- [x] `prisma/seed.ts` — демо §16 (`demo@razvilka.local` / `demo1234`)
- [x] `prisma/verify-domain.ts` + `npm run db:verify`
- [x] `app/page.tsx` — список Decision из Neon
- [x] `bcryptjs` в зависимостях (используется в seed)

---

## Что есть в коде сейчас

```text
app/page.tsx, app/layout.tsx
lib/prisma.ts, lib/version.ts
prisma/schema.prisma, seed.ts, verify-domain.ts, migrations/
```

**Ещё нет:** Auth.js, `lib/auth.ts`, `app/api/auth/[...nextauth]`, `app/login`, `components/Header.tsx`, `lib/llm.ts`, …

**Этап 2:** Auth.js v5 + Google only (без email/пароля). Env: `AUTH_SECRET`, `GOOGLE_CLIENT_*`.

---

## Документация — расхождения

| Файл | Замечание |
|------|-----------|
| `docs/CHANGELOG.md` | Этап 1 не отражён в [Unreleased] / новой версии |
| `README.md` | В разделе «Запуск» ещё написано «заметки из Neon» — устарело |
| Dev-log Этапа 1 | Не создан (есть только для Этапа 0) |

---

## Следующий шаг

**Промпт 2 — Auth.js v5 + Google OAuth:**

1. `next-auth`, `@auth/prisma-adapter`; Prisma: Account, Session, User без passwordHash
2. `auth.ts` + `app/api/auth/[...nextauth]/route.ts`
3. `lib/auth.ts` — `getCurrentUser`, `requireUser`
4. `app/login` — кнопка «Войти через Google»; Google Cloud OAuth credentials

Подробности: [PLAN.md](./PLAN.md) § Этап 2, [PROMPTS.md](./PROMPTS.md) — Промпт 2 и 2а.
