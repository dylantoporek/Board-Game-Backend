import { COLUMNS, ROWS, SPACES } from "../data/board";
import CharacterBadge from "./CharacterBadge";
import {
  Bush,
  Castle,
  Cloud,
  Firefly,
  Flower,
  FlagIcon,
  GateIcon,
  StarIcon,
  QBlockIcon,
  Sun,
  Tree,
} from "./Scenery";

const TILE_ICON = {
  start: FlagIcon,
  finish: GateIcon,
  star: StarIcon,
  bonus: QBlockIcon,
};

const FIREFLIES = Array.from({ length: 7 }, (_, i) => ({
  left: `${8 + i * 12}%`,
  top: `${30 + ((i * 37) % 55)}%`,
  delay: `${(i * 0.7).toFixed(1)}s`,
  dur: `${(4 + (i % 3)).toFixed(1)}s`,
}));

// Where the trail turns between rows: consecutive spaces on different rows
// share a column, and a short connector path is drawn in the gap row between
// them so the board reads as one winding snake.
const CONNECTORS = SPACES.slice(1).flatMap((space, i) => {
  const prev = SPACES[i];
  if (prev.row === space.row) return [];
  return [{ col: space.col, gapAbove: Math.min(prev.row, space.row) }];
});

// Renders the diorama (sky, scenery, castle goal) and the climbing trail, and
// drops each player's token on its space. The castle sits above the top-center
// finish tile, so the final step walks the token into the gate. Path rows sit
// on alternating grid rows with connector gaps between them.
export default function Board({ players, activeId }) {
  return (
    <div className="board-scene" style={{ "--cols": COLUMNS, "--rows": ROWS }}>
      <div className="scene scene--back" aria-hidden="true">
        <Sun className="scene-sun" />
        <Cloud className="cloud cloud--1" />
        <Cloud className="cloud cloud--2" />
        <Cloud className="cloud cloud--3" />
        <div className="scene-hill" />
        <Castle className="scene-castle" width={132} />
        <Tree className="scene-tree scene-tree--l" />
        <Tree className="scene-tree scene-tree--r" />
        <Bush className="scene-bush scene-bush--l" />
        <Bush className="scene-bush scene-bush--r" />
        <Flower className="scene-flower scene-flower--1" color="#f27da6" />
        <Flower className="scene-flower scene-flower--2" color="#ffd23f" />
        <Flower className="scene-flower scene-flower--3" color="#ff8f4d" />
      </div>

      <div
        className="board"
        role="img"
        aria-label="Game board: a trail climbing from the bottom-left up to the castle"
        style={{ gridTemplateRows: `repeat(${ROWS * 2 - 1}, auto)` }}
      >
        {CONNECTORS.map((c, i) => (
          <div
            key={`link-${i}`}
            className="path-link"
            style={{ gridColumn: c.col + 1, gridRow: c.gapAbove * 2 + 2 }}
          />
        ))}
        {SPACES.map((space) => {
          const here = players.filter((p) => p.position === space.index);
          const Icon = TILE_ICON[space.type];
          return (
            <div
              key={space.index}
              className={`tile tile--${space.type}`}
              style={{ gridColumn: space.col + 1, gridRow: space.row * 2 + 1 }}
            >
              <span className="tile__num">{space.index}</span>
              {Icon && (
                <span className="tile__icon">
                  <Icon />
                </span>
              )}
              {here.length > 0 && (
                <div className={"tile__tokens" + (here.length > 1 ? " is-crowded" : "")}>
                  {here.map((p, i) => (
                    <CharacterBadge
                      key={p.id}
                      character={p.character}
                      size={here.length > 2 ? 24 : 30}
                     
                      active={p.id === activeId}
                      idleDelay={p.id === activeId ? 0 : i * 0.25 + 0.1}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="scene scene--front" aria-hidden="true">
        {FIREFLIES.map((f, i) => (
          <Firefly
            key={i}
            style={{ left: f.left, top: f.top, animationDelay: f.delay, animationDuration: f.dur }}
          />
        ))}
      </div>
    </div>
  );
}
