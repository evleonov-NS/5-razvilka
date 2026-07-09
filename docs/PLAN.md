# PLAN.md — пошаговый план разработки «Развилка»

**Версия плана:** 1.0  
**Дата:** 2026-06-25  
**Основа:** [PROJECT.md](../PROJECT.md), [README.md](../README.md)

---

## Текущее состояние

| Область | Статус |
|---------|--------|
| Этап 0 (smoke-тест) | ✅ Завершён |
| Этап 1 (доменная схема) | ✅ Завершён |
| Prisma / Neon | ✅ User, Decision, Scenario, FailureMode |
| Деплой Vercel | ✅ (обновить после push) |
| Документация | ✅ docs/DATABASE.md |

**Следующий шаг:** Этап 2 — авторизация (Промпт 2).

---

## 1. Цель MVP

### Продукт
Пользователь описывает решение или привычку → получает:
1. три сценария будущего (OPTIMISTIC / BASE / PESSIMISTIC + LOW/MEDIUM/HIGH);
2. pre-mortem (3–5 причин провала + профилактика);
3. дерево развилок (отдельная генерация, глубина 2–3);
4. журнал решений;
5. ревью по фактическому исходу.

### Definition of Done (§15 PROJECT.md)

- [ ] 1. Войти через Google
- [ ] 2. Выйти из аккаунта
- [ ] 3. Создать новое решение
- [ ] 4. Получить 3 сценария будущего
- [ ] 5. Получить pre-mortem
- [ ] 6. Найти решение в журнале (автосохранение после генерации)
- [ ] 7. Открыть решение из журнала
- [ ] 8. Сгенерировать дерево развилок
- [ ] 9. Отметить фактический исход
- [ ] 10. Получить ревью (ближайший сценарий + урок)
- [x] 11. `npm run build` проходит локально и на Vercel

### Вне scope MVP
Калибровка во времени, редактор дерева, числовые вероятности/деньги, голос, оплата.

---

## 2. Зафиксированная архитектура

| Аспект | Решение |
|--------|---------|
| Фреймворк | Next.js App Router + TypeScript |
| БД | Neon PostgreSQL + Prisma 6 (`url` + `directUrl`) |
| Auth | Auth.js v5 + Google OAuth, httpOnly cookie (database session) |
| Мутации | Route Handlers (`app/api/.../route.ts`) |
| Чтение | Server Components напрямую из БД |
| UI | Tailwind CSS |
| Валидация | Zod (ввод + ответы LLM) |
| LLM | npm `openai`, настраиваемый `OPENAI_BASE_URL` |
| Runtime API | Node (не Edge) |
| Деплой | Vercel, `build = prisma generate && next build` |

---

## 3. Подготовка инфраструктуры

### 3.1. Внешние сервисы
1. **Neon** — `DATABASE_URL` (pooled), `DIRECT_URL` (direct).
2. **Vercel** — репозиторий + env-переменные.
3. **OpenAI** (или совместимый агрегатор) — `OPENAI_API_KEY`, `LLM_MODEL`.
4. **AUTH_SECRET**, **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET** — Auth.js + Google OAuth.

### 3.2. Локальная среда
```powershell
Copy-Item .env.example .env
# заполнить переменные в .env
```

### 3.3. npm-зависимости (итог)
```powershell
npm install prisma @prisma/client openai zod next-auth @auth/prisma-adapter
npm install -D tsx
```

---

## 4. Этапы разработки

### Этап 0 — Каркас + smoke-тест деплоя
**Промпт 0** · Неделя 1 · **Блокирующий**

**Цель:** зелёный деплой на Vercel с чтением из Neon.

#### Задачи
- [x] `create-next-app` — App Router, TypeScript, Tailwind, ESLint
- [x] Prisma: временная модель `Note { id, title, createdAt }`
- [x] `lib/prisma.ts` — синглтон
- [x] `lib/version.ts` — `__version__`, `versionLabel`
- [x] `app/page.tsx` — список заметок + футер с версией
- [x] `.env.example`
- [x] `prisma/seed.ts` — 2–3 заметки
- [x] `package.json` scripts: dev, build, start, lint, db:seed
- [x] Деплой Vercel + миграция Neon

#### Проверка
```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init_note
npm run db:seed
npm run build
npm run dev
```
- [x] Главная показывает заметки из Neon
- [x] Vercel build проходит
- [x] Версия в футере из `lib/version.ts`

---

### Этап 1 — Доменная схема
**Промпт 1** · Неделя 1

#### Задачи
- [x] Заменить `Note` на схему §6 PROJECT.md (User, Decision, Scenario, FailureMode, enums)
- [x] Миграция `domain_init`
- [x] Обновить `seed.ts` — демо-кейс §16
- [x] Убрать чтение Note с главной
- [x] docs/DATABASE.md + DATABASE.sample.md
- [x] prisma/verify-domain.ts + npm run db:verify

#### Проверка
```powershell
npx prisma migrate deploy
npm run db:seed
npm run db:verify
```
- [x] Таблицы и связи корректны
- [x] Seed создаёт демо-пользователя и решение

---

### Этап 2 — Авторизация
**Промпт 2** · Неделя 1

**Стек:** Auth.js v5 (`next-auth`) + Google OAuth only. Сессия в httpOnly cookie (database strategy). Без email/пароля.

#### Зависимости
- [ ] `next-auth`, `@auth/prisma-adapter`

#### Prisma
- [ ] User без `passwordHash`; поля `name`, `emailVerified`, `image` (Auth.js)
- [ ] Модели `Account`, `Session`, `VerificationToken`
- [ ] Миграция `auth_google`
- [ ] Обновить `seed.ts`

#### Auth.js
- [ ] `auth.ts` — GoogleProvider, PrismaAdapter, `AUTH_SECRET`
- [ ] `app/api/auth/[...nextauth]/route.ts`
- [ ] `lib/auth.ts` — `getCurrentUser()`, `requireUser()` поверх `auth()`

#### Env
- [ ] `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] Те же переменные на Vercel

#### UI
- [ ] `app/login/page.tsx` — кнопка «Войти через Google»
- [ ] `components/Header.tsx` — user + signOut
- [ ] `middleware.ts` — заготовка защиты маршрутов

#### Проверка
- [ ] Google login → callback → сессия OK
- [ ] Logout очищает сессию
- [ ] Без сессии → redirect /login или 401

---

---

### Личный кабинет (до этапа 3)
**PROMPT.md** · приоритет перед LLM

#### Задачи
- [x] `app/cabinet/*` — layout, сайдбар, журнал, open, resolved, settings
- [x] `/` — лендинг + redirect авторизованных на `/cabinet`
- [x] `DELETE /api/decisions/[id]` + UI удаления с confirm
- [x] Поиск, пагинация, EmptyState, DecisionCard
- [x] Заглушки `/decisions/new`, `/decisions/[id]`
- [x] middleware: `/cabinet/*`

#### Проверка
- [x] Гость видит лендинг; после входа — кабинет
- [x] Список только своих Decision
- [x] `npm run build`

---

### Этап 3 — LLM-слой и валидация
**Промпт 3** · Неделя 2

#### Задачи
- [ ] `lib/json.ts` — срез markdown, безопасный parse
- [ ] `lib/llm.ts` — OpenAI client, env config
- [ ] `lib/validators.ts` — ScenarioResponseSchema, TreeResponseSchema, ReviewResponseSchema + input schemas
- [ ] Enum normalize: `z.preprocess` + `toUpperCase()`

#### Проверка
- [ ] Парсинг валидного/невалидного JSON
- [ ] LLM-ключ не утекает на клиент

---

### Этап 4 — Ядро: создание решения
**Промпт 4** · Неделя 2

#### API
- [ ] `POST /api/decisions` — промпт 9.1, транзакция Prisma, ошибка → не сохранять
- [ ] `GET /api/decisions` — список
- [ ] `GET /api/decisions/[id]` — одно решение + ownership
- [x] `DELETE /api/decisions/[id]` — удаление (кабинет)

#### UI
- [x] `app/decisions/new/page.tsx` (заглушка)
- [ ] `components/DecisionForm.tsx`

#### Проверка
- [ ] Демо-кейс §16 → 3 сценария + failure modes в БД
- [ ] Невалидный LLM → ошибка, записей нет

---

### Этап 5 — Экран результата
**Промпт 5** · Неделя 2

#### Задачи
- [x] `app/decisions/[id]/page.tsx` (заглушка)
- [ ] `components/ScenarioCard.tsx`
- [ ] `components/FailureModeList.tsx`
- [ ] `components/LoadingState.tsx`, `components/ErrorMessage.tsx`
- [ ] Кнопки «В журнал», «Отметить исход»
- [ ] Placeholder для дерева (этап 7)

#### Проверка
- [ ] Seed-решение отображает все секции
- [ ] Состояния loading / ready / error

---

### Этап 6 — Журнал (главная)
**Промпт 6** · Неделя 3

#### Задачи
- [x] `app/page.tsx` — лендинг; авторизованные → `/cabinet`
- [x] `components/EmptyState.tsx`
- [x] Кнопка «Новое решение» (в кабинете)
- [x] Лендинг для неавторизованных (H1, слоган, CTA)
- [x] Журнал в `/cabinet` — список решений текущего user

#### Проверка
- [ ] Новое решение появляется в журнале (после этапа 4)
- [x] Empty state при пустом списке

---

### Этап 7 — Дерево развилок
**Промпт 7** · Неделя 3

#### Задачи
- [ ] `POST /api/decisions/[id]/tree` — промпт 9.2, идемпотентность
- [ ] `components/DecisionTree.tsx` — рекурсия, collapse, глубина ≤ 3
- [ ] UX: кнопка генерации / готовое дерево
- [ ] Состояния tree_idle / tree_generating / tree_ready / tree_error

#### Проверка
- [ ] Первая генерация сохраняет JSON
- [ ] Повторное открытие — без LLM
- [ ] Collapse/expand работает

---

### Этап 8 — Ревью по исходу
**Промпт 8** · Неделя 4

#### Задачи
- [ ] `POST /api/decisions/[id]/resolve` — промпт 9.3
- [ ] `app/decisions/[id]/review/page.tsx`
- [ ] status=RESOLVED, resolvedAt

#### Проверка
- [ ] Журнал показывает RESOLVED
- [ ] closest scenario + missed + lesson отображаются

---

### Этап 9 — Полировка и финальный деплой
**Промпт 9** · Неделя 4

#### Задачи
- [ ] Единые LoadingState / EmptyState / ErrorMessage
- [ ] Likelihood-бейджи (LOW/MEDIUM/HIGH)
- [ ] Обработка ошибок LLM и БД
- [ ] Cookie: httpOnly, secure (prod), sameSite
- [ ] `npm run lint`, `npm run build`
- [ ] Prod-тест на демо-кейсе §16
- [ ] Обновить STATUS, CHANGELOG, версию в `lib/version.ts`

#### Проверка
- [ ] Полный user flow end-to-end
- [ ] Vercel prod с env

---

## 5. Карта файлов (итог)

```text
app/
  page.tsx
  login/page.tsx
  decisions/new/page.tsx
  decisions/[id]/page.tsx
  decisions/[id]/review/page.tsx
  api/auth/[...nextauth]/route.ts
  api/decisions/route.ts
  api/decisions/[id]/route.ts
  api/decisions/[id]/tree/route.ts
  api/decisions/[id]/resolve/route.ts

components/
  Header.tsx, DecisionForm.tsx, ScenarioCard.tsx
  FailureModeList.tsx, DecisionTree.tsx
  EmptyState.tsx, LoadingState.tsx, ErrorMessage.tsx

lib/
  prisma.ts, auth.ts, llm.ts, validators.ts, json.ts, version.ts

auth.ts                 # конфиг Auth.js (корень проекта)

prisma/
  schema.prisma, seed.ts

docs/
  PLAN.md, STATUS.md, CHANGELOG.md, PROMPTS.md, DECISIONS.md

.cursor/rules/project.mdc
.env.example
```

---

## 6. Зависимости этапов

```
0 (Smoke) → 1 (Schema) → 2 (Auth) → 3 (LLM) → 4 (Create) → 5 (Result)
                                                      ↓
2 + 5 → 6 (Journal)    4 + 5 → 7 (Tree)    4 + 5 → 8 (Review)
                                                      ↓
                              6 + 7 + 8 → 9 (Polish)
```

**Критический путь:** 0 → 1 → 2 → 3 → 4 → 5 → 7 → 8 → 9.

---

## 7. Риски

| Риск | Митигация |
|------|-----------|
| LLM — невалидный JSON | json.ts + Zod + retry + лог raw |
| Долгая генерация | UI generating, timeout в llm.ts |
| Neon connection limits | pooled URL, синглтон Prisma |
| OpenAI из РФ | OPENAI_BASE_URL или VPN |
| Частичное сохранение | Prisma $transaction |
| Enum регистр | Zod preprocess toUpperCase |

---

## 8. Команда «сводка»

В конце сессии: `сводка` или `завершение` → dev-log, CHANGELOG, STATUS.

См. [TEMPLATE-dev-log.md](./TEMPLATE-dev-log.md).

---

*Прогресс отмечать в [STATUS.md](./STATUS.md) и чеклистах выше.*
