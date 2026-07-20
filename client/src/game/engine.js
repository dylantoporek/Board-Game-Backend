import { FINISH, SPACES, TILE_REWARD } from "../data/board";

export const PLAYER_IDS = ["player", "cpu1", "cpu2", "cpu3"];

// Build the initial engine state from the four characters and (optionally)
// saved positions when resuming a game.
export function createInitialState({ characters, positions = {} }) {
  const players = PLAYER_IDS.map((id) => {
    const position = positions[id] ?? 0;
    return {
      id,
      isCPU: id !== "player",
      character: characters[id],
      position,
      coins: 0,
      finished: position >= FINISH,
    };
  });

  // Recompute finishing places for any already-finished players (resumed game).
  assignPlacesForFinished(players);

  return {
    players,
    turnIndex: firstUnfinished(players, 0),
    phase: allFinished(players) ? "over" : "ready", // ready | rolling | over
    lastRoll: null,
    lastEvent: null, // { playerId, coins, finished } — for toasts + sound
    round: 1,
  };
}

function firstUnfinished(players, from) {
  for (let n = 0; n < players.length; n++) {
    const i = (from + n) % players.length;
    if (!players[i].finished) return i;
  }
  return from;
}

const allFinished = (players) => players.every((p) => p.finished);
const nextPlace = (players) => players.filter((p) => p.finished).length + 1;

function assignPlacesForFinished(players) {
  // Order finished players by how far past the finish they'd have been; stable
  // enough for a resumed game where exact order wasn't persisted.
  const finished = players.filter((p) => p.finished);
  finished
    .sort((a, b) => b.position - a.position)
    .forEach((p, idx) => {
      p.place = idx + 1;
    });
}

export function reducer(state, action) {
  switch (action.type) {
    case "START_ROLL": {
      if (state.phase !== "ready") return state;
      return { ...state, phase: "rolling", lastRoll: action.value };
    }

    case "APPLY_ROLL": {
      if (state.phase !== "rolling") return state;
      const players = state.players.map((p) => ({ ...p }));
      const active = players[state.turnIndex];
      const target = Math.min(active.position + state.lastRoll, FINISH);
      active.position = target;

      let justFinished = false;
      if (target >= FINISH && !active.finished) {
        // Assign the place from how many have *already* finished, before marking
        // this one — the first to arrive is 1st, not 2nd.
        active.place = nextPlace(players);
        active.finished = true;
        justFinished = true;
      }

      // Coins for landing on a decorated tile (not the finish).
      const reward = justFinished ? 0 : TILE_REWARD[SPACES[target]?.type] || 0;
      active.coins += reward;
      const lastEvent = { playerId: active.id, coins: reward, finished: justFinished };

      if (allFinished(players)) {
        return { ...state, players, phase: "over", lastEvent };
      }

      const nextTurn = firstUnfinished(players, (state.turnIndex + 1) % players.length);
      const round = nextTurn <= state.turnIndex ? state.round + 1 : state.round;
      return { ...state, players, turnIndex: nextTurn, phase: "ready", round, lastEvent };
    }

    default:
      return state;
  }
}

export const rollDie = () => 1 + Math.floor(Math.random() * 6);
