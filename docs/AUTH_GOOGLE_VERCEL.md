# AUTH — вход через Google (Auth.js): полная инструкция

Пошаговое руководство для проекта **«Развилка»**: Google Cloud Console, локальный `.env`, Vercel, типичные ошибки.

**Стек:** Auth.js v5 (`next-auth` beta) + `@auth/prisma-adapter` + Google OAuth only (без email/пароля).

**Production:** [https://5-razvilka.vercel.app](https://5-razvilka.vercel.app)  
**Локально:** [http://localhost:3000](http://localhost:3000)

---

## Содержание

1. [Как это работает](#1-как-это-работает)
2. [Переменные окружения — что за что](#2-переменные-окружения--что-за-что)
3. [Google Cloud Console](#3-google-cloud-console)
4. [Локальный `.env`](#4-локальный-env)
5. [Vercel Environment Variables](#5-vercel-environment-variables)
6. [Проверка](#6-проверка)
7. [Типичные ошибки](#7-типичные-ошибки)
8. [Чеклисты](#8-чеклисты)

---

## 1. Как это работает

```text
Пользователь → «Войти через Google» → Google OAuth
    → callback /api/auth/callback/google
    → Auth.js создаёт User + Account + Session в Neon
    → httpOnly cookie (сессия в БД, не localStorage)
```

| Компонент | Файл / URL |
|-----------|------------|
| Конфиг Auth.js | `auth.ts` |
| API-маршруты | `/api/auth/[...nextauth]` |
| Страница входа | `/login` |
| Обёртки для кода | `lib/auth.ts` (`getCurrentUser`, `requireUser`) |

**Важно:** `.env` на компьютере **не попадает** на Vercel (файл в `.gitignore`). Локальные и production-переменные задаются **отдельно**.

---

## 2. Переменные окружения — что за что

### Auth (обязательно)

| Переменная | За что отвечает | Локально | Vercel Production |
|------------|-----------------|----------|-------------------|
| `AUTH_SECRET` | Подпись/шифрование cookie сессии. Без неё — «Server configuration error» | Своя строка (см. ниже) | **Та же** или отдельная для prod |
| `AUTH_URL` | Базовый URL приложения для OAuth redirect | `http://localhost:3000` | `https://5-razvilka.vercel.app` |
| `GOOGLE_CLIENT_ID` | Публичный ID OAuth-клиента из Google | Из Google Console | **То же значение** |
| `GOOGLE_CLIENT_SECRET` | Секрет OAuth-клиента | Из Google Console | **То же значение** |

### База данных (обязательно для входа)

Auth.js с `session: { strategy: "database" }` пишет сессии в Neon через Prisma.

| Переменная | За что отвечает |
|------------|-----------------|
| `DATABASE_URL` | Pooled-строка Neon для приложения |
| `DIRECT_URL` | Direct-строка Neon (миграции; на runtime тоже нужна в env) |

### Не нужны для Auth.js

| Переменная | Комментарий |
|------------|-------------|
| `JWT_SECRET` | Устарело (была собственная auth). Можно удалить из `.env` |
| `DATABASE_URL_PROD` | Только для dev-утилиты `view-db` |
| `VIEW_DB_ENABLED` | Не ставить на production |

### Как сгенерировать `AUTH_SECRET`

PowerShell, в папке проекта:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Скопировать вывод в `.env` и Vercel.  
**Не** используйте `npx auth secret` без `next-auth` — может подтянуть чужой пакет и имя `BETTER_AUTH_SECRET`.

---

## 3. Google Cloud Console

### 3.1. Вход в консоль

1. [Google Cloud Console](https://console.cloud.google.com/)
2. Проект: **razvilka** (или ваш)
3. При первом входе может потребоваться **2FA** на аккаунте Google

### 3.2. Экран согласия OAuth (один раз)

Путь (новый UI): [Google Auth Platform → Overview](https://console.cloud.google.com/auth/overview)  
Путь (классика): **API и сервисы** → **Экран согласия OAuth**

| Поле | Значение |
|------|----------|
| Тип пользователей | **Внешний** (External) |
| Название приложения | `Развилка` |
| Email поддержки | ваш Gmail |
| **Тестовые пользователи** | ваш Gmail (пока статус **Testing**) |

Без тестового пользователя Google не пустит «чужие» аккаунты.

### 3.3. OAuth Client ID

Путь: [Credentials](https://console.cloud.google.com/apis/credentials)  
или [Auth → Clients](https://console.cloud.google.com/auth/clients)

**Create Credentials → OAuth client ID → Web application**  
Имя клиента: `razvilka-local` (или любое)

#### Authorized JavaScript origins

Без пути, только origin:

```text
http://localhost:3000
https://5-razvilka.vercel.app
https://5-razvilka-git-main-evgenyleonovns.vercel.app
```

#### Authorized redirect URIs

**Точный путь** до `/google`:

```text
http://localhost:3000/api/auth/callback/google
https://5-razvilka.vercel.app/api/auth/callback/google
https://5-razvilka-git-main-evgenyleonovns.vercel.app/api/auth/callback/google
```

> **Почему три URL на Vercel?**  
> Vercel даёт основной домен `5-razvilka.vercel.app` и deployment-URL `5-razvilka-git-main-evgenyleonovns.vercel.app`.  
> Auth.js может отправить `redirect_uri` на любой из них — все три должны быть в списке.

После **Сохранить** подождите **1–5 минут**.

### 3.4. Куда скопировать ключи

| Из Google | Куда |
|-----------|------|
| Client ID | `GOOGLE_CLIENT_ID` в `.env` и Vercel |
| Client secret | `GOOGLE_CLIENT_SECRET` в `.env` и Vercel (показывается один раз!) |

---

## 4. Локальный `.env`

Файл: `F:\Projects\Cursor\Work\5-razvilka\.env` (не коммитить!)

Пример блока (подставьте свои значения):

```text
# --- База данных (Neon) ---
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# --- Auth (Auth.js + Google) ---
AUTH_SECRET=64_символа_hex
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-....
```

### Правила

- `AUTH_URL` **локально** — только `http://localhost:3000`
- **Не** ставьте production URL в локальный `.env` — сломается вход на localhost
- В значениях **нет** префикса `ИМЯ=` (только само значение после `=`)

После изменений:

```powershell
npm run dev
```

Проверка: [http://localhost:3000/login](http://localhost:3000/login)

---

## 5. Vercel Environment Variables

### 5.1. Где открыть

1. [vercel.com/dashboard](https://vercel.com/dashboard)
2. Проект **5-razvilka**
3. **Settings** → **Environment Variables**

### 5.2. Что добавить (Production + Preview)

| Key | Value (только значение!) | Откуда взять |
|-----|--------------------------|--------------|
| `DATABASE_URL` | `postgresql://...` | Neon Console → Connection string (pooled) |
| `DIRECT_URL` | `postgresql://...` | Neon → direct connection |
| `AUTH_SECRET` | 64 символа hex | Тот же, что в локальном `.env` |
| `AUTH_URL` | `https://5-razvilka.vercel.app` | Домен production **без** `/` в конце |
| `GOOGLE_CLIENT_ID` | `....apps.googleusercontent.com` | Google Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google Console |

### 5.3. Частая ошибка в UI Vercel

| Неправильно (в поле Value) | Правильно |
|------------------------------|-----------|
| `AUTH_URL=https://5-razvilka.vercel.app` | `https://5-razvilka.vercel.app` |
| `GOOGLE_CLIENT_ID=232865...` | `23286564365-....apps.googleusercontent.com` |

Ключ уже указан в поле **Key** — в **Value** только значение.

### 5.4. После любой правки env

**Deployments** → последний деплой → **⋯** → **Redeploy**

Без redeploy новые переменные **не подхватятся**.

### 5.5. Локаль vs Vercel — таблица

| Переменная | `.env` на ПК | Vercel Production |
|------------|--------------|-------------------|
| `AUTH_URL` | `http://localhost:3000` | `https://5-razvilka.vercel.app` |
| `AUTH_SECRET` | ваш секрет | тот же (или отдельный) |
| `GOOGLE_*` | из Google | **те же** |
| `DATABASE_*` | из Neon | **те же** |

---

## 6. Проверка

### Локально

```powershell
npm run dev
```

- [http://localhost:3000/login](http://localhost:3000/login) → «Войти через Google»
- После входа — имя/аватар в шапке, кнопка «Выйти»

### Production

- [https://5-razvilka.vercel.app/login](https://5-razvilka.vercel.app/login)
- Вход тем же Google-аккаунтом, что в **Test users**

### Диагностика redirect

Если Google пишет `redirect_uri_mismatch`:

1. Нажать **«Подробности об ошибке»**
2. Скопировать строку `redirect_uri=https://...`
3. Добавить **точно такую** строку в Google → Authorized redirect URIs

---

## 7. Типичные ошибки

| Симптом | Причина | Решение |
|---------|---------|---------|
| `redirect_uri_mismatch` | URI в Google ≠ фактический `redirect_uri` | Добавить точный URI из «Подробностей»; проверить `AUTH_URL` |
| `redirect_uri` = `...git-main...vercel.app` | Vercel использует deployment URL | Добавить git-main URI в Google **или** выровнять `AUTH_URL` на основной домен |
| `Server configuration error` | Нет `AUTH_SECRET` / Google keys на Vercel | Добавить все env на Vercel + **Redeploy** |
| Локалка работала, потом сломалась | В `.env` стоит production `AUTH_URL` | Вернуть `AUTH_URL=http://localhost:3000` |
| `Access blocked` | Email не в Test users | Google Console → Аудитория → Test users |
| Сайт не открывается (timeout) | Сеть / DNS / блокировка | Попробовать другую сеть; проверить [vercel.com/status](https://www.vercel-status.com/) |
| `invalid_client` | Неверный Client Secret | Пересоздать secret в Google, обновить `.env` и Vercel |

---

## 8. Чеклисты

### Google Console

- [ ] OAuth consent screen: External + Test users
- [ ] OAuth client: Web application
- [ ] 3 JavaScript origins (localhost + 2 vercel)
- [ ] 3 redirect URIs с `/api/auth/callback/google`

### Локальный `.env`

- [ ] `AUTH_URL=http://localhost:3000`
- [ ] `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] `DATABASE_URL`, `DIRECT_URL`

### Vercel

- [ ] Те же 6 переменных (кроме `AUTH_URL` = production домен)
- [ ] В Value **нет** `KEY=`
- [ ] Redeploy после правок

---

## Связанные документы

- [AUTH_SETUP.md](./AUTH_SETUP.md) — краткая выжимка
- [PROMPTS.md](./PROMPTS.md) — Промпт 2 (код auth)
- [DECISIONS.md](./DECISIONS.md) — ADR-003 (Auth.js + Google)
- [PLAN.md](./PLAN.md) — этап 2
