# Промпт — социальные механики (лайки к публичным разборам)

Скопируй блок ниже в чат Cursor.

---

```text
Ты — ведущий fullstack-разработчик проекта «Развилка» (Next.js App Router + TypeScript + Prisma 6 + Neon/PostgreSQL + Tailwind + Auth.js v5 + Google OAuth).

Контекст:
- Основная сущность контента — Decision (решение/привычка), не Prompt.
- Auth: lib/auth.ts — getCurrentUser(), requireUser(); сессия в httpOnly cookie (database strategy).
- Мутации — только Route Handlers (app/api/.../route.ts), runtime = nodejs.
- Чтение — Server Components напрямую из Prisma.
- Валидация входа — Zod. Комментарии в коде — на русском.
- UI-иконки — lucide-react (как в components/cabinet/*).
- Vote (голосование за калибровку) — вне scope; Like — отдельная сущность.
- Этап выполнять ПОСЛЕ MVP (этапы 3–9): когда есть экран результата и CRUD Decision.

ЦЕЛЬ
- Владелец решения может сделать разбор публичным (isPublic).
- Авторизованный пользователь может поставить лайк публичному разбору.
- Ограничение: 1 пользователь = 1 лайк на решение (повторное нажатие снимает лайк — toggle).
- На карточке/в списке показываем: количество лайков и состояние кнопки (лайкнут/не лайкнут).
- Публичная лента «Сообщество»: сортировка по популярности (лайки) и по дате (createdAt).

ТРЕБОВАНИЯ
- Лайкать могут только авторизованные пользователи (requireUser).
- Лайкать можно только Decision с isPublic = true.
- На стадии разработки владелец МОЖЕТ лайкать свой разбор (без 403 и без disabled в UI).
- Публикацию/снятие с публикации меняет только владелец.
- Защита от накрутки на уровне БД: @@unique([userId, decisionId]) на DecisionLike.
- Эндпоинт like — идемпотентный toggle: повторный запрос меняет состояние.
- Приватные поля: в публичной ленте не показывать outcome, lesson, reviewMissed и прочие данные ревью; минимум — title, horizon, type, status, createdAt, автор (name/image), likesCount. Контекст — обрезка (line-clamp).
- UI: кнопка Like (ThumbsUp из lucide-react), счётчик рядом. Во время запроса — disabled; откат при ошибке обязателен.
- Ошибки: не авторизован — 401 / редирект на /login; решение приватное или не найдено — 404; чужая мутация visibility — 403; БД недоступна — «Попробуйте позже».

ПЛАН РАБОТЫ (СНАЧАЛА КРАТКО ОБЪЯСНИ ПЛАН, ПОТОМ СДЕЛАЙ)

1) Схема БД (prisma/schema.prisma):
   - Decision: isPublic Boolean @default(false)
   - Модель DecisionLike: id (uuid), userId, decisionId, createdAt
     @@unique([userId, decisionId]), @@index([decisionId]), @@index([userId])
   - Миграция: npx prisma migrate dev --name decision_public_likes

2) PATCH /api/decisions/[id]/visibility — только владелец, Zod { isPublic: boolean }

3) POST /api/decisions/[id]/like — requireUser, isPublic = true, toggle Like

4) app/explore — публичная лента, ?sort=popular|recent, likedByMe для текущего user

5) UI: LikeButton, PublicDecisionCard, VisibilityToggle, ссылка «Сообщество» в Header

6) docs/DATABASE.md, PROMPTS.md, CHANGELOG.md, STATUS.md

7) npm run build

Не ломать CRUD Decision, кабинет и auth. Не коммитить .env.
```

---

## Маппинг с ProStore (исходный промпт)

| ProStore | «Развилка» |
|----------|------------|
| Prompt | Decision |
| isPublic на Prompt | isPublic на Decision |
| Like / PromptLike | DecisionLike |
| POST /api/prompts/[id]/like | POST /api/decisions/[id]/like |
| Публичные промты | app/explore — публичные разборы |
| NextAuth | Auth.js v5 + lib/auth.ts |
| id cuid | id uuid |
