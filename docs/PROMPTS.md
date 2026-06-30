# PROMPTS.md — рабочие промпты проекта «Развилка»

Промпты для Cursor (этапы разработки) и системные промпты LLM (генерация контента).

---

## A. Промпты для Cursor (этапы разработки)

### Промпт 0 — каркас + smoke-тест

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

### Промпт 1 — доменная схема

```text
Замени Note на доменную схему из PROJECT.md §6: enum Horizon/DecisionType/DecisionStatus/
ScenarioKind/Likelihood; User; Decision (tree Json?, outcome, lesson, reviewClosestScenario, reviewMissed, updatedAt, relations);
Scenario; FailureMode. Внешние ключи через relations, индексы @@index. Сделай миграцию.
```

### Промпт 1а — DATABASE.md + миграция + verify (полный цикл)

```text
Ты — ведущий fullstack-разработчик проекта «Развилка» (Next.js + Prisma 6 + Neon).

Контекст:
- В корне есть DATABASE.md — заготовка другого проекта (User, Prompt, Vote). Не ломай историю: перенеси в docs/DATABASE.sample.md.
- Создай docs/DATABASE.md под текущий проект по PROJECT.md §6 (User, Decision, Scenario, FailureMode).
- Корневой DATABASE.md — короткая ссылка на docs/.

Задачи:
1. prisma/schema.prisma — доменная схема, удалить Note. Связи 1—N, onDelete: Cascade, @@index.
2. npx prisma migrate dev --name domain_init (или migrate deploy на Neon).
3. prisma/seed.ts — демо-кейс §16 (пользователь + решение + 3 сценария + failure modes). db:seed через prisma db seed.
4. prisma/verify-domain.ts — короткий smoke: создать User, Decision, Scenario, FailureMode; проверить связи.
   Маппинг с sample: Prompt → Decision, Vote в MVP нет.
5. npm run db:verify — tsx --env-file=.env.
6. app/page.tsx — читать Decision из БД (вместо Note).
7. Обновить docs/PROMPTS.md (этот промпт), docs/STATUS.md, docs/PLAN.md.

Проверка:
- npm run db:seed && npm run db:verify
- npm run build
- главная показывает решения из Neon

Не коммитить .env. Комментарии в коде — на русском.
```

### Промпт 2 — auth (JWT + bcrypt)

```text
Сделай регистрацию и вход: app/api/auth/{register,login,logout} и GET /api/auth/me (Route
Handlers). bcrypt для пароля, JWT в httpOnly cookie (JWT_SECRET из env). lib/auth.ts:
createSessionCookie / getCurrentUser / requireUser / clearSessionCookie. Вход валидируй
через Zod. Экраны login/register с состояниями.
```

### Промпт 3 — LLM-слой

```text
lib/llm.ts: OpenAI-совместимый клиент (npm openai), baseURL и модель из env, вызовы только
на сервере. lib/json.ts: срезать markdown и безопасно распарсить JSON. lib/validators.ts:
Zod-схемы ScenarioResponseSchema, TreeResponseSchema, ReviewResponseSchema (PROJECT.md §10).
```

### Промпт 4 — ядро: сценарии + pre-mortem

```text
POST app/api/decisions: принять {title, context, horizon, type} (Zod), вызвать промпт 9.1,
распарсить и провалидировать через ScenarioResponseSchema, сохранить Decision + Scenario[] +
FailureMode[]. При невалидном JSON — не сохранять, вернуть ошибку, залогировать сырой ответ.
GET app/api/decisions — список.
```

### Промпт 5 — экран результата

```text
Страница decisions/[id]: секции «Сценарии будущего» (3 карточки ScenarioCard), «Pre-mortem»
(FailureModeList: cause + prevention). Состояния страницы loading/ready/error. Кнопки «В журнал»,
«Отметить исход».
```

### Промпт 6 — журнал

```text
Главная app/page.tsx — Server Component, читает решения текущего пользователя из БД напрямую
(список: название, горизонт, статус). EmptyState, если пусто. Открытие решения по клику.
```

### Промпт 7 — дерево развилок

```text
POST app/api/decisions/[id]/tree: промпт 9.2, валидация TreeResponseSchema, сохранить в
Decision.tree. Если tree пустой — кнопка «Сгенерировать дерево развилок»; если есть — сразу
показать. Компонент DecisionTree — вложенный сворачиваемый вывод, глубина до 3 уровней.
Состояния: tree_idle/tree_generating/tree_ready/tree_error.
```

### Промпт 8 — ревью по исходу

```text
POST app/api/decisions/[id]/resolve: принять {outcome}, промпт 9.3, валидация
ReviewResponseSchema, сохранить outcome, reviewClosestScenario, reviewMissed, lesson,
проставить status=RESOLVED, resolvedAt. Страница decisions/[id]/review: ввод факта ->
какой сценарий ближе + что упущено + 1 урок.
```

### Промпт 9 — полировка и деплой

```text
Единые состояния LoadingState/EmptyState/ErrorMessage по всем экранам. Обработка ошибок LLM
и БД без падения приложения. Финальный деплой на Vercel, проверка на демо-кейсе из PROJECT.md §16.
```

---

## B. Системные промпты LLM (генерация)

Вызовы только из Route Handlers. Ответ → `lib/json.ts` → Zod. Переменные: `{{TITLE}}`, `{{CONTEXT}}`, `{{HORIZON}}`, `{{TYPE}}`, `{{SCENARIOS}}`, `{{OUTCOME}}`.

### 9.1. Сценарии + pre-mortem (system)

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

## C. Ограничения генерации ИИ

**Не должен:** совет «делай/не делай», точный прогноз, проценты, выдуманные факты, юр./мед./инвест. советы как окончательные.

**Должен:** варианты, риски, указание на нехватку данных, вероятность только LOW/MEDIUM/HIGH.

См. PROJECT.md §11.
