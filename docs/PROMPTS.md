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

### Промпт 2 — auth (Auth.js v5, только Google)

```text
Ты — ведущий fullstack-разработчик проекта «Развилка» (Next.js App Router + Prisma 6 + Neon).

Контекст:
- Этап 1 закрыт: User, Decision, Scenario, FailureMode в prisma/schema.prisma.
- Сейчас User имеет passwordHash — убрать: вход ТОЛЬКО через Google OAuth.
- Библиотека: Auth.js v5 (пакет next-auth), Prisma Adapter. Без email/пароля, без Credentials provider.

Задачи:

1. Зависимости:
   npm install next-auth @auth/prisma-adapter
   (zod уже есть — для валидации прочих API)

2. Prisma — схема под Auth.js + домен:
   - User: id (uuid), name?, email (unique), emailVerified?, image?, createdAt, decisions[]
   - Удалить passwordHash.
   - Добавить модели Account, Session, VerificationToken (стандарт Auth.js + PrismaAdapter).
   - Миграция auth_google (migrate dev локально / migrate deploy на Neon).
   - Обновить prisma/seed.ts: демо-пользователь без пароля (или пометка, что seed-user только для dev без OAuth).

3. Auth.js:
   - auth.ts в корне (или lib/auth.ts экспортирует handlers + auth + signIn + signOut).
   - GoogleProvider: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET из env.
   - AUTH_SECRET из env (длинная случайная строка; в dev можно npx auth secret).
   - AUTH_URL / trustHost для Vercel (AUTH_URL=https://your-app.vercel.app в production).
   - PrismaAdapter(prisma), session: { strategy: "database" } — сессия в БД, cookie httpOnly (не localStorage).
   - app/api/auth/[...nextauth]/route.ts — handlers GET/POST.

4. Обёртки для остального кода (lib/auth.ts или re-export из auth.ts):
   - getCurrentUser() — auth() → user из сессии + prisma.user при необходимости.
   - requireUser() — без сессии throw / NextResponse 401 для Route Handlers.
   - Типы: id, email, name, image — без passwordHash.

5. UI:
   - app/login/page.tsx — одна кнопка «Войти через Google» (signIn("google")).
   - Страница register НЕ нужна (регистрация = первый вход через Google).
   - components/Header.tsx — аватар/имя, кнопка «Выйти» (signOut).
   - Неавторизованным на защищённых страницах — redirect на /login.

6. Защита:
   - Middleware (middleware.ts) или проверка auth() в layout для /decisions/* (когда появятся).
   - Пока: заготовка middleware, главная остаётся публичной (журнал с фильтром по user — этап 6).

7. Env (.env.example):
   AUTH_SECRET=
   AUTH_URL=http://localhost:3015
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   Удалить JWT_SECRET из примеров (заменён на AUTH_SECRET).

4. Google Cloud OAuth credentials — см. [AUTH_SETUP.md](./AUTH_SETUP.md)
   - docs/AUTH_SETUP.md — ключи Google + AUTH_SECRET
   - docs/DECISIONS.md — ADR-003 пересмотрен (Auth.js + Google).
   - docs/PLAN.md, docs/STATUS.md — этап 2.
   - docs/DATABASE.md — модели Account/Session.

Проверка:
- npm run build
- Локально: /login → Google → callback → сессия в cookie → auth() возвращает user.
- Logout очищает сессию.
- Без сессии requireUser() → 401.

Не коммитить .env. Комментарии в коде — на русском. Runtime API — Node (не Edge).
```

### Промпт 2а — Google OAuth в Google Cloud (ручная настройка)

Полная пошаговая инструкция: **[AUTH_SETUP.md](./AUTH_SETUP.md)** (Client ID, Client Secret, AUTH_SECRET, AUTH_URL).

```text
Кратко: console.cloud.google.com → OAuth consent screen → Credentials →
OAuth client ID (Web) → redirect URI .../api/auth/callback/google →
ключи в .env и Vercel. AUTH_SECRET: npx auth secret.
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

### Промпт 10 — социальные механики (после MVP)

Полный текст: **[PROMPT-socium.md](./PROMPT-socium.md)** — лайки к публичным разборам, лента `/explore`, `isPublic` + `DecisionLike`.

```text
Кратко: isPublic на Decision, DecisionLike (toggle POST /api/decisions/[id]/like),
PATCH visibility (владелец), лента app/explore с sort=popular|recent.
На стадии разработки владелец может лайкать свой разбор.
```

### Промпт — лендинг (продуктовый экран для гостей)

```text
Ты — сильный продуктовый дизайнер и фронтенд-разработчик. Сделай лендинг сервиса «Развилка»
внутри текущего проекта. Ориентируйся на PROJECT.md: §1 (позиционирование), §11 (ограничения),
§16 (демо-кейс), §19 (версия).

МАРШРУТИЗАЦИЯ
- app/page.tsx: Server Component. Через getCurrentUser() из lib/auth.ts проверить сессию.
  Нет сессии -> отрендерить лендинг. Есть сессия -> отрендерить журнал решений (как сейчас).
- Разметку лендинга вынести в components/landing/ отдельными секциями, app/page.tsx только собирает.
- CTA «Разобрать решение» ведёт на /register. Вторичная ссылка «Войти» -> /login.

СТЕК И ОГРАНИЧЕНИЯ
- Next.js App Router + TypeScript + Tailwind. Никаких новых зависимостей, UI-китов, CSS-фреймворков.
- Server Components по умолчанию. 'use client' — только там, где реально нужен интерактив.
- FAQ сделать на нативном <details>/<summary>, без JS.
- Иконки и графика — только инлайн-SVG, написанный тобой. Не подключать иконочные библиотеки,
  не вставлять внешние картинки, не использовать эмодзи как иконки.
- Шрифты — через next/font (без CDN-запросов). Тексты — на русском.
- Мобильный-первый, аккуратно до 1280px. Семантическая разметка (header/main/section/footer),
  один h1 на странице, осмысленные h2.
- Доступность: контраст не ниже 4.5:1, видимый focus-visible на всех интерактивных элементах,
  aria-label на иконочных ссылках, prefers-reduced-motion уважать.
- В футере вывести версию через versionLabel из lib/version.ts. Номер версии не хардкодить.

АРТ-ДИРЕКШН (можно менять, но не в сторону шаблонности)
- Метафора продукта — развилка: тонкие ветвящиеся линии, узлы, расходящиеся пути. Использовать
  её как сквозной графический мотив (фон hero, разделители секций, иллюстрация «как работает»).
- Настроение: спокойный аналитический инструмент, а не хайповый AI-стартап.
- ЗАПРЕЩЕНО: фиолетово-синие градиенты, glassmorphism, неоновое свечение, «плавающие» 3D-шары,
  стоковые фразы вроде «революционный ИИ», счётчики выдуманной статистики, фейковые логотипы
  компаний, фейковые отзывы, фейковые цифры пользователей.
- Палитра: тёмный нейтральный фон (около-графитовый), светлый текст, один сдержанный акцентный
  цвет для CTA и меток. Акцент — тёплый янтарный или холодный сине-зелёный, выбери один и держи.
- Типографика: крупный контраст размеров между h1 и телом текста, узкая колонка текста (не шире
  ~65 символов), щедрые вертикальные отступы. Ритм важнее декора.
- Никакой анимации, кроме мягких hover/focus переходов.

СТРУКТУРА СЕКЦИЙ
1. Hero. H1: Развилка · подзаголовок · оффер · CTA · SVG-развилка.
2. Проблема — 3 тезиса.
3. Как это работает — 3 шага, соединить линией-веткой.
4. Что внутри разбора — 5 блоков.
5. Пример разбора — демо-кейс §16 «Сменить работу в течение года».
6. Честная рамка — чего сервис не делает.
7. Для кого.
8. FAQ, 5 вопросов на <details>/<summary>.
9. Финальный CTA.
10. Футер: название, versionLabel, Войти / Регистрация.

ТРЕБОВАНИЯ К ТЕКСТАМ
- Как аналитик, не маркетолог. Метки LOW/MEDIUM/HIGH. Без обещаний точности и окончательных советов.

ПОСЛЕ ГЕНЕРАЦИИ
- npm run build; обновить CHANGELOG, STATUS, DECISIONS (маршрут `/`), сохранить промпт в PROMPTS.md.
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
