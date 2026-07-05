# AUTH_SETUP.md — настройка входа через Google (Auth.js)

Пошаговая инструкция **для владельца проекта** (ручные действия в браузере и `.env`).  
Код auth описан в [PROMPTS.md](./PROMPTS.md) — **Промпт 2**; здесь только ключи и консоли.

---

## Что куда класть

| Переменная | Откуда | Зачем |
|------------|--------|--------|
| `AUTH_SECRET` | генерируете сами (команда ниже) | Подпись сессии Auth.js |
| `AUTH_URL` | URL приложения | `http://localhost:3000` локально; домен Vercel в production |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | Публичный ID OAuth-клиента |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | Секрет OAuth-клиента (не светить в git) |

Все четыре — в `.env` локально и в **Vercel → Settings → Environment Variables** (для Production и Preview по необходимости).

---

## 1. AUTH_SECRET

Случайная длинная строка. Auth.js использует её для шифрования/подписи cookie сессии.

**Локально (PowerShell, в папке проекта):**

```powershell
npx auth secret
```

Команда выведет строку вида `abc123...` — скопируйте в `.env`:

```text
AUTH_SECRET=вставьте_сгенерированную_строку
```

**Альтернатива:** любая случайная строка ≥ 32 символов (можно сгенерировать в [generate-secret.vercel.app](https://generate-secret.vercel.app/32)).

**На Vercel:** ту же строку (или отдельную для prod) добавить в Environment Variables как `AUTH_SECRET`.

---

## 2. AUTH_URL

Базовый URL, на котором крутится приложение (без слэша в конце).

| Среда | Значение |
|-------|----------|
| Локально | `http://localhost:3000` |
| Vercel Production | `https://ваш-домен.vercel.app` |

```text
AUTH_URL=http://localhost:3000
```

На Vercel — отдельное значение для Production (ваш реальный домен).

---

## 3. Google Cloud — Client ID и Client Secret

### 3.1. Проект и экран согласия

1. Откройте [Google Cloud Console](https://console.cloud.google.com/).
2. Создайте проект (или выберите существующий).
3. **APIs & Services → OAuth consent screen**
   - User Type: **External** (для личного/тестового MVP).
   - Заполните название приложения (например «Развилка»), email поддержки.
   - Scopes: достаточно базовых (`email`, `profile`, `openid` — обычно по умолчанию).
   - **Test users:** пока приложение в статусе **Testing**, добавьте свой Google-email — только эти аккаунты смогут войти.

### 3.2. OAuth Client ID

1. **APIs & Services → Credentials**
2. **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: например `razvilka-local` или `razvilka-vercel`

**Authorized JavaScript origins** (без пути, только origin):

```text
http://localhost:3000
https://ваш-домен.vercel.app
```

**Authorized redirect URIs** (точный путь callback Auth.js):

```text
http://localhost:3000/api/auth/callback/google
https://ваш-домен.vercel.app/api/auth/callback/google
```

5. **Create** — появятся **Client ID** и **Client secret**.

### 3.3. В `.env`

```text
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx
```

Секрет показывается один раз — сохраните сразу. На Vercel — те же имена переменных.

---

## 4. Пример полного блока в `.env`

```text
# --- Auth (Auth.js v5 + Google) ---
AUTH_SECRET=ваша_сгенерированная_строка
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-....
```

Старый `JWT_SECRET` для Auth.js **не нужен** — можно удалить после перехода на Auth.js.

---

## 5. Чеклист перед первым входом

- [ ] `AUTH_SECRET` задан локально и на Vercel
- [ ] `AUTH_URL` совпадает с реальным URL (localhost / vercel)
- [ ] Redirect URI в Google **точно** `.../api/auth/callback/google`
- [ ] Ваш Google-email в **Test users** (если consent screen в Testing)
- [ ] Код Промпта 2 выполнен (`next-auth`, миграция Prisma, `/login`)
- [ ] После смены `.env` — перезапуск `npm run dev`

---

## 6. Частые ошибки

| Ошибка | Причина |
|--------|---------|
| `redirect_uri_mismatch` | URI в Google Console не совпадает с фактическим callback |
| `Access blocked` / нет входа | Email не в Test users при статусе Testing |
| Сессия не держится на Vercel | Нет `AUTH_URL` / `AUTH_SECRET` в env Production |
| `invalid_client` | Неверный Client Secret или опечатка в ID |

---

## Связанные документы

- [PROMPTS.md](./PROMPTS.md) — **Промпт 2** (код), **Промпт 2а** (краткая выжимка Google Console)
- [PLAN.md](./PLAN.md) — этап 2, чеклист задач
- [DECISIONS.md](./DECISIONS.md) — ADR-003 (почему Auth.js + Google)
