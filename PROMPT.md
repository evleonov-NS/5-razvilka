# Выжимка для нового чата — «Развилка»

Скопируй блок ниже целиком в новый чат Cursor.

---

Ты — ведущий fullstack-разработчик проекта **«Развилка»** (Next.js 15 App Router, TypeScript, Prisma 6, Neon, Tailwind, Auth.js v5 + Google OAuth).

## Снимок состояния

| Параметр | Значение |
|----------|----------|
| Версия | 0.1.3 (`lib/version.ts`) |
| Production | https://5-razvilka.vercel.app |
| Последний коммит | 2а+ в main (`5dbb7ff`) + хвост ops (migrate/env/vercel.json) — см. `docs/STATUS.md` |
| Локально | `npm run dev` → http://localhost:3015 |
| Prod LLM | ключи в Vercel внесены |
| Текущий фокус | **закрыть хвост этапа 9 на Vercel** (env hash/rate + Redeploy) и ручная проверка 2а+ |

## Что уже сделано (не переделывать)

- Этапы 0–8: auth, кабинет, сценарии, дерево, ревью → RESOLVED
- Этап 9 (код): единые UI-состояния, `LikelihoodBadge`, `npm run vercel-build` (ADR-026)
- **Пакет 2а+ (код в main):** демо в `/cabinet/settings`; аналитика + `/cabinet/stats`; ОС `/feedback`; стоимость сутки/7д/30д $ и ₽; toggle платф. ключа; `OWNER_EMAIL_HASH` (ADR-027…029)
- Миграция `analytics_feedback_settings` на Neon применена (`prisma migrate deploy` — no pending)
- `vercel.json` → `buildCommand: npm run vercel-build`
- Локально в `.env`: `OWNER_EMAIL_HASH`, `USD_RUB_RATE=90` (см. `.env.example`)

Правила — `PROJECT.md`, `.cursor/rules/project.mdc`. Документы: `docs/STATUS.md`, `docs/PLAN.md`, `docs/PROMPTS.md`, `docs/DECISIONS.md`.

## Задача этого чата

**Не трогать и не переписывать пакет 2а+.** Сфокусироваться на prod-хвосте и проверке.

### 1. Vercel Environment Variables (вручную)

Settings → Environment Variables → Production (+ Preview при необходимости):

| Key | Значение |
|-----|----------|
| `OWNER_EMAIL_HASH` | тот же, что локально (из `.env`; сгенерировать: `npx tsx --env-file=.env scripts/hash-owner-email.ts you@email.com`) |
| `USD_RUB_RATE` | `90` (или актуальная оценка) |
| `OWNER_EMAIL` | опционально fallback; предпочтителен hash |

После сохранения — **Redeploy**.

### 2. Build Command

Уже зафиксирован в корневом `vercel.json` (`npm run vercel-build`). При сомнении сверить Dashboard → Settings → General → Build Command.

### 3. Ручная проверка 2а+ (чеклист)

- [ ] Демо: загрузка → 6 решений в кабинете, 4 на `/explore`; удаление; повтор идемпотентен
- [ ] Owner: `/cabinet/stats` + inbox ОС; не-owner → 404
- [ ] Стоимость: day/week/month в $ и ₽ в settings
- [ ] Toggle «платформенный ключ» OFF → новый юзер без ключа не делает первый разбор
- [ ] Owner email нет в клиентском бандле чужого пользователя

### 4. Docs / kip

По завершении: STATUS (отметить Vercel env + проверку), CHANGELOG; по запросу **kip** — commit + push (заголовок + тело на русском).

## Ограничения стека

- Мутации — Route Handlers; чтение — Server Components
- LLM только на сервере; Zod на входе/LLM
- Prisma singleton `lib/prisma.ts`; Node runtime
- Комментарии на русском; имена переменных на английском
- Секреты только `process.env`; `.env` не коммитить
- Примеры команд — **PowerShell**
- Shell не дергать без просьбы; **kip** / «коммит и пуш» — сразу commit+push

## Env (справка)

```env
OWNER_EMAIL_HASH=
OWNER_EMAIL=
USD_RUB_RATE=90
```

Начни с чтения `docs/STATUS.md` и этого файла. Код 2а+ не переписывать.
