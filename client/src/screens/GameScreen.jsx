import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { FINISH } from "../data/board";
import { getCharacter } from "../data/characters";
import { useGameEngine } from "../hooks/useGameEngine";
import { rankPlayers, DOUBLE_ROLL_COST } from "../game/engine";
import { readLocalGame, writeLocalGame } from "../game/localGame";
import { sound } from "../game/sound";
import Board from "../components/Board";
import Dice from "../components/Dice";
import Results from "../components/Results";
import CharacterBadge from "../components/CharacterBadge";
import { CastleLogo } from "../components/Scenery";

const positionsOf = (players) =>
  players.reduce((acc, p) => ({ ...acc, [`${p.id}_position`]: p.position }), {});

const avatarsOf = (game) => ({
  player_avatar: game.player_avatar,
  cpu1_avatar: game.cpu1_avatar,
  cpu2_avatar: game.cpu2_avatar,
  cpu3_avatar: game.cpu3_avatar,
});

function ActiveGame({ game, serverId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = {
    characters: {
      player: game.player_avatar,
      cpu1: game.cpu1_avatar,
      cpu2: game.cpu2_avatar,
      cpu3: game.cpu3_avatar,
    },
    positions: {
      player: game.player_position,
      cpu1: game.cpu1_position,
      cpu2: game.cpu2_position,
      cpu3: game.cpu3_position,
    },
  };
  const { state, activePlayer, canRollNow, roll } = useGameEngine(config);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [muted, setMuted] = useState(sound.isMuted());
  const [toast, setToast] = useState(null);
  const lastSavedRound = useRef(state.round);
  const toastId = useRef(0);
  const gameIdRef = useRef(serverId || null);

  const showToast = (text, tone) => {
    const id = ++toastId.current;
    setToast({ id, text, tone });
    setTimeout(() => setToast((cur) => (cur && cur.id === id ? null : cur)), 1400);
  };

  // Dice rattle when a roll starts; announce a double-down.
  useEffect(() => {
    if (state.phase !== "rolling") return;
    sound.roll();
    if (state.dice.length === 2) {
      const name = getCharacter(activePlayer?.character).name;
      showToast(`${name} doubles down! −${DOUBLE_ROLL_COST} 🪙`, "move");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // Sounds + a floating toast when a tile resolves.
  useEffect(() => {
    const ev = state.lastEvent;
    if (!ev) return;
    const name = getCharacter(state.players.find((p) => p.id === ev.playerId)?.character).name;
    if (ev.finished) {
      sound.land();
    } else if (ev.coinDelta > 0) {
      sound.coin();
      showToast(`${name} +${ev.coinDelta}`, "coin");
    } else if (ev.coinDelta < 0) {
      sound.bad();
      showToast(`${name} ${ev.coinDelta}`, "bad");
    } else if (ev.moveDelta > 0) {
      sound.coin();
      showToast(`${name} leaps ${ev.moveDelta} ahead!`, "move");
    } else if (ev.moveDelta < 0) {
      sound.bad();
      showToast(`${name} slips back ${-ev.moveDelta}!`, "bad");
    } else {
      sound.land();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastEvent]);

  // Fanfare on the finish.
  useEffect(() => {
    if (state.phase === "over") sound.win();
  }, [state.phase]);

  // Persist: the local copy always; the API only for logged-in players.
  const save = async () => {
    const positions = positionsOf(state.players);
    if (!gameIdRef.current) writeLocalGame({ ...avatarsOf(game), ...positions });
    if (!user) return;
    setSaveState("saving");
    try {
      if (gameIdRef.current) {
        await api.updateGame(gameIdRef.current, positions);
      } else {
        const created = await api.createGame({ ...avatarsOf(game), ...positions });
        gameIdRef.current = created.id;
      }
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  // Auto-save at the end of each full round and when the race finishes.
  useEffect(() => {
    if (state.round !== lastSavedRound.current || state.phase === "over") {
      lastSavedRound.current = state.round;
      save();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.round, state.phase]);

  const saveAndExit = async () => {
    await save();
    navigate("/");
  };

  const activeName = getCharacter(activePlayer?.character).name;
  const rolling = state.phase === "rolling";
  const moving = state.phase === "moving";
  const human = state.players.find((p) => p.id === "player");
  const canDouble = canRollNow && human && human.coins >= DOUBLE_ROLL_COST;

  return (
    <div className="screen game">
      <header className="topbar">
        <div className="topbar__brand">
          <CastleLogo size={30} /> Castle Dash
        </div>
        <div className="topbar__right">
          <span className={"save-pill save-pill--" + saveState}>
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "Saved ✓"}
            {saveState === "error" && "Save failed"}
            {saveState === "idle" && `Round ${state.round}`}
          </span>
          <button
            className="icon-btn"
            onClick={() => setMuted(sound.toggle())}
            title={muted ? "Unmute" : "Mute"}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          {user ? (
            <button className="btn btn--ghost" onClick={saveAndExit}>
              Save &amp; exit
            </button>
          ) : (
            <>
              <button className="btn btn--ghost" onClick={() => navigate("/")}>
                Exit
              </button>
              <button className="btn btn--ghost" onClick={() => navigate("/login?next=/play")}>
                Log in to save
              </button>
            </>
          )}
        </div>
      </header>

      <div className="game__layout">
        <div className="game__board">
          <Board players={state.players} activeId={activePlayer?.id} />
          {toast && (
            <div className={"coin-toast coin-toast--" + toast.tone} key={toast.id}>
              {toast.tone === "coin" ? (
                <span className="coin-chip">{toast.text}</span>
              ) : (
                <span className="move-chip">{toast.text}</span>
              )}
            </div>
          )}
        </div>

        <aside className="game__side">
          <div className="card standings">
            <h3>Standings</h3>
            <ul>
              {rankPlayers(state.players).map((p, rank) => (
                <li
                  key={p.id}
                  className={
                    "standings__row" +
                    (p.id === activePlayer?.id ? " is-active" : "") +
                    (p.id === "player" ? " is-you" : "")
                  }
                >
                  <CharacterBadge character={p.character} size={30} />
                  <span className="standings__name">
                    {getCharacter(p.character).name}
                    {p.id === "player" && <em> (You)</em>}
                    {p.coins > 0 && <span className="standings__coins"> · {p.coins} 🪙</span>}
                  </span>
                  <span className="standings__pos">
                    {p.finished ? `🏁 ${rank + 1}` : `${p.position}/${FINISH}`}
                  </span>
                </li>
              ))}
            </ul>
            <p className="standings__hint">
              ⭐ pays 5 🪙 and ? boxes are a gamble. {DOUBLE_ROLL_COST} 🪙 buys a double roll!
            </p>
          </div>

          {state.phase !== "over" && (
            <div className="card turn-panel">
              <p className="turn-panel__who">
                {canRollNow
                  ? "Your turn!"
                  : moving
                  ? `${activeName} is on the move…`
                  : `${activeName} is ${rolling ? "rolling" : "up"}…`}
              </p>
              <Dice
                values={state.dice.length ? state.dice : [state.lastRoll || 1]}
                rolling={rolling}
                onRoll={() => roll(false)}
                disabled={!canRollNow}
                label={
                  canRollNow
                    ? "Tap to roll"
                    : rolling
                    ? "Rolling…"
                    : moving
                    ? "Moving…"
                    : `${activeName}'s turn`
                }
              />
              {canRollNow && (
                <button
                  className="btn btn--gold btn--sm turn-panel__double"
                  onClick={() => roll(true)}
                  disabled={!canDouble}
                  title={
                    canDouble
                      ? "Roll two dice and move the sum"
                      : `Needs ${DOUBLE_ROLL_COST} coins`
                  }
                >
                  🎲🎲 Double roll −{DOUBLE_ROLL_COST} 🪙
                </button>
              )}
            </div>
          )}
        </aside>
      </div>

      {state.phase === "over" && (
        <div className="overlay">
          <div className="card results-card">
            <Results
              players={state.players}
              onPlayAgain={() => navigate("/setup")}
              onExit={() => navigate("/")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function GameScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  // No id => a local (guest or unsaved) game from sessionStorage.
  const localGame = !id ? readLocalGame() : null;

  useEffect(() => {
    if (!id) return;
    api
      .getGame(id)
      .then(setGame)
      .catch((e) => setError(e.message));
  }, [id]);

  if (!id) {
    if (!localGame) return <Navigate to="/setup" replace />;
    return <ActiveGame game={localGame} serverId={null} />;
  }
  if (error) {
    return (
      <div className="screen center">
        <div className="card">
          <p className="form-error">{error}</p>
          <button className="btn btn--primary" onClick={() => navigate("/")}>
            Back to menu
          </button>
        </div>
      </div>
    );
  }
  if (!game) return <div className="screen center muted">Loading game…</div>;
  return <ActiveGame game={game} serverId={game.id} />;
}
