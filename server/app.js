const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const { readSession, setSession, clearSession } = require("./session");

const app = express();
app.use(express.json());

// Same-origin deployments need no CORS; set FRONTEND_ORIGIN (comma-separated)
// if the frontend is hosted elsewhere.
if (process.env.FRONTEND_ORIGIN) {
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
}

// ---------- serializers (match the old ActiveModel::Serializer output) ----------

const serializeUser = (u) => ({ id: u.id, username: u.username });

const serializeGame = (g) => ({
  id: g.id,
  player_avatar: g.player_avatar,
  player_position: g.player_position,
  cpu1_avatar: g.cpu1_avatar,
  cpu1_position: g.cpu1_position,
  cpu2_avatar: g.cpu2_avatar,
  cpu2_position: g.cpu2_position,
  cpu3_avatar: g.cpu3_avatar,
  cpu3_position: g.cpu3_position,
  user: { id: g.user_id, username: g.user_username },
});

const GAME_SELECT = `
  SELECT g.id, g.player_avatar, g.player_position,
         g.cpu1_avatar, g.cpu1_position, g.cpu2_avatar, g.cpu2_position,
         g.cpu3_avatar, g.cpu3_position, g.user_id,
         u.username AS user_username
  FROM games g JOIN users u ON u.id = g.user_id`;

// ---------- helpers ----------

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function authorize(req, res, next) {
  const session = readSession(req);
  if (session) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [session.user_id]);
    if (rows[0]) {
      req.currentUser = rows[0];
      return next();
    }
  }
  res.status(401).json({ errors: ["Not authorized"] });
}

const auth = wrap(authorize);

const api = express.Router();
app.use("/api/v1", api);

// ---------- auth ----------

api.post(
  "/signup",
  wrap(async (req, res) => {
    const { username, password, password_confirmation } = req.body || {};
    const errors = [];
    if (!username) errors.push("Username can't be blank");
    if (!password) errors.push("Password can't be blank");
    if (password_confirmation !== undefined && password !== password_confirmation)
      errors.push("Password confirmation doesn't match Password");
    if (username) {
      const { rows } = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
      if (rows[0]) errors.push("Username has already been taken");
    }
    if (errors.length) return res.status(422).json({ errors });

    const digest = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (username, password_digest) VALUES ($1, $2) RETURNING *",
      [username, digest]
    );
    const user = rows[0];
    setSession(res, user.id);
    res.status(201).json(serializeUser(user));
  })
);

api.post(
  "/login",
  wrap(async (req, res) => {
    const { username, password } = req.body || {};
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = rows[0];
    if (user && password && (await bcrypt.compare(password, user.password_digest))) {
      setSession(res, user.id);
      res.status(201).json(serializeUser(user));
    } else {
      res.status(401).json({ errors: ["Invalid username or password"] });
    }
  })
);

api.delete("/logout", auth, (req, res) => {
  clearSession(res);
  res.status(204).end();
});

api.get("/me", auth, (req, res) => {
  res.json(serializeUser(req.currentUser));
});

// ---------- games ----------

api.get(
  "/games",
  auth,
  wrap(async (req, res) => {
    const { rows } = await pool.query(`${GAME_SELECT} WHERE g.user_id = $1 ORDER BY g.id`, [
      req.currentUser.id,
    ]);
    res.json(rows.map(serializeGame));
  })
);

api.get(
  "/games/:id",
  auth,
  wrap(async (req, res) => {
    const { rows } = await pool.query(`${GAME_SELECT} WHERE g.user_id = $1 AND g.id = $2`, [
      req.currentUser.id,
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ errors: ["Game not found"] });
    res.json(serializeGame(rows[0]));
  })
);

api.post(
  "/games",
  auth,
  wrap(async (req, res) => {
    const p = req.body || {};
    const errors = [];
    if (!p.player_avatar) errors.push("Player avatar can't be blank");
    if (!p.cpu1_avatar) errors.push("Cpu1 avatar can't be blank");
    if (!p.cpu2_avatar) errors.push("Cpu2 avatar can't be blank");
    if (!p.cpu3_avatar) errors.push("Cpu3 avatar can't be blank");
    if (errors.length) return res.status(422).json({ errors });

    const inserted = await pool.query(
      `INSERT INTO games (user_id, player_avatar, player_position,
                          cpu1_avatar, cpu1_position, cpu2_avatar, cpu2_position,
                          cpu3_avatar, cpu3_position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        req.currentUser.id,
        p.player_avatar,
        p.player_position ?? 0,
        p.cpu1_avatar,
        p.cpu1_position ?? 0,
        p.cpu2_avatar,
        p.cpu2_position ?? 0,
        p.cpu3_avatar,
        p.cpu3_position ?? 0,
      ]
    );
    const { rows } = await pool.query(`${GAME_SELECT} WHERE g.id = $1`, [inserted.rows[0].id]);
    res.status(201).json(serializeGame(rows[0]));
  })
);

api.patch("/games/:id", auth, wrap(updateGame));
api.put("/games/:id", auth, wrap(updateGame));
async function updateGame(req, res) {
  const p = req.body || {};
  const updated = await pool.query(
    `UPDATE games
        SET player_position = COALESCE($1, player_position),
            cpu1_position   = COALESCE($2, cpu1_position),
            cpu2_position   = COALESCE($3, cpu2_position),
            cpu3_position   = COALESCE($4, cpu3_position),
            updated_at      = now()
      WHERE id = $5 AND user_id = $6
      RETURNING id`,
    [
      p.player_position ?? null,
      p.cpu1_position ?? null,
      p.cpu2_position ?? null,
      p.cpu3_position ?? null,
      req.params.id,
      req.currentUser.id,
    ]
  );
  if (!updated.rows[0]) return res.status(404).json({ errors: ["Game not found"] });
  const { rows } = await pool.query(`${GAME_SELECT} WHERE g.id = $1`, [updated.rows[0].id]);
  res.json(serializeGame(rows[0]));
}

api.delete(
  "/games/:id",
  auth,
  wrap(async (req, res) => {
    await pool.query("DELETE FROM games WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.currentUser.id,
    ]);
    res.status(204).end();
  })
);

// ---------- errors ----------

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ errors: ["Internal server error"] });
});

module.exports = app;
