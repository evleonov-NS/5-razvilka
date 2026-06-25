# PROJECT.md — «Развилка»

Полное продуктово-техническое описание MVP для разработки в Cursor AI.

**Версия:** MVP v1.
**Стек:** Next.js (App Router, TypeScript) + Prisma 6 + Neon (PostgreSQL) + деплой на Vercel.

- **Название:** Развилка
- **Слоган:** «Посмотри, куда ведёт каждый выбор»
- **Первый экран:** H1 «Развилка» · подзаголовок «Посмотри, куда ведёт каждый выбор» · оффер «Опиши решение или привычку — увидишь сценарии будущего, узнаешь, где всё может сломаться, и что сделать уже сейчас, чтобы этого избежать.» · CTA «Разобрать решение» · микро-копи «Первый разбор — бесплатно.»

---

## 1. Обзор продукта

**Суть.** Пользователь описывает решение или привычку (взять ипотеку, сменить работу, внедрить новый материал на производстве, скальпить по 4 часа в день). Сервис моделирует, как это разворачивается во времени: связные сценарии будущего, классический pre-mortem («представь, что это провалилось — почему») с предупреждающими действиями, и дерево развилок — ключевые точки выбора и куда они ведут. Решения копятся в журнал; когда исход известен — сервис оценивает, насколько прогноз сбылся.

**Killer-крючок.** «Прожить» последствия выбора до того, как ты его сделал — и заранее увидеть, где он ломается.

**Для кого.** Принимающие важные решения: основатели, управленцы, инвесторы, и любой, кто стоит перед развилкой жизни/денег/карьеры.

**Почему ИИ незаменим (ров).** Связные сценарии и развилки строятся под конкретную ситуацию — статикой не сделать. Ров расширяется журналом и калибровкой: со временем видно, как пользователь систематически переоценивает или недооценивает риски. Это копится и не переносится промптом к конкуренту.

**Честная рамка.** Сервис не предсказывает будущее и не даёт «правильный ответ». Он раскладывает варианты и риски. Никакой фейковой точности — вероятность как метка (низкая/средняя/высокая), не процент. (Полный список ограничений — §11.)

---

## 2. Границы MVP

**Входит:** регистрация/вход; ввод решения (контекст + горизонт + тип); генерация сценариев + pre-mortem; дерево развилок; журнал; базовое ревью по исходу.

**Не входит (отложить):** аналитика калибровки во времени; интерактивный редактор дерева; числовые вероятности/деньги; голос; оплата.

---

## 3. Зафиксированные технические решения (без выбора для Cursor)

Чтобы Cursor не плодил лишнего и не «думал» над развилками архитектуры — все ключевые решения зафиксированы:

| Аспект | Решение | Примечание |
|--------|---------|------------|
| Фреймворк | Next.js (App Router, TypeScript) | — |
| ORM | Prisma 6 | `url` (pooled) + `directUrl` (миграции) |
| БД | Neon (PostgreSQL) | — |
| Auth | JWT + bcrypt в httpOnly cookie | без NextAuth; сессия в cookie, не в localStorage |
| Мутации | Route Handlers (`app/api/.../route.ts`) | без Server Actions |
| Чтение данных | Server Components (читают БД напрямую) | — |
| UI | Tailwind CSS | — |
| Валидация | Zod (вход + ответы LLM) | §10 |
| LLM | OpenAI-совместимый клиент (`openai` npm) | base URL конфигурируемый, §12 |
| Деплой | Vercel | `build = prisma generate && next build` |

---

## 4. User Stories

1. Как пользователь, я хочу описать решение, чтобы увидеть возможные сценарии будущего.
2. Как пользователь, я хочу увидеть причины возможного провала, чтобы заранее снизить риски.
3. Как пользователь, я хочу видеть созданный разбор в журнале, чтобы вернуться к нему позже.
4. Как пользователь, я хочу видеть дерево развилок, чтобы понять ключевые точки выбора.
5. Как пользователь, я хочу отметить фактический исход, чтобы понять, насколько прогноз был полезен.

---

## 5. Экраны с состояниями

### 5.1. Вход / Регистрация
- email, пароль. Состояния: `idle` → `loading` → `error` → успех.

### 5.2. Главная / Журнал решений
- Кнопка «Новое решение», список (название + горизонт + статус: открыто/решено).
- Состояния: `empty`, `list`.

### 5.3. Ввод решения
- Поле «Какое решение или привычку рассматриваешь?», большое поле «контекст», горизонт (3 мес / 1 год / 5 лет), тип (решение / привычка).
- Состояния: `idle` → `submitting` → `generating` → `redirect` (на экран результата) / `error`. Плюс `error` валидации, если контекст слишком короткий.

### 5.4. Результат
- Секции: **Сценарии будущего** (3 карточки: оптимистичный/базовый/пессимистичный + метка вероятности + нарратив), **Pre-mortem** («если провалится — почему» + «что сделать сейчас»), **Дерево развилок**. Решение уже сохранено в журнал при генерации; кнопка «В журнал» ведёт на список (главную), «Отметить исход» — на экран ревью.
- **Дерево развилок** генерируется отдельно (`POST /api/decisions/[id]/tree`), НЕ вместе со сценариями:
  - если `Decision.tree` пустой — показать кнопку «Сгенерировать дерево развилок»;
  - после генерации — сохранить в `Decision.tree` и отрисовать `DecisionTree` (вложенный сворачиваемый вид);
  - если `tree` уже есть — сразу показать дерево.
- Состояния страницы: `loading` → `ready` → `error`.
- Состояния дерева: `tree_idle` → `tree_generating` → `tree_ready` → `tree_error`.

### 5.5. Ревью решения
- Поле «что вышло по факту» → какой сценарий сбылся, что упущено, 1 урок.
- Состояния: `generating` → `ready`.

---

## 6. Модель данных (Prisma + PostgreSQL)

Связи: `User` 1—N `Decision` 1—N (`Scenario`, `FailureMode`). Дерево развилок — поле `tree Json?`.

> **Note (временно, только Этап 0).** Для smoke-теста деплоя на старте заводится минимальная сущность `Note { id Uuid, title String, createdAt DateTime }`. После того как доменная схема ниже мигрирована и главная читает реальные данные — `Note` можно удалить.

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
  outcome               String?
  lesson                String?
  reviewClosestScenario ScenarioKind?  // какой сценарий оказался ближе (из ревью)
  reviewMissed          String?        // что упущено (из ревью)
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  resolvedAt            DateTime?
  scenarios             Scenario[]
  failureModes          FailureMode[]

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
    {"choice": "...", "consequence": "...", "likelihood": "MEDIUM", "branches": []}
  ]
}
```

---

## 7. Структура проекта

```text
app/
  page.tsx                     # журнал (Server Component, читает БД)
  login/page.tsx
  register/page.tsx
  decisions/new/page.tsx       # ввод решения
  decisions/[id]/page.tsx      # результат: сценарии + pre-mortem + дерево
  decisions/[id]/review/page.tsx
  api/
    auth/register/route.ts         # POST: создать пользователя, выставить httpOnly cookie
    auth/login/route.ts            # POST: проверить пароль, выставить cookie
    auth/logout/route.ts           # POST: очистить cookie
    auth/me/route.ts               # GET: текущий пользователь | 401
    decisions/route.ts             # GET список / POST создать (промпт 9.1)
    decisions/[id]/route.ts        # GET одно решение
    decisions/[id]/tree/route.ts   # POST дерево развилок (промпт 9.2)
    decisions/[id]/resolve/route.ts# POST ревью по исходу (промпт 9.3)

components/
  Header.tsx
  DecisionForm.tsx
  ScenarioCard.tsx
  FailureModeList.tsx
  DecisionTree.tsx
  EmptyState.tsx
  LoadingState.tsx
  ErrorMessage.tsx

lib/
  prisma.ts        # синглтон PrismaClient
  auth.ts          # JWT + bcrypt; createSessionCookie / getCurrentUser / requireUser / clearSessionCookie
  llm.ts           # OpenAI-совместимый клиент + вызовы
  validators.ts    # Zod-схемы (вход + ответы LLM, нормализация регистра enum)
  json.ts          # срезать markdown, безопасный JSON.parse
  version.ts       # единый источник версии (__version__), §19

prisma/
  schema.prisma
  seed.ts          # демо-данные

docs/
  PLAN.md          # пошаговый план разработки (готовит Cursor на старте)
  STATUS.md        # текущее состояние проекта
  CHANGELOG.md     # история изменений
  PROMPTS.md       # рабочие промпты проекта
  DECISIONS.md     # принятые решения и причины
  TEMPLATE-dev-log.md            # шаблон dev-log; копии — docs/YY.MM.DD-CRS-...md

.env.example
.cursor/rules/project.mdc
```

---

## 8. Эндпоинты (Next.js App Router — Route Handlers)

Каждый — файл `app/api/.../route.ts`. Все — Node runtime (Prisma с pg несовместим с Edge). Клиент Prisma — синглтон из `lib/prisma.ts`.

```text
POST app/api/auth/register/route.ts        { email, password }                 -> set httpOnly cookie + { user }
POST app/api/auth/login/route.ts           { email, password }                 -> set httpOnly cookie + { user }
POST app/api/auth/logout/route.ts                                              -> clear cookie
GET  app/api/auth/me/route.ts                                                  -> { user } | 401

GET  app/api/decisions/route.ts                                                -> [ {id, title, horizon, status, createdAt} ]
POST app/api/decisions/route.ts            { title, context, horizon, type }   -> { decisionId, scenarios, failureModes }   // 9.1
GET  app/api/decisions/[id]/route.ts                                           -> { decision, scenarios, failureModes, tree }
POST app/api/decisions/[id]/tree/route.ts                                      -> { tree }                                  // 9.2
POST app/api/decisions/[id]/resolve/route.ts  { outcome }                      -> { closestScenario, missed, lesson }       // 9.3
```

Сессия — в httpOnly cookie (не localStorage), чтобы её читали и Route Handlers, и Server Components. Защищённые эндпоинты (`/api/decisions/*`, `/api/auth/me`) вызывают `requireUser()` из `lib/auth.ts`; без валидной сессии — `401`.

---

## 9. Ключевые промпты (полные тексты)

Серверные (вызовы LLM только из Route Handlers), ключ из `.env`. Промпты с JSON — срезать markdown перед `JSON.parse` (`lib/json.ts`), затем валидировать через Zod (§10).

### 9.1. Сценарии + pre-mortem (system) — ядро
```text
Ты — аналитик решений. Пользователь рассматривает решение или привычку. Не давай
готовый совет «делай / не делай». Смоделируй, как это разворачивается во времени,
и вскрой риски заранее (метод pre-mortem).

Сделай две вещи:
1. СЦЕНАРИИ. Три связных сценария на горизонт: оптимистичный, базовый, пессимистичный.
   Для каждого — метка вероятности (LOW/MEDIUM/HIGH) и краткий нарратив. Базовый — самый правдоподобный.
2. PRE-MORTEM. Представь, что прошёл горизонт и это ПРОВАЛИЛОСЬ. Назови 3-5 главных
   причин провала и на каждую — конкретное предупреждающее действие на СЕЙЧАС.

Не выдумывай цифр и фактов. Вероятность — только метка, не процент.

Название: {{TITLE}}
Контекст: {{CONTEXT}}
Горизонт: {{HORIZON}}
Тип: {{TYPE}}

Верни ТОЛЬКО JSON, без markdown. Значения kind и likelihood — В ВЕРХНЕМ РЕГИСТРЕ:
{
  "scenarios": [
    {"kind": "OPTIMISTIC", "likelihood": "LOW|MEDIUM|HIGH", "narrative": "..."},
    {"kind": "BASE", "likelihood": "...", "narrative": "..."},
    {"kind": "PESSIMISTIC", "likelihood": "...", "narrative": "..."}
  ],
  "failure_modes": [ {"cause": "...", "prevention": "..."} ]
}
```

### 9.2. Дерево развилок (system)
```text
Построй дерево ключевых развилок — точек, где выбор сильно меняет исход. Глубина 2-3
уровня. Только значимые развилки. На каждой ветке — короткое следствие и метка вероятности.

Название: {{TITLE}}
Контекст: {{CONTEXT}}
Горизонт: {{HORIZON}}

Верни ТОЛЬКО JSON, без markdown. likelihood — В ВЕРХНЕМ РЕГИСТРЕ:
{"label": "Решение: ...", "branches": [{"choice": "...", "consequence": "...", "likelihood": "LOW|MEDIUM|HIGH", "branches": []}]}
```

### 9.3. Ревью-калибровка (system)
```text
Пользователь смоделировал решение, теперь известен исход. Даны сценарии и факт.

Решение: {{TITLE}}
Прогнозы: {{SCENARIOS}}
Факт: {{OUTCOME}}

Оцени: какой сценарий ближе всего, что упущено, и РОВНО один урок на будущее.

Верни ТОЛЬКО JSON. closest_scenario — В ВЕРХНЕМ РЕГИСТРЕ:
{"closest_scenario": "OPTIMISTIC|BASE|PESSIMISTIC", "missed": "...", "lesson": "..."}
```

---

## 10. Валидация LLM-ответов (Zod)

Любой ответ LLM проходит через `lib/json.ts` (срез markdown → `JSON.parse`) и затем через Zod-схему. Сырой текст ответа — без схемы в БД не пишем.

При невалидном JSON:
1. показать пользователю понятную ошибку («не удалось разобрать ответ, попробуйте ещё раз»);
2. **не сохранять** частичный результат в БД;
3. залогировать сырой ответ на сервере (`console.error`, без секретов);
4. не ронять всё приложение — вернуть `502/422` с телом ошибки.

**Регистр enum.** Промпты просят значения в ВЕРХНЕМ регистре (LOW/MEDIUM/HIGH, OPTIMISTIC/BASE/PESSIMISTIC) — точно как в Prisma enum. Zod дополнительно нормализует вход в верхний регистр перед проверкой (`z.preprocess` + `String().toUpperCase()`), поэтому даже ответ в нижнем регистре корректно ложится в Prisma enum. Отдельный маппер low→LOW не нужен.

Схемы (`lib/validators.ts`):
```text
ScenarioResponseSchema
  scenarios:     array, ровно 3 элемента
    kind:        "OPTIMISTIC" | "BASE" | "PESSIMISTIC"
    likelihood:  "LOW" | "MEDIUM" | "HIGH"
    narrative:   string, непустая
  failure_modes: array, min 3, max 5
    cause:       string, непустая
    prevention:  string, непустая

TreeResponseSchema
  label:    string
  branches: array (рекурсивно)
    choice:      string
    consequence: string
    likelihood:  "LOW" | "MEDIUM" | "HIGH"
    branches:    array (та же схема)
  Ограничить глубину рекурсии 3 уровнями при отображении.

ReviewResponseSchema
  closest_scenario: "OPTIMISTIC" | "BASE" | "PESSIMISTIC"
  missed:           string
  lesson:           string
```

Тот же Zod валидирует и пользовательский ввод на эндпоинтах (email/пароль, поля решения).

---

## 11. Ограничения генерации ИИ

ИИ **не должен**:
- давать категоричный совет «делай / не делай»;
- обещать точный прогноз;
- использовать числовые проценты вероятности;
- выдумывать факты и цифры;
- давать юридические, медицинские или инвестиционные рекомендации как окончательный совет.

ИИ **должен**:
- показывать варианты;
- явно указывать риски;
- писать, каких данных не хватает для надёжной оценки;
- использовать вероятность только как метку LOW / MEDIUM / HIGH.

---

## 12. .env.example

```text
# --- База данных (Neon) ---
# pooled-строка для приложения
DATABASE_URL=
# direct-строка для миграций Prisma
DIRECT_URL=

# --- Auth ---
# секрет для подписи JWT (длинная случайная строка)
JWT_SECRET=

# --- LLM (OpenAI-совместимый) ---
OPENAI_API_KEY=
# base URL провайдера. Прямой OpenAI: оставить пустым/дефолт.
# Из РФ для локальной разработки — URL агрегатора/прокси (OpenAI-совместимый).
OPENAI_BASE_URL=
# модель: подешевле — для баланса цена/качество, помощнее — для «умных» сценариев
LLM_MODEL=
```

> На проде (Vercel) запросы к LLM уходят с серверов Vercel вне РФ — прямой OpenAI работает.
> Локально из РФ — либо VPN, либо `OPENAI_BASE_URL` на OpenAI-совместимый агрегатор.
> `.env` — всегда в `.gitignore`. На проде значения задаются в настройках проекта Vercel.

---

## 13. Команды и package.json

Команды:
```text
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Сборка:
```text
npm run build
```

package.json (scripts):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

---

## 14. Правила для Cursor (.cursor/rules/project.mdc)

```text
Стек строго: Next.js App Router + TypeScript + Prisma 6 + PostgreSQL (Neon) + Tailwind + Zod.
Auth — JWT + bcrypt, сессия в httpOnly cookie (НЕ localStorage), без NextAuth.
  lib/auth.ts: createSessionCookie / getCurrentUser / requireUser / clearSessionCookie.
  Защищённые эндпоинты вызывают requireUser(); Server Components читают сессию из cookie.
Мутации — только Route Handlers (app/api/.../route.ts). Чтение данных — Server Components.
Вызовы LLM — только на сервере, ключ через process.env. Никогда не светить ключ на клиенте.
LLM-клиент — OpenAI-совместимый (npm openai) с настраиваемым baseURL из env.
Любой ответ LLM: срезать markdown (lib/json.ts) -> JSON.parse -> Zod-валидация. Невалидный — не сохранять, вернуть ошибку, залогировать сырой ответ.
Значения enum (likelihood, kind) — в ВЕРХНЕМ регистре (LOW/MEDIUM/HIGH, OPTIMISTIC/BASE/PESSIMISTIC), как в Prisma. Zod нормализует регистр; отдельный маппер не нужен.
PrismaClient — синглтон из lib/prisma.ts. Все обработчики — Node runtime (не Edge).
Все эндпоинты валидируют вход через Zod.
Версия — единый источник lib/version.ts (__version__ = version/date/time). Использовать её в UI, логах, сборке. НЕ хардкодить номер версии в других файлах.
Документы держать в актуальном состоянии: docs/STATUS.md, docs/PLAN.md, docs/CHANGELOG.md, docs/PROMPTS.md, docs/DECISIONS.md.
По запросу «сводка» / «завершение»: заполнить docs/TEMPLATE-dev-log.md и сохранить копию docs/YY.MM.DD-CRS-Краткое_название-vX.X.md (код CRS = Cursor); обновить CHANGELOG.md и STATUS.md.
Комментарии в коде — на русском (зачем, не что). Имена переменных — на английском, понятные.
Секреты — только через process.env. .env всегда в .gitignore. Пароли не выводить в логи.
Вероятность — только метка LOW/MEDIUM/HIGH, никаких процентов и выдуманных цифр.
Не давать в ответах ИИ окончательных юр./мед./инвест. советов.
```

---

## 15. Definition of Done (MVP)

MVP готов, если пользователь может:

1. Зарегистрироваться.
2. Войти.
3. Создать новое решение.
4. Получить 3 сценария будущего.
5. Получить pre-mortem (причины провала + что сделать сейчас).
6. Найти сохранённое решение в журнале (оно появляется автоматически после генерации).
7. Открыть решение из журнала.
8. Сгенерировать дерево развилок.
9. Отметить фактический исход.
10. Получить ревью: какой сценарий оказался ближе и один урок.
11. `npm run build` проходит локально и на Vercel без ошибок.

---

## 16. Демо-кейс для проверки (seed)

`prisma/seed.ts` создаёт демо-пользователя и одно решение для быстрой проверки генерации без ручного ввода.

```text
Название:  Сменить работу в течение года
Контекст:  Работаю на текущем месте, но чувствую потолок по развитию и доходу.
           Есть страх потерять стабильность. Семья и финансовые обязательства.
           Рассматриваю поиск новой работы в ближайший год.
Горизонт:  1 год (ONE_YEAR)
Тип:       решение (DECISION)
```

---

## 17. Roadmap MVP (4 недели)

**Неделя 1 — каркас и пайплайн (bootstrap-first).**
- create-next-app + Prisma + Neon, сущность `Note` для проверки чтения из БД.
- Деплой smoke-теста на Vercel: главная читает заметки из Neon. **Зелёный деплой — обязательное условие для перехода дальше.**
- Доменная схема (User, Decision, Scenario, FailureMode), миграция; `Note` можно удалить.
- Регистрация/вход (JWT + bcrypt, httpOnly cookie).

**Неделя 2 — ядро.**
- `lib/llm.ts` + `lib/json.ts` + Zod-валидаторы.
- Ввод решения → промпт 9.1 → сценарии + pre-mortem (Route Handler).
- Экран результата с секциями.

**Неделя 3 — дерево и журнал.**
- Дерево развилок (промпт 9.2) + вложенный сворачиваемый вывод.
- Журнал решений (Server Components, список, открытие).

**Неделя 4 — ревью и полировка.**
- Ревью по исходу (промпт 9.3): какой сценарий сбылся + урок.
- Состояния loading/empty/error, аккуратный UI.
- Финальный деплой на Vercel, боевой тест на реальном решении.

---

## 18. Пошаговые промпты для Cursor

Серия управляемых промптов вместо одного большого. Каждый — отдельный шаг, после каждого dev-проверка.

**Промпт 0 — каркас + smoke-тест (= твой стартовый сценарий с Note).**
```text
Ты — ведущий fullstack-разработчик. Создай минимальный рабочий проект на Next.js
(App Router, TypeScript) + Prisma + Neon (PostgreSQL), готовый к деплою на Vercel.
Цель: после деплоя открывается главная, которая читает данные из Neon и показывает их.
Сущность Note: id (uuid), title (string), createdAt (DateTime).
Дай: создание проекта, установку зависимостей, .env (по .env.example), prisma/schema.prisma,
миграцию, минимальный seed, пример запроса к БД на главной. build = prisma generate && next build.
Всё через env, без лишних зависимостей. Заведи lib/version.ts с __version__ (version/date/time)
и выведи версию в футере главной.
```

**Промпт 1 — доменная схема.**
```text
Замени Note на доменную схему из PROJECT.md §6: enum Horizon/DecisionType/DecisionStatus/
ScenarioKind/Likelihood; User; Decision (tree Json?, outcome, lesson, reviewClosestScenario, reviewMissed, updatedAt, relations);
Scenario; FailureMode. Внешние ключи через relations, индексы @@index. Сделай миграцию.
```

**Промпт 2 — auth (JWT + bcrypt).**
```text
Сделай регистрацию и вход: app/api/auth/{register,login,logout} и GET /api/auth/me (Route
Handlers). bcrypt для пароля, JWT в httpOnly cookie (JWT_SECRET из env). lib/auth.ts:
createSessionCookie / getCurrentUser / requireUser / clearSessionCookie. Вход валидируй
через Zod. Экраны login/register с состояниями.
```

**Промпт 3 — LLM-слой.**
```text
lib/llm.ts: OpenAI-совместимый клиент (npm openai), baseURL и модель из env, вызовы только
на сервере. lib/json.ts: срезать markdown и безопасно распарсить JSON. lib/validators.ts:
Zod-схемы ScenarioResponseSchema, TreeResponseSchema, ReviewResponseSchema (PROJECT.md §10).
```

**Промпт 4 — ядро: сценарии + pre-mortem.**
```text
POST app/api/decisions: принять {title, context, horizon, type} (Zod), вызвать промпт 9.1,
распарсить и провалидировать через ScenarioResponseSchema, сохранить Decision + Scenario[] +
FailureMode[]. При невалидном JSON — не сохранять, вернуть ошибку, залогировать сырой ответ.
GET app/api/decisions — список.
```

**Промпт 5 — экран результата.**
```text
Страница decisions/[id]: секции «Сценарии будущего» (3 карточки ScenarioCard), «Pre-mortem»
(FailureModeList: cause + prevention). Состояния страницы loading/ready/error. Кнопки «В журнал»,
«Отметить исход».
```

**Промпт 6 — журнал.**
```text
Главная app/page.tsx — Server Component, читает решения текущего пользователя из БД напрямую
(список: название, горизонт, статус). EmptyState, если пусто. Открытие решения по клику.
```

**Промпт 7 — дерево развилок.**
```text
POST app/api/decisions/[id]/tree: промпт 9.2, валидация TreeResponseSchema, сохранить в
Decision.tree. Если tree пустой — кнопка «Сгенерировать дерево развилок»; если есть — сразу
показать. Компонент DecisionTree — вложенный сворачиваемый вывод, глубина до 3 уровней.
Состояния: tree_idle/tree_generating/tree_ready/tree_error.
```

**Промпт 8 — ревью по исходу.**
```text
POST app/api/decisions/[id]/resolve: принять {outcome}, промпт 9.3, валидация
ReviewResponseSchema, сохранить outcome, reviewClosestScenario, reviewMissed, lesson,
проставить status=RESOLVED, resolvedAt. Страница decisions/[id]/review: ввод факта ->
какой сценарий ближе + что упущено + 1 урок.
```

**Промпт 9 — полировка и деплой.**
```text
Единые состояния LoadingState/EmptyState/ErrorMessage по всем экранам. Обработка ошибок LLM
и БД без падения приложения. Финальный деплой на Vercel, проверка на демо-кейсе из §16.
```

---

## 19. Версионирование

Версия приложения хранится в **одном** файле `lib/version.ts` и используется везде через импорт. Номер версии нигде больше не хардкодится.

lib/version.ts
```ts
// единый источник версии приложения — менять только здесь
export const __version__ = {
  version: "0.1.0",
  date: "2026-06-24",
  time: "00:00",
} as const;

// готовая строка для футера/логов: "0.1.0 (2026-06-24 00:00)"
export const versionLabel = `${__version__.version} (${__version__.date} ${__version__.time})`;
```

Правила:
- Версию менять **только** в `lib/version.ts`. В других файлах номер не хардкодить.
- Использовать `__version__` / `versionLabel` в: футере UI, серверных логах (при старте), сборке. Опционально — служебный `GET /api/version`.
- Для веб-приложения на Vercel «установщика» нет — пункт общего правила про имя установщика применяется к десктоп-проектам; здесь версия живёт в UI, логах и сборке.
- При «сводке» (см. §20) текущая версия фиксируется в dev-log и CHANGELOG.

---

## 20. Рабочие документы проекта (ведёт Cursor)

Cursor поддерживает набор документов в `docs/` в актуальном состоянии:

| Файл | Назначение |
|------|------------|
| `docs/PLAN.md` | Пошаговый план разработки с промежуточными точками проверки и тестами. Готовит Cursor на старте (отдельный запрос), дальше отмечает прогресс. |
| `docs/STATUS.md` | Текущее состояние: что готово, что в работе, что заблокировано, текущая версия. |
| `docs/CHANGELOG.md` | История изменений (стиль Keep a Changelog: Added / Changed / Fixed по версиям). |
| `docs/PROMPTS.md` | Рабочие промпты проекта (актуальные системные промпты 9.1–9.3 и стартовые из §18). |
| `docs/DECISIONS.md` | Принятые архитектурные решения и причины (почему JWT-в-cookie, почему UPPERCASE enum, почему OpenAI-совместимый клиент и т.д.). |
| `docs/TEMPLATE-dev-log.md` | Шаблон dev-log; по «сводке» заполняется и сохраняется датированной копией. |

**Команда «сводка».** В конце сессии достаточно написать `сводка` (или `завершение`). Cursor:
1. заполняет `docs/TEMPLATE-dev-log.md` по факту сделанного;
2. сохраняет копию `docs/YY.MM.DD-CRS-Краткое_название-vX.X.md` (код инструмента **CRS** = Cursor);
3. обновляет `docs/CHANGELOG.md` и `docs/STATUS.md`;
4. фиксирует текущую версию из `lib/version.ts`.

Коды инструмента в имени dev-log: CRS — Cursor, GPT — ChatGPT/GPT Code, CCT — Claude Code (terminal), CCW — Claude (web), CCA — Claude Code (app).

---

## 21. Организационные заметки (вне кода)

- Регистрацию Neon, Vercel, OpenAI выполнять **не из РФ**.
- Прод на Vercel: LLM-запросы уходят с серверов вне РФ — прямой OpenAI работает.
- Локальная разработка из РФ: VPN либо `OPENAI_BASE_URL` на OpenAI-совместимый агрегатор.
