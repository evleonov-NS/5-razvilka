# DECISIONS.md — принятые архитектурные решения

Зафиксированные решения для «Развилка» MVP. Не пересматривать без явной причины.

---

## ADR-001: Next.js App Router + TypeScript

**Решение:** Next.js с App Router и TypeScript.

**Причина:** единый fullstack-фреймворк, Server Components для чтения БД, Route Handlers для мутаций, нативный деплой на Vercel.

**Альтернативы отклонены:** отдельный SPA + API (лишняя сложность для MVP).

---

## ADR-002: Prisma 6 + Neon PostgreSQL

**Решение:** Prisma ORM, Neon как managed PostgreSQL.

**Причина:** типобезопасность, миграции, `url` (pooled) + `directUrl` (миграции) — стандарт для serverless.

**Примечание:** PrismaClient — синглтон в `lib/prisma.ts`.

---

## ADR-003: JWT + bcrypt в httpOnly cookie (без NextAuth)

**Решение:** собственная auth: bcrypt для паролей, JWT в httpOnly cookie.

**Причина:**
- сессия доступна и Route Handlers, и Server Components через cookie;
- не localStorage (уязвимость к XSS);
- MVP не требует OAuth/social login.

**API:** `createSessionCookie`, `getCurrentUser`, `requireUser`, `clearSessionCookie` в `lib/auth.ts`.

---

## ADR-004: Route Handlers для мутаций, Server Components для чтения

**Решение:** мутации — только `app/api/.../route.ts`; чтение — Server Components напрямую из Prisma.

**Причина:** явное разделение, без Server Actions (зафиксировано в ТЗ).

**Runtime:** Node.js (не Edge) — Prisma + pg несовместим с Edge.

---

## ADR-005: OpenAI-совместимый LLM-клиент

**Решение:** npm-пакет `openai` с настраиваемым `OPENAI_BASE_URL`.

**Причина:**
- prod на Vercel — прямой OpenAI;
- локально из РФ — агрегатор/прокси без смены кода;
- один интерфейс для разных провайдеров.

**Правило:** вызовы LLM только на сервере, ключ из `process.env`.

---

## ADR-006: Zod для ввода и ответов LLM

**Решение:** все входы API и все JSON-ответы LLM валидируются через Zod.

**Pipeline:** raw text → `lib/json.ts` (срез markdown) → `JSON.parse` → Zod schema.

**При невалидном ответе:** не сохранять в БД, вернуть 502/422, залогировать raw (без секретов).

---

## ADR-007: Enum в ВЕРХНЕМ регистре + Zod preprocess

**Решение:** промпты просят LOW/MEDIUM/HIGH, OPTIMISTIC/BASE/PESSIMISTIC; Zod нормализует регистр через `z.preprocess` + `toUpperCase()`.

**Причина:** совпадение с Prisma enum без отдельного маппера.

---

## ADR-008: Дерево развилок — отдельная генерация

**Решение:** `POST /api/decisions/[id]/tree`, не вместе со сценариями.

**Причина:** разделение LLM-вызовов (скорость, стоимость, UX: пользователь решает, нужно ли дерево).

**Хранение:** `Decision.tree Json?`.

---

## ADR-009: Вероятность — только метка LOW/MEDIUM/HIGH

**Решение:** никаких процентов и «точных» прогнозов в UI и промптах.

**Причина:** продуктовая честность (§11 PROJECT.md), избежание ложной точности.

---

## ADR-010: Единый источник версии — lib/version.ts

**Решение:** `__version__` и `versionLabel` только в `lib/version.ts`.

**Причина:** не дублировать номер версии по файлам; использовать в футере, логах, dev-log.

---

## ADR-011: Smoke-тест деплоя перед доменной разработкой

**Решение:** этап 0 с сущностью `Note` и деплоем на Vercel — обязателен до доменной схемы.

**Причина:** ранняя проверка Neon + Vercel + Prisma migrate; `Note` удаляется после миграции домена.

---

## ADR-012: Документация в docs/

**Решение:** PLAN, STATUS, CHANGELOG, PROMPTS, DECISIONS, TEMPLATE-dev-log — в `docs/`, поддерживать актуальными.

**Команда «сводка»:** dev-log + обновление CHANGELOG и STATUS.

---

*Новые ADR добавлять с номером, датой и кратким обоснованием.*
