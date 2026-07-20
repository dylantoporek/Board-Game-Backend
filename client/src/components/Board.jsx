import { COLUMNS, ROWS, SPACES } from "../data/board";
import CharacterBadge from "./CharacterBadge";

const TILE_ICON = { start: "🚩", finish: "🏰", star: "⭐", bonus: "❓" };

// Renders the serpentine trail and drops each player's token on its space.
export default function Board({ players, activeId }) {
  return (
    <div
      className="board"
      style={{ "--cols": COLUMNS, "--rows": ROWS }}
      role="img"
      aria-label="Game board: a trail of spaces leading to the castle"
    >
      {SPACES.map((space) => {
        const here = players.filter((p) => p.position === space.index);
        return (
          <div
            key={space.index}
            className={`tile tile--${space.type}`}
            style={{ gridColumn: space.col + 1, gridRow: space.row + 1 }}
          >
            <span className="tile__num">{space.index}</span>
            {TILE_ICON[space.type] && <span className="tile__icon">{TILE_ICON[space.type]}</span>}
            {here.length > 0 && (
              <div className={"tile__tokens" + (here.length > 1 ? " is-crowded" : "")}>
                {here.map((p) => (
                  <CharacterBadge
                    key={p.id}
                    character={p.character}
                    size={here.length > 2 ? 24 : 30}
                    showEmoji={false}
                    active={p.id === activeId}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
