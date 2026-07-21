import { FINISH, SPACES } from "../data/board";

export const PLAYER_IDS = ["player", "cpu1", "cpu2", "cpu3"];

// Coins needed over the racer directly ahead of you to steal their spot.
export const OVERTAKE_MARGIN = 5;

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
    luck: 0.5, // random draw carried with the roll; resolves ? tiles
    lastEvent: null, // { playerId, coinDelta, moveDelta, finished }
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

// Resolve a ? tile from the luck draw. Half the outcomes are bad — the box
// is a gamble, not a gift.
function bonusOutcome(luck) {
  if (luck < 0.35) return { coinDelta: 3, moveDelta: 0 };
  if (luck < 0.55) return { coinDelta: 0, moveDelta: 2 };
  if (luck < 0.85) return { coinDelta: 0, moveDelta: -3 };
  return { coinDelta: -2, moveDelta: 0 };
}

// Leaderboard order with the coin-overtake rule: base order is finishers by
// place then racers by board position, but anyone holding OVERTAKE_MARGIN
// more coins than the racer directly ahead of them steals that spot (bubble
// upward until stable). Finishers can be reshuffled among themselves the same
// way, so a rich runner-up can take the crown — but an unfinished racer can
// never jump someone who already reached the castle.
export function rankPlayers(players) {
  const ranked = [...players].sort((a, b) => {
    if (a.finished && b.finished) return a.place - b.place;
    if (a.finished !== b.finished) return a.finished ? -1 : 1;
    return b.position - a.position;
  });
  for (let pass = 0; pass < players.length; pass++) {
    let moved = false;
    for (let i = ranked.length - 1; i > 0; i--) {
      const above = ranked[i - 1];
      const below = ranked[i];
      if (above.finished === below.finished && below.coins >= above.coins + OVERTAKE_MARGIN) {
        [ranked[i - 1], ranked[i]] = [below, above];
        moved = true;
      }
    }
    if (!moved) break;
  }
  return ranked;
}

export function reducer(state, action) {
  switch (action.type) {
    case "START_ROLL": {
      if (state.phase !== "ready") return state;
      return { ...state, phase: "rolling", lastRoll: action.value, luck: action.luck ?? 0.5 };
    }

    case "APPLY_ROLL": {
      if (state.phase !== "rolling") return state;
      const players = state.players.map((p) => ({ ...p }));
      const active = players[state.turnIndex];
      let target = Math.min(active.position + state.lastRoll, FINISH);

      // Resolve the tile landed on (the finish itself has no effect).
      let coinDelta = 0;
      let moveDelta = 0;
      if (target < FINISH) {
        const type = SPACES[target]?.type;
        if (type === "star") {
          coinDelta = 5;
        } else if (type === "bonus") {
          ({ coinDelta, moveDelta } = bonusOutcome(state.luck));
        }
      }

      target = Math.max(0, Math.min(target + moveDelta, FINISH));
      active.position = target;
      active.coins = Math.max(0, active.coins + coinDelta);

      let justFinished = false;
      if (target >= FINISH && !active.finished) {
        // Assign the place from how many have *already* finished, before marking
        // this one — the first to arrive is 1st, not 2nd.
        active.place = nextPlace(players);
        active.finished = true;
        justFinished = true;
      }

      const lastEvent = { playerId: active.id, coinDelta, moveDelta, finished: justFinished };

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
