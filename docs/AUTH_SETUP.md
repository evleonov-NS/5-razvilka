# AUTH_SETUP.md — настройка входа через Google (Auth.js)

> **Полная инструкция** (Google Console, `.env`, Vercel, ошибки):  
> **[AUTH_GOOGLE_VERCEL.md](./AUTH_GOOGLE_VERCEL.md)**

Краткая выжимка ниже.

---

## Переменные

| Переменная | Локально | Vercel Production |
|------------|----------|-------------------|
| `AUTH_SECRET` | hex 64 символа | то же |
| `AUTH_URL` | `http://localhost:3000` | `https://5-razvilka.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google Console | то же |
| `GOOGLE_CLIENT_SECRET` | Google Console | то же |
| `DATABASE_URL` / `DIRECT_URL` | Neon | то же |

`AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Google — redirect URIs (все три)

```text
http://localhost:3000/api/auth/callback/google
https://5-razvilka.vercel.app/api/auth/callback/google
https://5-razvilka-git-main-evgenyleonovns.vercel.app/api/auth/callback/google
```

Ссылки: [Credentials](https://console.cloud.google.com/apis/credentials) · [Auth Clients](https://console.cloud.google.com/auth/clients)

---

## Vercel

[Dashboard → Settings → Environment Variables](https://vercel.com/dashboard)

В поле **Value** — только значение, **без** `KEY=`. После правок — **Redeploy**.

---

## Код auth

[PROMPTS.md](./PROMPTS.md) — Промпт 2 · [DECISIONS.md](./DECISIONS.md) — ADR-003
