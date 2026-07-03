# Local admin testing

Use this when you want `/admin` and the aanvragen/offertes backend to work locally.

## 1. Start local Postgres

```sh
docker compose -f compose.local.yml up -d
```

This starts Postgres on local port `54329`.

## 2. Set local env

In `.env`, make sure these exist:

```sh
ADMIN_PASSWORD=choose-a-local-password
DATABASE_URL=postgres://hangendehapjes:hangendehapjes@localhost:54329/hangendehapjes
```

For local testing, Telegram can be disabled by leaving these empty or removing them:

```sh
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

If Telegram is configured with an invalid bot token, Telegram returns `404 Not Found`. That does not block the admin backend.

## 3. Restart dev server

Vite reads env at server start. After editing `.env`, restart:

```sh
pnpm run dev
```

Use the shown local URL, for example:

```txt
http://localhost:5174/admin
```

Log in with `ADMIN_PASSWORD`.

## 4. Test the acceptance flow

1. Go to `/admin/aanvragen`.
2. Add or open a deal.
3. Set event date, offerte amount, aanbetaling amount, and betaallink.
4. Generate the klantlink.
5. Keep the klantlink enabled and set an expiry date.
6. Open the generated `/klantportaal/[token]` link.
7. Accept terms, fill details, save, and check that the payment button appears.

The app creates/migrates the database table automatically on first admin load.
