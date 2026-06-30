# DATABASE.sample.md — шаблон (другой проект)

> Образец схемы для приложения «библиотека промтов с голосованием».  
> **Не используется** в «Развилке». Актуальная схема — [DATABASE.md](./DATABASE.md).

## Сущности

- **Note** — заметки
- **User** — владелец промтов, автор, голосующий
- **Prompt** — промт (приватный или публичный)
- **Tag** — метки (M:N с Prompt)
- **Vote** — голос за публичный промт (UNIQUE userId + promptId)
- *(опционально)* Collection / PromptVersion

## Ключевые правила

- Публичность — свойство Prompt (`visibility`)
- Голосовать можно только по публичным
- UNIQUE(userId, promptId) на Vote
- onDelete: Cascade

## Таблицы (черновик)

| Модель | Поля |
|--------|------|
| User | id, email, name?, createdAt |
| Prompt | id, ownerId, title, content, visibility, … |
| Vote | id, userId, promptId, value, createdAt |
| Category | id, category |

## Индексы

- Prompt(ownerId, updatedAt)
- Prompt(visibility, createdAt)
- Vote(promptId), Vote(userId)
