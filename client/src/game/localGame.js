// The in-progress guest/local game lives in sessionStorage under this key —
// setup writes it, the game screen keeps it updated, and the lobby offers to
// resume it. Saving to an account copies it to the API.
export const LOCAL_GAME_KEY = "castledash_game";

export function readLocalGame() {
  try {
    const raw = sessionStorage.getItem(LOCAL_GAME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLocalGame(game) {
  sessionStorage.setItem(LOCAL_GAME_KEY, JSON.stringify(game));
}

export function clearLocalGame() {
  sessionStorage.removeItem(LOCAL_GAME_KEY);
}
