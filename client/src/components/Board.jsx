import { COLUMNS, ROWS, SPACES } from "../data/board";
import CharacterBadge from "./CharacterBadge";
import {
  Bush,
  Castle,
  Cloud,
  Firefly,
  Flower,
  FlagIcon,
  CastleIcon,
  StarIcon,
  QBlockIcon,
  Sun,
  Tree,
} from "./Scenery";

const TILE_ICON = {
  start: FlagIcon,
  finish: CastleIcon,
  star: StarIcon,
  bonus: QBlockIcon,
};

const FIREFLIES = Array.from({ length: 7 }, (_, i) => ({
  left: `${8 + i * 12}%`,
  top: `${20 + ((i * 37) % 60)}%`,
  delay: `${(i * 0.7).toFixed(1)}s`,
  dur: `${(4 + (i % 3)).toFixed(1)}s`,
}));

// Renders the diorama (sky, scenery) and the serpentine trail, and drops each
// player's token on its space.
export default function Board({ players, activeId }) {
  return (
    <div className="board-scene">
      <div className="scene scene--back" aria-hidden="true">
        <Sun className="scene-sun" />
        <Cloud className="cloud cloud--1" />
        <Cloud className="cloud cloud--2" />
        <Cloud className="cloud cloud--3" />
        <Castle className="scene-castle" />
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
        style={{ "--cols": COLUMNS, "--rows": ROWS }}
        role="img"
        aria-label="Game board: a trail of spaces leading to the castle"
      >
        {SPACES.map((space) => {
          const here = players.filter((p) => p.position === space.index);
          const Icon = TILE_ICON[space.type];
          return (
            <div
              key={space.index}
              className={`tile tile--${space.type}`}
              style={{ gridColumn: space.col + 1, gridRow: space.row + 1 }}
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
                      showEmoji={false}
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
