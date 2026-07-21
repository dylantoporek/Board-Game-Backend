import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { FINISH } from "../data/board";
import { getCharacter } from "../data/characters";
import CharacterBadge from "../components/CharacterBadge";

export default function LobbyScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    api
      .listGames()
      .then(setGames)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const remove = async (id) => {
    try {
      await api.deleteGame(id);
      setGames((gs) => gs.filter((g) => g.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const progress = (game) => {
    const positions = [
      game.player_position,
      game.cpu1_position,
      game.cpu2_position,
      game.cpu3_position,
    ];
    const done = positions.filter((p) => p >= FINISH).length;
    const lead = Math.max(...positions);
    if (done >= 4) return "Finished";
    return `Turn leader on space ${lead} / ${FINISH}`;
  };

  return (
    <div className="screen lobby">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="logo__star">★</span> Castle Dash
        </div>
        <div className="topbar__right">
          <span className="topbar__user">Hi, {user?.username}</span>
          <button className="btn btn--ghost" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <div className="lobby__cta">
        <button className="btn btn--primary btn--big" onClick={() => navigate("/setup")}>
          🎲 New Game
        </button>
      </div>

      <section className="card lobby__saves">
        <div className="section-head">
          <h2>Saved games</h2>
          <button className="btn btn--ghost btn--sm" onClick={load}>
            Refresh
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}
        {games === null && !error && <p className="muted">Loading…</p>}
        {games && games.length === 0 && (
          <p className="muted">No saved games yet — start a new one above!</p>
        )}

        <ul className="save-list">
          {games?.map((game) => (
            <li key={game.id} className="save-row">
              <CharacterBadge character={game.player_avatar} size={44} />
              <div className="save-row__info">
                <strong>{getCharacter(game.player_avatar).name}</strong>
                <span className="muted">{progress(game)}</span>
              </div>
              <div className="save-row__vs">
                {[game.cpu1_avatar, game.cpu2_avatar, game.cpu3_avatar].map((a, i) => (
                  <CharacterBadge key={i} character={a} size={26} />
                ))}
              </div>
              <div className="save-row__actions">
                <button className="btn btn--primary btn--sm" onClick={() => navigate(`/play/${game.id}`)}>
                  Load
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => remove(game.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
