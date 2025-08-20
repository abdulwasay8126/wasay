# Next.js Chat Dashboard with n8n Webhook

A lightweight Next.js (Pages Router) + TypeScript dashboard featuring a chat interface that sends messages to an n8n webhook, styled with Tailwind CSS. Includes simple cookie-based auth with middleware route protection.

## Features

- Sidebar navigation (Home, Chat, Settings) with mobile-friendly collapse
- Chat UI with timestamps, user/bot styling, and simulated bot replies
- API route posts messages to configurable n8n webhook
- Toast notifications for success/failure
- Simple login using env-configured mock credentials

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
```

Required:

- `NEXT_PUBLIC_N8N_WEBHOOK_URL` — your n8n webhook URL
- `AUTH_USERNAME`, `AUTH_PASSWORD` — mock credentials for login (defaults: admin/password)

3. Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` to see the app. Log in, then visit `/dashboard`.

## Project Structure

- `pages/index.tsx` — login page
- `pages/dashboard.tsx` — main dashboard with tabs (Home/Chat/Settings)
- `pages/api/chat.ts` — validates input and forwards to webhook, returns simulated reply
- `pages/api/login.ts` and `pages/api/logout.ts` — cookie-based auth endpoints
- `middleware.ts` — protects `/dashboard`
- `src/components` — UI components (layout, sidebar, chat, toast)
- `src/utils` — `webhook.ts` and `auth.ts`
- `src/types` — shared TypeScript types

## n8n Webhook

The API route calls the webhook URL defined in `NEXT_PUBLIC_N8N_WEBHOOK_URL` with JSON payload:

```json
{ "message": "...", "timestamp": "ISO", "metadata": { "ip": "...", "userAgent": "..." } }
```

On failure, the UI shows an error toast. On success, a success toast is shown and a placeholder bot reply is displayed.

## Deployment

- Vercel: push this repo and set Environment Variables in the project settings (`NEXT_PUBLIC_N8N_WEBHOOK_URL`, `AUTH_USERNAME`, `AUTH_PASSWORD`).
- Run `npm run build` locally to verify.

## Notes

- Uses Pages Router for simplicity and clear API routes. Migrating to App Router later is straightforward.
- No external UI libs; Tailwind only.

# wasay