// Thin wrapper over the /api/v1 backend. Auth is a session cookie, so every
// request sends credentials. Errors surface the backend's { errors: [...] }.

const BASE = "/api/v1";

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && data.errors && data.errors.join(", ")) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  me: () => req("/me"),
  signup: (body) => req("/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => req("/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => req("/logout", { method: "DELETE" }),

  listGames: () => req("/games"),
  getGame: (id) => req(`/games/${id}`),
  createGame: (body) => req("/games", { method: "POST", body: JSON.stringify(body) }),
  updateGame: (id, body) => req(`/games/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteGame: (id) => req(`/games/${id}`, { method: "DELETE" }),
};
