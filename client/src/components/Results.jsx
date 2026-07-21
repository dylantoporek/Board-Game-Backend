import { getCharacter } from "../data/characters";
import { rankPlayers } from "../game/engine";
import CharacterBadge from "./CharacterBadge";
import Confetti from "./Confetti";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "🎗️" };
const PLACE_LABEL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

// Final podium, in arrival order at the castle.
export default function Results({ players, onPlayAgain, onExit }) {
  const ranked = rankPlayers(players);
  const winner = ranked[0];
  const youWon = winner && winner.id === "player";

  return (
    <div className="results">
      {youWon && <Confetti />}
      <h2 className="results__title">{youWon ? "You win! 🎉" : "Race over!"}</h2>
      <p className="results__sub">
        {getCharacter(winner.character).name} reached the castle first.
      </p>
      <ol className="podium">
        {ranked.map((p, rank) => (
          <li key={p.id} className={"podium__row" + (p.id === "player" ? " is-you" : "")}>
            <span className="podium__place">
              {MEDALS[rank + 1]} {PLACE_LABEL[rank + 1]}
            </span>
            <CharacterBadge character={p.character} size={40} />
            <span className="podium__name">
              {getCharacter(p.character).name}
              {p.id === "player" && <span className="podium__you">You</span>}
            </span>
            <span className="podium__coins">{p.coins} 🪙</span>
          </li>
        ))}
      </ol>
      <div className="results__actions">
        <button className="btn btn--primary" onClick={onPlayAgain}>
          Play again
        </button>
        <button className="btn" onClick={onExit}>
          Back to menu
        </button>
      </div>
    </div>
  );
}
