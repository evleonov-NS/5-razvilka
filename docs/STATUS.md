# STATUS.md — текущее состояние проекта «Развилка»

**Обновлено:** 2026-07-26  
**Версия приложения:** 0.1.3 (`lib/version.ts`)  
**Последний коммит:** `4fc2d3f` — ops после 2а+ (см. git log)  
**Текущий этап:** этап 9 ✅ закрыт; следующий пакет — прогон проверок + security-аудит (см. корневой `PROMPT.md`)  
**Dev-log:** [26.07.26-CRS-Этап_4_сценарии_pre-mortem-v0.1.0.md](./26.07.26-CRS-Этап_4_сценарии_pre-mortem-v0.1.0.md)

---

## Сводка

| Вопрос | Ответ |
|--------|--------|
| Что умеет продукт сейчас | Полный цикл MVP + 2а+ (демо, stats, ОС, $/₽, toggle, owner hash) |
| Чего ещё нет | Автотесты (Jest/Vitest/e2e); формальный security-проход с фиксами |
| Где смотреть | Локально + prod: https://5-razvilka.vercel.app |
| Риск для prod | Низкий операционный; дальше — abuse ОС / IDOR / утечки — в новом чате |

| Область | Статус | Комментарий |
|---------|--------|-------------|
| Доменная схема Prisma | ✅ Готово | + `LlmUsage`, аналитика, ОС, `AppSettings` |
| Auth (Google OAuth) | ✅ Готово | Auth.js v5 |
| LLM / провайдеры | ✅ Слой + настройки | DeepSeek по умолчанию; BYOK; квоты |
| Создание решения | ✅ Этап 4 | промпт 9.1 → Scenario + FailureMode |
| Экран результата | ✅ Этап 5 | Loading/Error, CTA на ревью |
| Дерево развилок | ✅ Этап 7 | `POST …/tree`, `DecisionTree`, `TreeSection` |
| Ревью по исходу | ✅ Этап 8 | `POST …/resolve`, `ReviewSection`, OPEN → RESOLVED |
| Полировка UI | ✅ Этап 9 | единые состояния, LikelihoodBadge, vercel-build |
| Личный кабинет | ✅ Готово | настройки API + демо в `/cabinet/settings` |
| Пакет 2а+ | ✅ Код + Neon + prod | демо, stats, feedback, $/₽, toggle, owner hash |
| Деплой Vercel | ✅ | `vercel.json` + LLM/hash/rate env + Redeploy |

---

## Этапы (прогресс)

| Этап | Название | Статус |
|------|----------|--------|
| 0 | Каркас + smoke-тест деплоя | ✅ Завершён |
| 1 | Доменная схема | ✅ Завершён |
| 2 | Авторизация (Google) | ✅ Завершён |
| 3 | LLM-слой и валидация | ✅ Завершён |
| 4 | Создание решения (ядро) | ✅ Завершён |
| 5 | Экран результата | ✅ Завершён |
| 6 | Журнал (главная) | ✅ Готово | кабинет; `/` — лендинг гостя |
| 7 | Дерево развилок | ✅ Завершён |
| 8 | Ревью по исходу | ✅ Завершён | OPEN → RESOLVED |
| 9 | Полировка и деплой | ✅ Завершён | UI + Vercel + ручная проверка 2а+ |
| 2а | Настройки: демо-данные | ✅ | + аналитика, ОС, стоимость $/₽, toggle, OWNER_EMAIL_HASH |
| 10 | Социальные механики | ✅ Завершён |
| — | Прогон + security | ⬜ | новый чат: `PROMPT.md` |

---

## Готово (ops после 2а+, 2026-07-26)

- [x] `npx prisma migrate deploy` — pending нет (`analytics_feedback_settings` на Neon)
- [x] Локальный `.env`: `OWNER_EMAIL_HASH`, `USD_RUB_RATE=90`
- [x] `vercel.json` → `buildCommand: npm run vercel-build` (ADR-026)
- [x] `.env.example` уже содержит hash/rate
- [x] Vercel Environment Variables: `OWNER_EMAIL_HASH`, `USD_RUB_RATE` (+ Redeploy)
- [x] Ручная проверка демо / stats / стоимость / toggle
- [x] Антиспам `/feedback` — `react-honeypot-field` (ADR-030)
- [x] Выравнивание карточек на `/cabinet/settings`; сдвиг кабинета к сайдбару

## Готово (Этап 9 — полировка и деплой, 2026-07-26)

- [x] Общий `LikelihoodBadge` на лендинге и `/demo` (без локальных копий)
- [x] `NewDecisionForm` — ошибки через `ErrorMessage`
- [x] `cabinet/loading.tsx` → `LoadingState`; `cabinet/error.tsx`
- [x] `loading.tsx` / `error.tsx` для `/decisions/new`
- [x] Review empty → `EmptyState`; generating — скелетон как у дерева
- [x] `POST /api/decisions` — безопасный parse JSON тела (400)
- [x] `npm run vercel-build` (ADR-026); версия `0.1.3`
- [x] Vercel Environment Variables: `DEEPSEEK_API_KEY`, `OWNER_EMAIL` / hash, `USD_RUB_RATE`, …
- [x] Build Command → `npm run vercel-build` (`vercel.json`)
- [x] Redeploy; prod LLM работает; 2а+ проверен вручную

## Готово (Этап 8 — ревью по исходу, 2026-07-26)

- [x] `POST /api/decisions/[id]/resolve`: `{ outcome }` → промпт 9.3 → `ReviewResponseSchema`
- [x] Сохранение `outcome`, `reviewClosestScenario`, `reviewMissed`, `lesson`; `status=RESOLVED`, `resolvedAt`
- [x] `buildReviewSystemPrompt` в `lib/prompts.ts`
- [x] `/decisions/[id]/review` — форма факта → ближайший сценарий + упущение + 1 урок (`ReviewSection`)
- [x] Follow-up без повторного списания кредита (`skipFreeCreditCheck`)
- [x] Идемпотентность: если уже RESOLVED с полным ревью — отдать без LLM
- [x] На `/decisions/[id]`: CTA «Что получилось?» / «Итог и урок» при RESOLVED

## Готово (Этап 7 — дерево развилок, 2026-07-26)

- [x] `POST /api/decisions/[id]/tree`: промпт 9.2 → `parseJsonSafe` → `TreeResponseSchema` → `Decision.tree`
- [x] `buildTreeSystemPrompt` в `lib/prompts.ts`
- [x] `DecisionTree` — вложенный сворачиваемый вид, глубина до 3
- [x] `TreeSection` — состояния `tree_idle` / `tree_generating` / `tree_ready` / `tree_error`
- [x] Follow-up LLM без повторного списания бесплатного кредита (`skipFreeCreditCheck`)
- [x] Идемпотентность: если дерево уже есть — отдать без повторного вызова LLM

## Готово (Этап 5 — экран результата, 2026-07-26)

- [x] `LoadingState`, `ErrorMessage`
- [x] `app/decisions/[id]/loading.tsx`, `error.tsx`
- [x] Кнопка «Что получилось?» → `/decisions/[id]/review`
- [x] Пустое состояние разбора через `EmptyState`

## Готово (Этап 4 — ядро создания решения, 2026-07-26)

- [x] `POST /api/decisions`: `resolveLlmCredentials` → промпт 9.1 → `parseJsonSafe` → `ScenarioResponseSchema`
- [x] Транзакция `Decision` + `Scenario[3]` + `FailureMode[3–5]` только после валидного LLM
- [x] Невалидный JSON/схема — без записи в БД, лог сырого ответа, 502/422
- [x] `recordLlmUsage`; `consumePlatformCredit` только при платформенном ключе (не owner)
- [x] `/decisions/[id]`: `ScenarioCard`, `FailureModeList` из БД
- [x] `lib/prompts.ts` (промпт 9.1); ADR-023

## Готово (LLM: провайдеры + квоты + стоимость, 2026-07-23)

- [x] Платформа по умолчанию — DeepSeek (`DEEPSEEK_API_KEY`)
- [x] `/cabinet/settings` — провайдер / модель / свой ключ; блок стоимости запросов
- [x] Квоты: owner безлимит; остальные — 1 бесплатный разбор
- [x] `LlmUsage` + оценка USD; ключ AES-GCM (`AUTH_SECRET`)
- [x] Миграция `user_llm_settings`
- [x] ADR-022

Env: `DEEPSEEK_API_KEY`, `QWEN_API_KEY`, `OPENAI_API_KEY`, `LLM_DEFAULT_PROVIDER`, `LLM_MODEL`, `OWNER_EMAIL` / `OWNER_EMAIL_HASH`, `USD_RUB_RATE` — см. `.env.example`.

## Готово (Этап 3 — LLM-слой, 2026-07-23)

- [x] `lib/json.ts` — срез markdown-fence, `parseJsonSafe`
- [x] `lib/llm/*` — клиент, провайдеры, квоты, usage
- [x] `lib/validators.ts` — `CreateDecisionInputSchema`, `ScenarioResponseSchema`, заготовки Tree/Review
- [x] `scripts/verify-llm-layer.ts` + `npm run llm:verify`

---

## Готово (кабинет UI, 2026-07-20)

- [x] Сайдбар на токенах + ThemeToggle + мобильный drawer; сайдбар на `/decisions/*` и `/demo` (ADR-019)
- [x] Пустой журнал: пресеты, призрачное превью (ADR-017); ссылка на `/demo` (ADR-020)
- [x] Разные пустые состояния Открытые / Решённые; единая шапка с «Новое решение»
- [x] Форма `/decisions/new` + шаги ожидания; `POST /api/decisions`
- [x] Навигация MVP без «Сообщество» (ADR-018); настройки — профиль/тема/выход
- [x] Сетка превью без горизонтального скролла; контент `max-w-4xl` по центру
- [x] Sticky-сайдбар без overflow у предков (ADR-021); демо-разбор: дерево/pre-mortem/ревью

## Готово (социальные механики)

- [x] `Decision.isPublic`, модель `DecisionLike`, миграция `decision_public_likes`
- [x] `POST /api/decisions/[id]/like`, `PATCH /api/decisions/[id]/visibility`
- [x] `/explore` — лента, sort=popular|recent; `/explore/[id]` — публичный просмотр
- [x] `LikeButton`, `VisibilityToggle`, `PublicDecisionCard`
- [x] Промпт: [PROMPT-socium.md](./PROMPT-socium.md)

## Готово (личный кабинет)

- [x] `/cabinet` — сайдбар, журнал, фильтры OPEN/RESOLVED, поиск, пагинация
- [x] `/` — продуктовый лендинг для гостей (`components/landing/*`), редирект авторизованных → `/cabinet`; `/register` для CTA
- [x] `DELETE /api/decisions/[id]` — проверка владельца
- [x] `lucide-react`, компоненты `components/cabinet/*`

## Готово (Этап 2)

- [x] `next-auth` beta + `@auth/prisma-adapter`
- [x] Миграция `auth_google`, Account/Session, VerificationToken
- [x] `auth.ts`, `/api/auth/[...nextauth]`, `/login`, Header
- [x] `lib/auth.ts` — getCurrentUser, requireUser
- [x] Google OAuth: local + production
- [x] Dev-log: `docs/05.07.26-CRS-Этап_2_Google_OAuth-v0.1.0.md`

---

## Следующий шаг

Прогон проверок + security-аудит — новый чат, корневой [PROMPT.md](../PROMPT.md).

---

## Документация

| Документ | Назначение |
|----------|------------|
| [AUTH_GOOGLE_VERCEL.md](./AUTH_GOOGLE_VERCEL.md) | OAuth: Google, .env, Vercel |
| [PLAN.md](./PLAN.md) | План MVP (+ чеклист ключей LLM на этапе 9) |
| [PROMPTS.md](./PROMPTS.md) | Промпты Cursor |
| [PROMPT.md](../PROMPT.md) | Выжимка для следующего чата |
| [26.07.26-CRS-Этап_4…](./26.07.26-CRS-Этап_4_сценарии_pre-mortem-v0.1.0.md) | Dev-log этапа 4 |
