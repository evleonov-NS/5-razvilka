# Развилка

AI-сервис для моделирования последствий решений.

Пользователь описывает решение или привычку, а сервис показывает:
- 3 сценария будущего (оптимистичный / базовый / пессимистичный);
- pre-mortem: почему всё может провалиться + что сделать сейчас;
- дерево развилок — ключевые точки выбора;
- журнал решений;
- ревью фактического исхода: какой сценарий сбылся и один урок.

Вероятность — только метка (LOW / MEDIUM / HIGH). Никаких процентов и фейковой точности.

## Стек

- Next.js (App Router, TypeScript)
- Prisma 6
- PostgreSQL (Neon)
- Tailwind CSS
- JWT + bcrypt (собственная авторизация)
- OpenAI-совместимый LLM API
- Деплой: Vercel

## Запуск

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Переменные окружения

Создайте `.env` на основе `.env.example`:

```text
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
OPENAI_API_KEY=
OPENAI_BASE_URL=
LLM_MODEL=
```

`DATABASE_URL` — pooled-строка Neon, `DIRECT_URL` — direct (для миграций).
`OPENAI_BASE_URL` — указать URL OpenAI-совместимого провайдера; для прямого OpenAI оставить пустым.

## Документация

Полное продуктово-техническое описание — в [PROJECT.md](./PROJECT.md).

Рабочие документы проекта — в `docs/`: `PLAN.md` (план), `STATUS.md` (состояние), `CHANGELOG.md` (изменения), `PROMPTS.md` (промпты), `DECISIONS.md` (решения).
