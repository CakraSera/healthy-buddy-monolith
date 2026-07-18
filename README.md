# Health Buddy

Health Buddy is an AI health-coach chat app. You chat with a friendly coach that
gives gentle, everyday advice on sleep, basic nutrition, light movement, and
stress. It is **not** a medical tool and does not diagnose anything — just simple
support to help you build better habits.

## What's inside

This is a pnpm monorepo with two apps:

- **`apps/api`** — a Hono server (Node.js) that streams chat replies from the AI,
  stores messages in Postgres, and runs background jobs with Redis.
- **`apps/frontend`** — a Vite + React app (the website you actually use) that
  talks to the API.

## Requirements

Before you start, make sure you have these installed:

- **Node.js** (v20 or newer)
- **pnpm** (v11 — the project can auto-install the right version)
- **Docker** (to run the database and Redis)

## Environment variables

The whole project reads a **single `.env` file in the root folder** (not one per
app). Create a file named `.env` in the project root and fill it in:

```env
# Database (Postgres) — matches the docker-compose setup below
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/postgres"

# Redis — matches the docker-compose setup below
REDIS_HOST="localhost"
REDIS_PORT="16379"
REDIS_DB="0"

# AI provider (OpenAI-compatible)
OPENAI_API_KEY="your-api-key-here"
OPENAI_API_BASE_URL="https://api.openai.com/v1"
```

## Setup & running

Run all commands from the **project root**.

**1. Install dependencies**

```bash
pnpm install
```

**2. Start the database and Redis** (with Docker)

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- Postgres on port `15432`
- Redis on port `16379`

**3. Set up the database tables**

```bash
pnpm --filter api db:migrate
```

**4. Start the app** (runs both the API and the website together)

```bash
pnpm dev
```

Now open your browser:

- Website (frontend): http://localhost:3000
- API server: http://localhost:8000

**5. (Optional) Start the background worker**

The worker handles background jobs like summarizing chats. In a separate
terminal, run:

```bash
pnpm worker:dev
```

## Handy commands

```bash
pnpm --filter api dev         # run only the API
pnpm --filter frontend dev    # run only the website
pnpm --filter api db:studio   # open a UI to view the database
```

## Ports at a glance

| Service   | URL / Port              |
| --------- | ----------------------- |
| Frontend  | http://localhost:3000   |
| API       | http://localhost:8000   |
| Postgres  | localhost:15432         |
| Redis     | localhost:16379         |
