-- Postgres schema for the board game app (port of the Rails schema.rb)

CREATE TABLE IF NOT EXISTS users (
  id bigserial PRIMARY KEY,
  username varchar UNIQUE NOT NULL,
  password_digest varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users (id),
  player_avatar varchar,
  player_position integer,
  cpu1_avatar varchar,
  cpu1_position integer,
  cpu2_avatar varchar,
  cpu2_position integer,
  cpu3_avatar varchar,
  cpu3_position integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS index_games_on_user_id ON games (user_id);
