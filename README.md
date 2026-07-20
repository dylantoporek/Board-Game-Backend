# Board Game Backend

The API for the Nintendo Land board game app: user signup/login with
bcrypt-protected passwords, plus per-user saved games (player and CPU avatars
and board positions) that can be created, loaded, updated, and deleted.

Originally a Rails 7 + Heroku app, the backend is now a **Node/Express API that
deploys to Vercel for free**, backed by a free [Neon](https://neon.tech)
Postgres database. When a production build of the React frontend is placed in
`public/`, it is served from the same deployment, so one Vercel project can run
the whole app.

> Note: the frontend ([Nintendo-Land](https://github.com/dylantoporek/Nintendo-Land))
> still talks to the old Rails API and needs its own updates to use this Node
> backend — those changes are intentionally left for a separate pass.

## Architecture

- `api/index.js` — Vercel serverless entry point (all `/api/*` traffic is rewritten here, see `vercel.json`)
- `server/app.js` — the Express app: all `/api/v1` routes, auth via an HMAC-signed session cookie
- `server/session.js` — signs/verifies the session cookie (stands in for the Rails cookie store)
- `server/db.js` — Postgres connection pool (`DATABASE_URL`)
- `server/local.js` — local dev server (API + static `public/` with SPA fallback)
- `db/schema.sql` — schema (port of the old Rails `schema.rb`)
- `scripts/seed.js` — creates the tables; safe to re-run
- `public/` — production build of the React frontend, served statically with SPA fallback

The old Rails app (`app/`, `config/`, `Gemfile`, …) is kept in the repo for
reference but is no longer used; it can be deleted whenever you like.

## Deploying (free)

### 1. Create a free Postgres database on Neon

1. Sign up at [neon.tech](https://neon.tech) (free tier: 0.5 GB, no credit card).
2. Create a project, then copy the **pooled** connection string (the one with `-pooler` in the hostname). It looks like `postgres://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`.

> Any free Postgres works (Supabase, etc.) — Neon is just the smoothest fit for Vercel. You can also add it directly from the Vercel dashboard via **Storage → Neon**.

### 2. Create the tables

From your machine (or anywhere with Node 18+):

```sh
npm install
DATABASE_URL="<your neon connection string>" npm run seed
```

This creates the `users` and `games` tables. There is no reference data to load —
users create their own games. Re-running is safe.

### 3. Deploy to Vercel

1. Sign up at [vercel.com](https://vercel.com) (free Hobby plan) and import this GitHub repo. The defaults are fine — no build command needed.
2. In the project's **Settings → Environment Variables**, add:
   - `DATABASE_URL` — the Neon pooled connection string
   - `SESSION_SECRET` — a random secret for signing login cookies; generate one with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Deploy. The API is live at your `*.vercel.app` URL.

`FRONTEND_ORIGIN` is only needed if you host the frontend on a different domain
(enables CORS with credentials for that origin).

## Local development

Requires Node 18+ and a local Postgres.

```sh
npm install
createdb board_game_dev
DATABASE_URL="postgres://localhost:5432/board_game_dev" npm run seed
DATABASE_URL="postgres://localhost:5432/board_game_dev" npm run dev
# → http://localhost:3000
```

## API

All routes are under `/api/v1`. Everything except signup/login requires the
session cookie.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/signup` | Create account (`username`, `password`, `password_confirmation`) |
| POST | `/login` | Log in (`username`, `password`) |
| DELETE | `/logout` | Log out |
| GET | `/me` | Current user |
| GET | `/games` | Current user's saved games |
| GET | `/games/:id` | Load one saved game |
| POST | `/games` | Save a new game (`player_avatar`, `player_position`, `cpu1_avatar`, `cpu1_position`, `cpu2_avatar`, `cpu2_position`, `cpu3_avatar`, `cpu3_position`) |
| PATCH | `/games/:id` | Update board positions (`player_position`, `cpu1_position`, `cpu2_position`, `cpu3_position`) |
| DELETE | `/games/:id` | Delete a saved game |

A game serializes as:

```json
{
  "id": 1,
  "player_avatar": "mario",
  "player_position": 0,
  "cpu1_avatar": "luigi",
  "cpu1_position": 0,
  "cpu2_avatar": "peach",
  "cpu2_position": 0,
  "cpu3_avatar": "toad",
  "cpu3_position": 0,
  "user": { "id": 1, "username": "dylan" }
}
```

## Disclaimer

I do not own any images used in this application or the rights to those images.
