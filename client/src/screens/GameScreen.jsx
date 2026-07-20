import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { FINISH } from "../data/board";
import { getCharacter } from "../data/characters";
import { useGameEngine } from "../hooks/useGameEngine";
import { sound } from "../game/sound";
import Board from "../components/Board";
import Dice from "../components/Dice";
import Results from "../components/Results";
import CharacterBadge from "../components/CharacterBadge";

const positionsOf = (players) =>
  players.reduce((acc, p) => ({ ...acc, [`${p.id}_position`]: p.position }), {});

function ActiveGame({ game }) {
  const navigate = useNavigate();
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

  // Dice rattle when a roll starts.
  useEffect(() => {
    if (state.phase === "rolling") sound.roll();
  }, [state.phase]);

  // Step / coin sounds + a floating "+N coins" toast after each move.
  useEffect(() => {
    const ev = state.lastEvent;
    if (!ev) return undefined;
    if (ev.finished) {
      sound.land();
    } else if (ev.coins > 0) {
      sound.coin();
      const name = getCharacter(state.players.find((p) => p.id === ev.playerId)?.character).name;
      const id = ++toastId.current;
      setToast({ id, text: `${name} +${ev.coins}` });
      const t = setTimeout(() => setToast((cur) => (cur && cur.id === id ? null : cur)), 1400);
      return () => clearTimeout(t);
    } else {
      sound.land();
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastEvent]);

  // Fanfare on the finish.
  useEffect(() => {
    if (state.phase === "over") sound.win();
  }, [state.phase]);

  const save = async () => {
    setSaveState("saving");
    try {
      await api.updateGame(game.id, positionsOf(state.players));
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

  return (
    <div className="screen game">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="logo__star">★</span> Nintendo Land
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
          <button className="btn btn--ghost" onClick={saveAndExit}>
            Save &amp; exit
          </button>
        </div>
      </header>

      <div className="game__layout">
        <div className="game__board">
          <Board players={state.players} activeId={activePlayer?.id} />
          {toast && (
            <div className="coin-toast" key={toast.id}>
              <span className="coin-chip">{toast.text}</span>
            </div>
          )}
        </div>

        <aside className="game__side">
          <div className="card standings">
            <h3>Standings</h3>
            <ul>
              {[...state.players]
                .sort((a, b) => b.position - a.position)
                .map((p) => (
                  <li
                    key={p.id}
                    className={
                      "standings__row" +
                      (p.id === activePlayer?.id ? " is-active" : "") +
                      (p.id === "player" ? " is-you" : "")
                    }
                  >
                    <CharacterBadge character={p.character} size={30} showEmoji={false} />
                    <span className="standings__name">
                      {getCharacter(p.character).name}
                      {p.id === "player" && <em> (You)</em>}
                      {p.coins > 0 && <span className="standings__coins"> · {p.coins} 🪙</span>}
                    </span>
                    <span className="standings__pos">
                      {p.finished ? `🏁 ${p.place}` : `${p.position}/${FINISH}`}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          {state.phase !== "over" && (
            <div className="card turn-panel">
              <p className="turn-panel__who">
                {canRollNow ? "Your turn!" : `${activeName} is ${rolling ? "rolling" : "up"}…`}
              </p>
              <Dice
                value={state.lastRoll}
                rolling={rolling}
                onRoll={roll}
                disabled={!canRollNow}
                label={
                  canRollNow
                    ? "Tap to roll"
                    : rolling
                    ? "Rolling…"
                    : `${activeName}'s turn`
                }
              />
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

  useEffect(() => {
    api
      .getGame(id)
      .then(setGame)
      .catch((e) => setError(e.message));
  }, [id]);

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
  return <ActiveGame game={game} />;
}
