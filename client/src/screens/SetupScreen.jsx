import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { ROSTER, randomCharacters, getCharacter } from "../data/characters";
import CharacterBadge from "../components/CharacterBadge";
import { CastleLogo } from "../components/Scenery";

export default function SetupScreen() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState("ember");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const cpus = randomCharacters(3, [picked]);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      // CPUs are chosen fresh at creation so the saved record is fully seeded.
      const rivals = randomCharacters(3, [picked]);
      const game = await api.createGame({
        player_avatar: picked,
        player_position: 0,
        cpu1_avatar: rivals[0],
        cpu1_position: 0,
        cpu2_avatar: rivals[1],
        cpu2_position: 0,
        cpu3_avatar: rivals[2],
        cpu3_position: 0,
      });
      navigate(`/play/${game.id}`, { replace: true });
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="screen setup">
      <header className="topbar">
        <div className="topbar__brand">
          <CastleLogo size={30} /> Choose your character
        </div>
        <button className="btn btn--ghost" onClick={() => navigate("/")}>
          Cancel
        </button>
      </header>

      <div className="roster">
        {ROSTER.map((c) => (
          <button
            key={c.key}
            className={"roster__pick" + (picked === c.key ? " is-picked" : "")}
            onClick={() => setPicked(c.key)}
            type="button"
          >
            <CharacterBadge character={c.key} size={64} />
            <span className="roster__name">{c.name}</span>
          </button>
        ))}
      </div>

      <div className="card setup__summary">
        <div className="setup__you">
          <span className="muted">You play as</span>
          <div className="setup__chosen">
            <CharacterBadge character={picked} size={52} />
            <strong>{getCharacter(picked).name}</strong>
          </div>
        </div>
        <div className="setup__vs">
          <span className="muted">Against 3 CPU rivals</span>
          <div className="setup__rivals">
            {cpus.map((k) => (
              <CharacterBadge key={k} character={k} size={34} />
            ))}
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn--primary btn--big" onClick={start} disabled={busy}>
          {busy ? "Setting up…" : "Start race 🏁"}
        </button>
      </div>
    </div>
  );
}
