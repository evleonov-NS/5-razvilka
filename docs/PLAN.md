# PLAN.md — пошаговый план разработки «Развилка»

**Версия плана:** 1.0  
**Дата:** 2026-06-25  
**Основа:** [PROJECT.md](../PROJECT.md), [README.md](../README.md)

---

## Текущее состояние

| Область | Статус |
|---------|--------|
| Код приложения | ❌ не начат |
| Prisma / БД | ❌ не начат |
| Деплой Vercel | ❌ не начат |
| Документация | ✅ README, PROJECT, docs/ |

**Следующий шаг:** Этап 0 — каркас + smoke-тест деплоя.

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

- [ ] 1. Зарегистрироваться
- [ ] 2. Войти
- [ ] 3. Создать новое решение
- [ ] 4. Получить 3 сценария будущего
- [ ] 5. Получить pre-mortem
- [ ] 6. Найти решение в журнале (автосохранение после генерации)
- [ ] 7. Открыть решение из журнала
- [ ] 8. Сгенерировать дерево развилок
- [ ] 9. Отметить фактический исход
- [ ] 10. Получить ревью (ближайший сценарий + урок)
- [ ] 11. `npm run build` проходит локально и на Vercel

### Вне scope MVP
Калибровка во времени, редактор дерева, числовые вероятности/деньги, голос, оплата.

---

## 2. Зафиксированная архитектура

| Аспект | Решение |
|--------|---------|
| Фреймворк | Next.js App Router + TypeScript |
| БД | Neon PostgreSQL + Prisma 6 (`url` + `directUrl`) |
| Auth | JWT + bcrypt, httpOnly cookie, без NextAuth |
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
4. **JWT_SECRET** — длинная случайная строка.

### 3.2. Локальная среда
```powershell
Copy-Item .env.example .env
# заполнить переменные в .env
```

### 3.3. npm-зависимости (итог)
```powershell
npm install prisma @prisma/client openai zod bcryptjs jsonwebtoken
npm install -D tsx @types/bcryptjs @types/jsonwebtoken
```

---

## 4. Этапы разработки

### Этап 0 — Каркас + smoke-тест деплоя
**Промпт 0** · Неделя 1 · **Блокирующий**

**Цель:** зелёный деплой на Vercel с чтением из Neon.

#### Задачи
- [ ] `create-next-app` — App Router, TypeScript, Tailwind, ESLint
- [ ] Prisma: временная модель `Note { id, title, createdAt }`
- [ ] `lib/prisma.ts` — синглтон
- [ ] `lib/version.ts` — `__version__`, `versionLabel`
- [ ] `app/page.tsx` — список заметок + футер с версией
- [ ] `.env.example`
- [ ] `prisma/seed.ts` — 2–3 заметки
- [ ] `package.json` scripts: dev, build, start, lint, db:seed
- [ ] Деплой Vercel + миграция Neon

#### Проверка
```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init_note
npm run db:seed
npm run build
npm run dev
```
- [ ] Главная показывает заметки из Neon
- [ ] Vercel build проходит
- [ ] Версия в футере из `lib/version.ts`

---

### Этап 1 — Доменная схема
**Промпт 1** · Неделя 1

#### Задачи
- [ ] Заменить `Note` на схему §6 PROJECT.md (User, Decision, Scenario, FailureMode, enums)
- [ ] Миграция `domain_init`
- [ ] Обновить `seed.ts` — демо-кейс §16
- [ ] Убрать чтение Note с главной

#### Проверка
```powershell
npx prisma migrate dev --name domain_init
npx prisma studio
```
- [ ] Таблицы и связи корректны
- [ ] Seed создаёт демо-пользователя и решение

---

### Этап 2 — Авторизация
**Промпт 2** · Неделя 1

#### Задачи — `lib/auth.ts`
- [ ] `createSessionCookie(userId)`
- [ ] `getCurrentUser()`
- [ ] `requireUser()` → 401
- [ ] `clearSessionCookie()`

#### API
- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/logout`
- [ ] `GET /api/auth/me`

#### UI
- [ ] `app/login/page.tsx`, `app/register/page.tsx`
- [ ] `components/Header.tsx`
- [ ] Защита маршрутов (middleware или layout)

#### Проверка
- [ ] Регистрация → cookie → `/api/auth/me` OK
- [ ] Logout очищает сессию
- [ ] Без cookie → 401 / redirect

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

#### UI
- [ ] `app/decisions/new/page.tsx`
- [ ] `components/DecisionForm.tsx`

#### Проверка
- [ ] Демо-кейс §16 → 3 сценария + failure modes в БД
- [ ] Невалидный LLM → ошибка, записей нет

---

### Этап 5 — Экран результата
**Промпт 5** · Неделя 2

#### Задачи
- [ ] `app/decisions/[id]/page.tsx`
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
- [ ] `app/page.tsx` — список решений текущего user
- [ ] `components/EmptyState.tsx`
- [ ] Кнопка «Новое решение»
- [ ] Лендинг для неавторизованных (H1, слоган, CTA)

#### Проверка
- [ ] Новое решение появляется в журнале
- [ ] Empty state при пустом списке

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
  register/page.tsx
  decisions/new/page.tsx
  decisions/[id]/page.tsx
  decisions/[id]/review/page.tsx
  api/auth/{register,login,logout,me}/route.ts
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
