import { FINISH, SPACES } from "../data/board";

export const PLAYER_IDS = ["player", "cpu1", "cpu2", "cpu3"];

// Spend this many coins to roll two dice and move the sum.
export const DOUBLE_ROLL_COST = 10;

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
    // ready | rolling | moving | over
    phase: allFinished(players) ? "over" : "ready",
    dice: [], // 1 die normally, 2 for a double roll (display)
    lastRoll: null, // sum of the dice
    luck: 0.5, // random draw carried with the roll; resolves ? tiles
    moveTarget: null, // where the active token is walking to
    effectApplied: false, // tile effect already resolved this turn?
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

// Leaderboard order: finishers by arrival place, then racers by position.
export function rankPlayers(players) {
  return [...players].sort((a, b) => {
    if (a.finished && b.finished) return a.place - b.place;
    if (a.finished !== b.finished) return a.finished ? -1 : 1;
    return b.position - a.position;
  });
}

function endTurn(state, players, lastEvent) {
  if (allFinished(players)) {
    return { ...state, players, phase: "over", moveTarget: null, lastEvent };
  }
  const nextTurn = firstUnfinished(players, (state.turnIndex + 1) % players.length);
  const round = nextTurn <= state.turnIndex ? state.round + 1 : state.round;
  return { ...state, players, turnIndex: nextTurn, phase: "ready", moveTarget: null, round, lastEvent };
}

export function reducer(state, action) {
  switch (action.type) {
    case "START_ROLL": {
      if (state.phase !== "ready") return state;
      const values = action.values || [action.value];
      const cost = action.cost || 0;
      const players = state.players.map((p) => ({ ...p }));
      const active = players[state.turnIndex];
      if (cost > active.coins) return state; // can't afford a double roll
      active.coins -= cost;
      return {
        ...state,
        players,
        phase: "rolling",
        dice: values,
        lastRoll: values.reduce((a, b) => a + b, 0),
        luck: action.luck ?? 0.5,
      };
    }

    case "BEGIN_MOVE": {
      if (state.phase !== "rolling") return state;
      const active = state.players[state.turnIndex];
      return {
        ...state,
        phase: "moving",
        moveTarget: Math.min(active.position + state.lastRoll, FINISH),
        effectApplied: false,
      };
    }

    // One animation tick: the active token walks a single space toward the
    // target; tile effects resolve on arrival (and may set a new target so
    // forced moves animate too).
    case "STEP": {
      if (state.phase !== "moving") return state;
      const players = state.players.map((p) => ({ ...p }));
      const active = players[state.turnIndex];

      if (active.position !== state.moveTarget) {
        active.position += active.position < state.moveTarget ? 1 : -1;
        if (active.position !== state.moveTarget) return { ...state, players };
      }

      // Arrived. Resolve the tile once.
      if (!state.effectApplied) {
        let coinDelta = 0;
        let moveDelta = 0;
        if (active.position < FINISH) {
          const type = SPACES[active.position]?.type;
          if (type === "star") coinDelta = 5;
          else if (type === "bonus") ({ coinDelta, moveDelta } = bonusOutcome(state.luck));
        }
        active.coins = Math.max(0, active.coins + coinDelta);
        const lastEvent = { playerId: active.id, coinDelta, moveDelta, finished: false };
        const newTarget = Math.max(0, Math.min(active.position + moveDelta, FINISH));
        if (newTarget !== active.position) {
          return { ...state, players, effectApplied: true, moveTarget: newTarget, lastEvent };
        }
        state = { ...state, effectApplied: true, lastEvent };
      }

      if (active.position >= FINISH && !active.finished) {
        active.place = nextPlace(players);
        active.finished = true;
        return endTurn(state, players, {
          playerId: active.id,
          coinDelta: 0,
          moveDelta: 0,
          finished: true,
        });
      }

      return endTurn(state, players, state.lastEvent);
    }

    default:
      return state;
  }
}

export const rollDie = () => 1 + Math.floor(Math.random() * 6);
