# PLAN.md — пошаговый план разработки «Развилка»



**Версия плана:** 1.1  

**Дата:** 2026-07-17  

**Основа:** [PROJECT.md](../PROJECT.md), [README.md](../README.md)



---



## Текущее состояние



| Область | Статус |

|---------|--------|

| Этапы 0–2 (каркас, схема, auth) | ✅ Завершены |

| Личный кабинет | ✅ Журнал, фильтры, поиск, удаление |

| Социальные механики | ✅ `/explore`, лайки, `isPublic` (этап 10) |

| Демо-данные (CLI) | ✅ `npm run db:seed-demo` |

| LLM / ядро продукта | ✅ Этапы 4–5, 7–8; далее полировка (9) |

| Production Neon | ✅ миграции на Neon; Build Command в `vercel.json` (`npm run vercel-build`) |



**Следующий шаг:** security v0.1.4 внедрён; при необходимости — локальный `build` (после паузы `dev`) и **kip**.



**Оценка до MVP (осталось):** MVP закрыт; post-MVP security — частично закрыт (ADR-031).



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



- [x] 1. Войти через Google

- [x] 2. Выйти из аккаунта

- [x] 3. Создать новое решение

- [x] 4. Получить 3 сценария будущего

- [x] 5. Получить pre-mortem

- [x] 6. Найти решение в журнале (автосохранение после генерации)

- [x] 7. Открыть решение из журнала

- [x] 8. Сгенерировать дерево развилок

- [x] 9. Отметить фактический исход

- [x] 10. Получить ревью (ближайший сценарий + урок)

- [x] 11. `npm run build` проходит локально и на Vercel



### Вне scope MVP

Калибровка во времени, редактор дерева, числовые вероятности/деньги, голос (калибровка), оплата.



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

| Деплой | Vercel; локально `npm run build`; prod Build Command — `npm run vercel-build` (ADR-026) |



---



## 3. Сводка этапов и оценка времени



Оценки — для **одного разработчика с Cursor**, при уже настроенных Neon/Vercel/Google OAuth.



| Этап | Название | Статус | Оценка |

|------|----------|--------|--------|

| 0 | Каркас + smoke-тест | ✅ | ~~1 д~~ |

| 1 | Доменная схема | ✅ | ~~0.5–1 д~~ |

| 2 | Auth (Google) | ✅ | ~~1–2 д~~ |

| — | Личный кабинет | ✅ | ~~1–2 д~~ |

| 10 | Социальные механики | ✅ | ~~1 д~~ |

| **2а** | **Настройки: демо-данные** | ✅ | **0.5–1 д** |

| **3** | **LLM-слой** | ✅ | ~~0.5–1 д~~ |

| **4** | **Создание решения** | ✅ | ~~1.5–2 д~~ |

| 5 | Экран результата | ✅ | — |

| 6 | Журнал | ✅ | — |

| 7 | Дерево развилок | ✅ | ~~1–1.5 д~~ |

| 8 | Ревью по исходу | ✅ | ~~1 д~~ |

| 9 | Полировка и деплой | ✅ | ~~1–2 д~~ |
| | **Итого осталось** | | хвост: локальный build при EPERM; kip |



---



## 4. Этапы разработки (детально)



### Этап 0 — Каркас + smoke-тест ✅

**Промпт 0** · **Оценка:** 1 д



- [x] Next.js + Prisma + Neon + Vercel smoke-тест



---



### Этап 1 — Доменная схема ✅

**Промпт 1** · **Оценка:** 0.5–1 д



- [x] User, Decision, Scenario, FailureMode, миграция `domain_init`



---



### Этап 2 — Авторизация ✅

**Промпт 2** · **Оценка:** 1–2 д



- [x] Auth.js v5 + Google OAuth, `getCurrentUser` / `requireUser`

- [x] `/login`, middleware, миграция `auth_google`



---



### Личный кабинет ✅

**Оценка:** 1–2 д



- [x] `/cabinet`, сайдбар, журнал, open/resolved, поиск, пагинация

- [x] `DELETE /api/decisions/[id]`, лендинг `/`

- [x] Заглушки `/decisions/new`, `/decisions/[id]`



---



### Этап 10 — Социальные механики ✅

**[PROMPT-socium.md](./PROMPT-socium.md)** · **Оценка:** 1 д



- [x] `isPublic`, `DecisionLike`, `/explore`, like/visibility API

- [x] Layout кабинета для ленты, `npm run db:seed-demo` (CLI)



---



### Этап 2а — Настройки: демо-данные ✅

**Приоритет:** до или сразу после этапа 3 · **Оценка:** 0.5–1 д

Демо + пакет аналитики/ОС/owner (см. ADR-027…029, корневой `PROMPT.md`).

#### Задачи

- [x] `/cabinet/settings` — секция **«Демо-данные»**
- [x] **«Загрузить демо-данные»** → `POST /api/user/demo-data` (`lib/demo-data.ts`)
- [x] **«Удалить демо-данные»** → `DELETE /api/user/demo-data` + confirm
- [x] Состояния idle / loading / success / error; счётчик
- [x] `npm run db:seed-demo` оставлен
- [x] Аналитика + `/cabinet/stats`, ОС `/feedback`, стоимость $/₽, toggle платф. ключа, `OWNER_EMAIL_HASH`

#### Проверка

- [ ] Загрузка → 6 решений в кабинете, 4 на `/explore` (ручная проверка)
- [ ] Удаление → демо исчезают, свои решения не трогаются
- [ ] Повторная загрузка идемпотентна (replace по префиксу)
- [x] Миграция `analytics_feedback_settings` на Neon (`migrate deploy` — no pending)



---



### Этап 3 — LLM-слой и валидация ✅

**Промпт 3** · **Оценка:** 0.5–1 д



#### Задачи

- [x] `lib/json.ts` — срез markdown, безопасный parse

- [x] `lib/llm.ts` — OpenAI client, env config

- [x] `lib/validators.ts` — Scenario/Tree/Review + input schemas

- [x] `scripts/verify-llm-layer.ts` + `npm run llm:verify`



#### Проверка

- [x] Парсинг валидного/невалидного JSON

- [x] LLM-ключ не утекает на клиент



---



### Этап 4 — Ядро: создание решения ✅

**Промпт 4** · **Оценка:** 1.5–2 д



#### API

- [x] `POST /api/decisions` — промпт 9.1, транзакция Prisma

- [ ] `GET /api/decisions`, `GET /api/decisions/[id]` — ownership (чтение — Server Components)

- [x] `DELETE /api/decisions/[id]`



#### UI

- [x] Форма `/decisions/new` (`NewDecisionForm`) + `/decisions/[id]` (ScenarioCard / FailureModeList)



#### Проверка

- [ ] Демо-кейс §16 → 3 сценария + failure modes в БД (ручной прогон с ключом)

- [x] Невалидный LLM → ошибка, записей нет



---



### Этап 5 — Экран результата ✅

**Промпт 5** · **Оценка:** 1–1.5 д



#### Задачи

- [x] `ScenarioCard`, `FailureModeList` (базово на этапе 4)

- [x] `LoadingState`, `ErrorMessage` + `loading.tsx` / `error.tsx`

- [x] `/decisions/[id]` — сценарии + pre-mortem + visibility/like

- [x] Кнопка «В журнал»

- [x] Кнопка «Что получилось?» → заглушка `/decisions/[id]/review` (форма — этап 8)

- [x] Placeholder дерева (этап 7)



---



### Этап 6 — Журнал ✅

**Промпт 6** · **Оценка:** 0.5 д (доработка после 4)



- [x] Лендинг, кабинет, EmptyState

- [x] Новое решение появляется после этапа 4



---



### Этап 7 — Дерево развилок

**Промпт 7** · **Оценка:** 1–1.5 д · ✅ Завершён



- [x] `POST /api/decisions/[id]/tree`, `DecisionTree.tsx`

- [x] Состояния tree_idle / generating / ready / error



---



### Этап 8 — Ревью по исходу

**Промпт 8** · **Оценка:** 1 д



- [x] `POST /api/decisions/[id]/resolve`, `/decisions/[id]/review`

- [x] RESOLVED + closest scenario + lesson



---



### Этап 9 — Полировка и финальный деплой

**Промпт 9** · **Оценка:** 1–2 д



- [x] Единые состояния UI (`LoadingState` / `EmptyState` / `ErrorMessage`), общий `LikelihoodBadge`

- [x] Ошибки LLM/БД без падения UI (create / tree / resolve + error.tsx)

- [x] `npm run vercel-build` = migrate deploy + generate + next build (ADR-026); `vercel.json` → Build Command

- [x] STATUS, CHANGELOG; версия → `0.1.3`

- [x] **Vercel: платформенные LLM API-ключи** (локальный `.env` на prod не попадает)

- [x] Prod: `OWNER_EMAIL_HASH` + `USD_RUB_RATE` на Vercel + Redeploy

- [x] Ручная проверка 2а+ / демо-кейс на prod



#### Vercel — Environment Variables (обязательно на этапе 9)

1. Открыть: [vercel.com/dashboard](https://vercel.com/dashboard) → проект **5-razvilka** (или ваш) → **Settings** → **Environment Variables**  
   Прямой вход в список проектов: https://vercel.com/dashboard

2. Добавить переменные для **Production** (и **Preview**, если нужен LLM на превью). Значение — как в локальном `.env`, **одной строкой, без кавычек и без пробелов по краям**.

| Key | Что внести | Пример формы | Обязательно |
|-----|------------|--------------|-------------|
| `DEEPSEEK_API_KEY` | ключ с platform.deepseek.com | `sk-…` | **да** (провайдер по умолчанию) |
| `LLM_DEFAULT_PROVIDER` | имя провайдера UPPERCASE | `DEEPSEEK` | желательно |
| `LLM_MODEL` | id модели | `deepseek-chat` | желательно |
| `OWNER_EMAIL_HASH` | HMAC-SHA256 email (см. `scripts/hash-owner-email.ts`) | 64 hex | **да** (предпочтительно) |
| `OWNER_EMAIL` | fallback plaintext только в env | email | нет, если есть hash |
| `USD_RUB_RATE` | оценка курса для ₽ в settings | `90` | желательно |
| `QWEN_API_KEY` | ключ Qwen (если нужен) | строка ключа | нет |
| `OPENAI_API_KEY` | ключ OpenAI (если нужен) | `sk-…` | нет |

3. Убедиться, что уже есть Auth/DB (`AUTH_SECRET`, `AUTH_URL=https://5-razvilka.vercel.app`, Google, `DATABASE_URL`, `DIRECT_URL`) — см. [AUTH_GOOGLE_VERCEL.md](./AUTH_GOOGLE_VERCEL.md).

4. Build Command: корневой `vercel.json` задаёт `npm run vercel-build` (migrate deploy + generate + next build).

5. После сохранения переменных — **Redeploy** последнего деплоя (иначе runtime не подхватит ключи).

6. Проверка: на https://5-razvilka.vercel.app войти → `/decisions/new` → «Разобрать» → сценарии на экране результата.



---



## 5. Рекомендуемый порядок (что дальше)



```

✅ 0 → 1 → 2 → кабинет → 10 (социалка)

         ↓

    2а (демо в настройках) ── параллельно или сразу после 3

         ↓

    3 (LLM) → 4 (создание) → 5 (экран) ── критический путь

         ↓

    6 (журнал OK) → 7 (дерево) → 8 (ревью) → 9 (полировка)

```



**Ближайшие шаги:**

1. Новый чат: прогон `build` / verify + security-аудит (дыры → предложения → фиксы)

2. По желанию — минимальные автотесты критичных API



---



## 6. Зависимости этапов



```

0 → 1 → 2 → кабинет → 10

              ↓

         2а (demo UI)

              ↓

         3 (LLM) → 4 → 5 → 7 → 8 → 9

                    ↘ 6 (доработка)

```



**Критический путь до MVP:** 3 → 4 → 5 → 7 → 8 → 9.



---



## 7. Риски



| Риск | Митигация |

|------|-----------|

| LLM — невалидный JSON | json.ts + Zod + retry + лог raw |

| Долгая генерация | UI generating, timeout в llm.ts |

| Neon connection limits | pooled URL, синглтон Prisma |

| OpenAI из РФ | OPENAI_BASE_URL или VPN |

| Миграции на prod | `migrate deploy` в Build или вручную после push |

| Enum регистр | Zod preprocess toUpperCase |



---



## 8. Команда «сводка»



В конце сессии: `сводка` или `завершение` → dev-log, CHANGELOG, STATUS.



См. [TEMPLATE-dev-log.md](./TEMPLATE-dev-log.md).



---



*Прогресс отмечать в [STATUS.md](./STATUS.md) и чеклистах выше.*


