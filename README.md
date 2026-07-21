# Castle Dash

The full-stack home of **Castle Dash**, a party-style board game: user
signup/login with bcrypt-protected passwords, plus per-user saved games
(player and CPU avatars and board positions) that can be created, loaded,
updated, and deleted.

Originally a Rails 7 + Heroku app, the backend is now a **Node/Express API that
deploys to Vercel for free**, backed by a free [Neon](https://neon.tech)
Postgres database. A fresh **React + Vite** frontend lives in `client/` and
builds into `public/`, which is served from the same deployment — so one Vercel
project runs the whole app (frontend + API).

The game is a race to the castle: log in, pick one of eight original
pixel-art characters, and roll the dice against three CPU rivals on a
procedurally drawn board (no static board image). Star tiles award coins;
? boxes are a gamble — bonus coins, a leap forward, a slip backward, or
lost coins. Coins are a second path to victory: hold 5+ more coins than
the racer directly ahead of you and you steal their leaderboard spot,
on the live standings and the final podium alike. Games save to and load
from the API.

## Architecture

- `api/index.js` — Vercel serverless entry point (all `/api/*` traffic is rewritten here, see `vercel.json`)
- `server/app.js` — the Express app: all `/api/v1` routes, auth via an HMAC-signed session cookie
- `server/session.js` — signs/verifies the session cookie (stands in for the Rails cookie store)
- `server/db.js` — Postgres connection pool (`DATABASE_URL`)
- `server/local.js` — local dev server (API + static `public/` with SPA fallback)
- `db/schema.sql` — schema (port of the old Rails `schema.rb`)
- `scripts/seed.js` — creates the tables; safe to re-run
- `client/` — the React + Vite frontend source
- `public/` — production build of the frontend, served statically with SPA fallback

The old Rails app (`app/`, `config/`, `Gemfile`, …) is kept in the repo for
reference but is no longer used; it can be deleted whenever you like.

## Frontend (client/)

The UI is a React + Vite single-page app that talks to `/api/v1`.

```sh
cd client
npm install
npm run dev     # http://localhost:5173, proxies /api to the backend on :3000
```

Run the backend (`npm run dev` in the repo root) alongside it during
development. To ship a change, rebuild the static bundle and commit it:

```sh
cd client
npm run build   # regenerates ../public
```

`public/` is committed so Vercel serves the app with no build step. The
character roster and board layout live in `client/src/data/`, and the turn
logic is in `client/src/game/` and `client/src/hooks/`.

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
  "player_avatar": "ember",
  "player_position": 0,
  "cpu1_avatar": "sprout",
  "cpu1_position": 0,
  "cpu2_avatar": "blossom",
  "cpu2_position": 0,
  "cpu3_avatar": "dot",
  "cpu3_position": 0,
  "user": { "id": 1, "username": "dylan" }
}
```

Avatar keys are the character keys from `client/src/data/characters.js`
(`ember`, `sprout`, `blossom`, `dot`, `chomp`, `drake`, `bolt`, `wisp`).
Saves from the previous version used different keys; the client maps them
onto the current cast automatically.

## Art

All artwork — the pixel-art characters, board, scenery, and icons — is
original SVG drawn for this project. No borrowed or licensed images are used.
