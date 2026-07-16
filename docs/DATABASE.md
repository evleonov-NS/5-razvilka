# DATABASE.md — схема БД «Развилка»

PostgreSQL (Neon) + Prisma 6. Источник истины: `prisma/schema.prisma`, PRODUCT — [PROJECT.md](../PROJECT.md) §6.

---

## Сущности

| Модель | Назначение |
|--------|------------|
| **User** | Пользователь (email + passwordHash) |
| **Decision** | Решение или привычка пользователя |
| **DecisionLike** | Лайк публичного разбора (toggle, UNIQUE userId + decisionId) |
| **Scenario** | Один из 3 сценариев будущего (OPTIMISTIC / BASE / PESSIMISTIC) |
| **FailureMode** | Pre-mortem: причина провала + профилактика |

> **Note** (Этап 0) удалена после миграции `domain_init`.

---

## Связи

```text
User 1 — N Decision 1 — N Scenario
                      1 — N FailureMode
User 1 — N DecisionLike N — 1 Decision (только isPublic)
```

- `Decision.tree` — JSON дерева развилок (генерируется отдельно, Этап 7)
- Поля ревью: `outcome`, `lesson`, `reviewClosestScenario`, `reviewMissed`, `resolvedAt`

---

## Enums

| Enum | Значения |
|------|----------|
| Horizon | THREE_MONTHS, ONE_YEAR, FIVE_YEARS |
| DecisionType | DECISION, HABIT |
| DecisionStatus | OPEN, RESOLVED |
| ScenarioKind | OPTIMISTIC, BASE, PESSIMISTIC |
| Likelihood | LOW, MEDIUM, HIGH |

---

## Таблицы

### User

| Поле | Тип | Примечание |
|------|-----|------------|
| id | UUID | PK |
| email | String | UNIQUE |
| passwordHash | String | bcrypt |
| createdAt | DateTime | |

### Decision

| Поле | Тип | Примечание |
|------|-----|------------|
| id | UUID | PK |
| userId | UUID | FK → User, CASCADE |
| title | String | |
| context | String | |
| horizon | Horizon | default ONE_YEAR |
| type | DecisionType | default DECISION |
| status | DecisionStatus | default OPEN |
| isPublic | Boolean | default false; публичная лента /explore |
| tree | Json? | дерево развилок |
| outcome | String? | факт из ревью |
| lesson | String? | урок из ревью |
| reviewClosestScenario | ScenarioKind? | |
| reviewMissed | String? | |
| createdAt, updatedAt, resolvedAt | DateTime | |

**Индексы:** `@@index([userId])`, `@@index([isPublic, createdAt])`

### DecisionLike

| Поле | Тип | Примечание |
|------|-----|------------|
| id | UUID | PK |
| userId | UUID | FK → User, CASCADE |
| decisionId | UUID | FK → Decision, CASCADE |
| createdAt | DateTime | |

**Ограничения:** `@@unique([userId, decisionId])` — защита от накрутки.

### Scenario

| Поле | Тип | Примечание |
|------|-----|------------|
| id | UUID | PK |
| decisionId | UUID | FK → Decision, CASCADE |
| kind | ScenarioKind | |
| likelihood | Likelihood | |
| narrative | String | |
| orderIdx | Int | порядок карточек |

**Индекс:** `@@index([decisionId])`

### FailureMode

| Поле | Тип | Примечание |
|------|-----|------------|
| id | UUID | PK |
| decisionId | UUID | FK → Decision, CASCADE |
| cause | String | |
| prevention | String | |
| orderIdx | Int | |

**Индекс:** `@@index([decisionId])`

---

## Форма `Decision.tree` (Json)

```json
{
  "label": "Решение: ...",
  "branches": [
    {
      "choice": "...",
      "consequence": "...",
      "likelihood": "MEDIUM",
      "branches": []
    }
  ]
}
```

Глубина 2–3 уровня.

---

## Маппинг с DATABASE.sample.md

| Sample (промты) | Развилка |
|-----------------|----------|
| User | User |
| Prompt | **Decision** (основная сущность контента) |
| Vote | **DecisionLike** (лайк публичного разбора; Vote-калибровка — отдельно) |
| Note | удалена (smoke-тест) |

---

## Команды

```powershell
npx prisma migrate dev --name domain_init   # локально
npx prisma migrate deploy                   # Neon / Vercel
npm run db:seed                             # демо-кейс §16
npm run db:verify                           # smoke: User + Decision + Scenario + FailureMode
```

---

## Seed и verify

- **seed** (`prisma/seed.ts`) — демо-пользователь + решение «Сменить работу» + 3 сценария + failure modes
- **verify** (`prisma/verify-domain.ts`) — короткая проверка связей после миграции
