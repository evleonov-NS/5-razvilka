# ТЗ: «Развилка» — симулятор последствий решений

Версия: MVP v1. Стек: Next.js (App Router, TypeScript) + Prisma (v6) + Neon (PostgreSQL) + деплой на Vercel.

- **Название:** Развилка
- **Слоган:** «Посмотри, куда ведёт каждый выбор»
- **Первый экран:** H1 «Развилка» · подзаголовок «Посмотри, куда ведёт каждый выбор» · оффер «Опиши решение или привычку — увидишь сценарии будущего, узнаешь, где всё может сломаться, и что сделать уже сейчас, чтобы этого избежать.» · CTA «Разобрать решение» · микро-копи «Первый разбор — бесплатно.»

---

## 1. Обзор продукта

**Суть.** Пользователь описывает решение или привычку (взять ипотеку, сменить работу, внедрить новый материал на производстве, скальпить по 4 часа в день). Сервис моделирует, как это разворачивается во времени: связные сценарии будущего, классический pre-mortem («представь, что это провалилось — почему») с предупреждающими действиями, и дерево развилок — ключевые точки выбора и куда они ведут. Решения копятся в журнал; когда исход известен — сервис оценивает, насколько прогноз сбылся.

**Killer-крючок.** «Прожить» последствия выбора до того, как ты его сделал — и заранее увидеть, где он ломается.

**Для кого.** Принимающие важные решения: основатели, управленцы, инвесторы, и любой, кто стоит перед развилкой жизни/денег/карьеры.

**Почему ИИ незаменим (ров).** Связные сценарии и развилки строятся под конкретную ситуацию — статикой не сделать. Ров расширяется журналом и калибровкой: со временем видно, как пользователь систематически переоценивает или недооценивает риски. Это копится и не переносится промптом к конкуренту.

**Честная рамка.** Сервис не предсказывает будущее и не даёт «правильный ответ». Он раскладывает варианты и риски. Никакой фейковой точности — вероятность как метка (низкая/средняя/высокая), не процент.

---

## 2. Границы MVP

**Входит:** регистрация/вход; ввод решения (контекст + горизонт + тип); генерация сценариев + pre-mortem; дерево развилок; журнал; базовое ревью по исходу.

**Не входит (отложить):** аналитика калибровки во времени; интерактивный редактор дерева; числовые вероятности/деньги; голос; оплата.

---

## 3. Экраны с состояниями

### 3.1. Вход / Регистрация
- email, пароль. Состояния: `idle` → `loading` → `error` → успех.

### 3.2. Главная / Журнал решений
- Кнопка «Новое решение», список (название + горизонт + статус: открыто/решено).
- Состояния: `empty`, `list`.

### 3.3. Ввод решения
- Поле «Какое решение или привычку рассматриваешь?», большое поле «контекст», горизонт (3 мес / 1 год / 5 лет), тип (решение / привычка).
- Состояния: `idle`, `error` (контекст короткий), `submitting`.

### 3.4. Результат
- Секции: **Сценарии будущего** (3 карточки: оптимистичный/базовый/пессимистичный + метка вероятности + нарратив), **Pre-mortem** («если провалится — почему» + «что сделать сейчас»), **Дерево развилок** (вложенный сворачиваемый вид). Кнопки «В журнал», «Отметить исход».
- Состояния: `generating` → `ready` → `error`.

### 3.5. Ревью решения
- Поле «что вышло по факту» → какой сценарий сбылся, что упущено, 1 урок.
- Состояния: `generating` → `ready`.

---

## 4. Модель данных (Prisma + PostgreSQL)

Связи: `User` 1—N `Decision` 1—N (`Scenario`, `FailureMode`). Дерево развилок — поле `tree Json?`.

prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Horizon       { THREE_MONTHS ONE_YEAR FIVE_YEARS }
enum DecisionType  { DECISION HABIT }
enum DecisionStatus{ OPEN RESOLVED }
enum ScenarioKind  { OPTIMISTIC BASE PESSIMISTIC }
enum Likelihood    { LOW MEDIUM HIGH }

model User {
  id           String     @id @default(uuid()) @db.Uuid
  email        String     @unique
  passwordHash String
  createdAt    DateTime   @default(now())
  decisions    Decision[]
}

model Decision {
  id           String         @id @default(uuid()) @db.Uuid
  userId       String         @db.Uuid
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  title        String
  context      String
  horizon      Horizon        @default(ONE_YEAR)
  type         DecisionType   @default(DECISION)
  status       DecisionStatus @default(OPEN)
  tree         Json?          // дерево развилок (вложенное)
  outcome      String?
  lesson       String?
  createdAt    DateTime       @default(now())
  resolvedAt   DateTime?
  scenarios    Scenario[]
  failureModes FailureMode[]

  @@index([userId])
}

model Scenario {
  id         String       @id @default(uuid()) @db.Uuid
  decisionId String       @db.Uuid
  decision   Decision     @relation(fields: [decisionId], references: [id], onDelete: Cascade)
  kind       ScenarioKind
  likelihood Likelihood
  narrative  String
  orderIdx   Int          @default(0)

  @@index([decisionId])
}

model FailureMode {
  id         String   @id @default(uuid()) @db.Uuid
  decisionId String   @db.Uuid
  decision   Decision @relation(fields: [decisionId], references: [id], onDelete: Cascade)
  cause      String
  prevention String
  orderIdx   Int      @default(0)

  @@index([decisionId])
}
```

Форма `tree` (Json, глубина 2–3):

```text
{
  "label": "Решение: ...",
  "branches": [
    {"choice": "...", "consequence": "...", "likelihood": "medium", "branches": []}
  ]
}
```

---

## 5. Ключевые промпты (полные тексты)

Серверные (вызовы LLM только из Route Handlers / Server Actions), ключ из `.env`. Промпты с JSON — срезать markdown перед `JSON.parse`.

### 5.1. Сценарии + pre-mortem (system) — ядро

```text
Ты — аналитик решений. Пользователь рассматривает решение или привычку. Не давай
готовый совет «делай / не делай». Смоделируй, как это разворачивается во времени,
и вскрой риски заранее (метод pre-mortem).

Сделай две вещи:
1. СЦЕНАРИИ. Три связных сценария на горизонт: оптимистичный, базовый, пессимистичный.
   Для каждого — метка вероятности (low/medium/high) и краткий нарратив. Базовый — самый правдоподобный.
2. PRE-MORTEM. Представь, что прошёл горизонт и это ПРОВАЛИЛОСЬ. Назови 3-5 главных
   причин провала и на каждую — конкретное предупреждающее действие на СЕЙЧАС.

Не выдумывай цифр и фактов. Вероятность — только метка, не процент.

Название: {{TITLE}}
Контекст: {{CONTEXT}}
Горизонт: {{HORIZON}}
Тип: {{TYPE}}

Верни ТОЛЬКО JSON, без markdown:
{
  "scenarios": [
    {"kind": "optimistic", "likelihood": "low|medium|high", "narrative": "..."},
    {"kind": "base", "likelihood": "...", "narrative": "..."},
    {"kind": "pessimistic", "likelihood": "...", "narrative": "..."}
  ],
  "failure_modes": [ {"cause": "...", "prevention": "..."} ]
}
```

### 5.2. Дерево развилок (system)

```text
Построй дерево ключевых развилок — точек, где выбор сильно меняет исход. Глубина 2-3
уровня. Только значимые развилки. На каждой ветке — короткое следствие и метка вероятности.

Название: {{TITLE}}
Контекст: {{CONTEXT}}
Горизонт: {{HORIZON}}

Верни ТОЛЬКО JSON, без markdown:
{"label": "Решение: ...", "branches": [{"choice": "...", "consequence": "...", "likelihood": "low|medium|high", "branches": []}]}
```

### 5.3. Ревью-калибровка (system)

```text
Пользователь смоделировал решение, теперь известен исход. Даны сценарии и факт.

Решение: {{TITLE}}
Прогнозы: {{SCENARIOS}}
Факт: {{OUTCOME}}

Оцени: какой сценарий ближе всего, что упущено, и РОВНО один урок на будущее.

Верни ТОЛЬКО JSON:
{"closest_scenario": "optimistic|base|pessimistic", "missed": "...", "lesson": "..."}
```

---

## 6. Эндпоинты (Next.js App Router — Route Handlers)

Каждый — файл `app/api/.../route.ts`. Альтернатива — Server Actions для мутаций.

```text
POST app/api/auth/register/route.ts        { email, password }                 -> { token }
POST app/api/auth/login/route.ts           { email, password }                  -> { token }

GET  app/api/decisions/route.ts                                                 -> [ {id, title, horizon, status, createdAt} ]
POST app/api/decisions/route.ts            { title, context, horizon, type }    -> { decisionId, scenarios, failureModes }   // 5.1
GET  app/api/decisions/[id]/route.ts                                            -> { decision, scenarios, failureModes, tree }
POST app/api/decisions/[id]/tree/route.ts                                       -> { tree }                                  // 5.2
POST app/api/decisions/[id]/resolve/route.ts  { outcome }                       -> { closestScenario, missed, lesson }       // 5.3
```

Все обработчики используют Node runtime (Prisma с pg несовместим с Edge). Клиент Prisma — синглтон из `lib/prisma.ts`.

---

## 7. Стек и архитектура

- **Фреймворк:** Next.js (App Router, TypeScript). Серверные компоненты читают БД напрямую; мутации — Route Handlers / Server Actions.
- **ORM:** Prisma 6 (классическая схема: `url` + `directUrl`, импорт из `@prisma/client`).
- **БД:** Neon (PostgreSQL). `DATABASE_URL` — pooled, `DIRECT_URL` — direct (для миграций).
- **LLM:** провайдер на выбор, вызовы к API только с сервера, ключ из `.env`. Модель — на выбор: подешевле для баланса цена/качество, помощнее для более «умных» сценариев.
- **Auth:** на выбор — NextAuth (Auth.js) или собственный JWT + bcrypt.
- **Деплой:** Vercel. `build` запускает `prisma generate && next build`; env-переменные `DATABASE_URL`, `DIRECT_URL`, `LLM_API_KEY` в настройках проекта.
- **Секреты:** `.env` (в `.gitignore`), на проде — переменные окружения Vercel.

---

## 8. Roadmap MVP (4 недели)

**Неделя 1 — каркас и пайплайн.**
- create-next-app + Prisma + Neon, минимальная сущность для проверки чтения из БД.
- Деплой smoke-теста на Vercel (главная читает из Neon).
- Схема домена (User, Decision, Scenario, FailureMode), миграция.
- Регистрация/вход.

**Неделя 2 — ядро.**
- Ввод решения → промпт 5.1 → сценарии + pre-mortem (Route Handler).
- Экран результата с секциями.

**Неделя 3 — дерево и журнал.**
- Дерево развилок (промпт 5.2) + вложенный вывод.
- Журнал решений (список, открытие).

**Неделя 4 — ревью и полировка.**
- Ревью по исходу (промпт 5.3): какой сценарий сбылся + урок.
- Обработка ошибок/loading, аккуратный UI.
- Финальный деплой на Vercel, боевой тест на реальном решении.

---

## 9. Промпт для старта в Cursor

```text
Создай веб-сервис «Развилка» — симулятор последствий решений. Пользователь описывает
решение или привычку, сервис моделирует сценарии будущего, делает pre-mortem (причины
провала + что сделать сейчас) и строит дерево развилок. Решения копятся в журнал; по
исходу — оценка, какой сценарий сбылся.

Стек: Next.js (App Router, TypeScript) + Prisma 6 + Neon (PostgreSQL), деплой на Vercel.
Вызовы к API — только на сервере (Route Handlers), ключ из .env.

MVP:
1. Регистрация и вход (JWT + bcrypt либо Auth.js).
2. Ввод решения: название + контекст + горизонт (3 мес / 1 год / 5 лет) + тип (решение/привычка).
3. Route Handler вызывает LLM и возвращает строгий JSON: 3 сценария (optimistic/base/
   pessimistic, метка вероятности + нарратив) и failure_modes (cause + prevention). Показать секциями.
4. Дерево развилок отдельным эндпоинтом: вложенный JSON {label, branches:[{choice,
   consequence, likelihood, branches}]}, глубина 2-3, вывести сворачиваемым деревом.
5. Журнал решений (серверные компоненты читают БД напрямую).
6. Ревью по исходу: отметить факт -> какой сценарий ближе + 1 урок.

Prisma-схема: enum Horizon/DecisionType/DecisionStatus/ScenarioKind/Likelihood;
User; Decision (userId, title, context, horizon, type, status, tree Json?, outcome,
lesson, relations); Scenario (decisionId, kind, likelihood, narrative); FailureMode
(decisionId, cause, prevention). Внешние ключи через relations, индексы @@index.

datasource: url=env(DATABASE_URL) pooled, directUrl=env(DIRECT_URL). Клиент Prisma —
синглтон в lib/prisma.ts. build = "prisma generate && next build". Никакой фейковой
точности: вероятность как метка. JSON-промпты — срезать markdown перед JSON.parse.

Комментарии в коде на русском (зачем), имена переменных на английском. Секреты через
process.env, .env в .gitignore.

Начни с каркаса и Prisma-схемы, дальше по шагам.
```
