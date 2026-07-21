import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROSTER, randomCharacters, getCharacter } from "../data/characters";
import CharacterBadge from "../components/CharacterBadge";
import { CastleLogo } from "../components/Scenery";
import { LOCAL_GAME_KEY } from "../game/localGame";

export default function SetupScreen() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState("ember");

  const cpus = randomCharacters(3, [picked]);

  // Games start locally — no account needed. A server record is only created
  // when the player chooses to save.
  const start = () => {
    const rivals = randomCharacters(3, [picked]);
    const game = {
      player_avatar: picked,
      player_position: 0,
      cpu1_avatar: rivals[0],
      cpu1_position: 0,
      cpu2_avatar: rivals[1],
      cpu2_position: 0,
      cpu3_avatar: rivals[2],
      cpu3_position: 0,
    };
    sessionStorage.setItem(LOCAL_GAME_KEY, JSON.stringify(game));
    navigate("/play");
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
        <button className="btn btn--primary btn--big" onClick={start}>
          Start race 🏁
        </button>
      </div>
    </div>
  );
}
