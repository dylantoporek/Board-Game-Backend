import { getCharacter } from "../data/characters";

// A round character token: colored disc, initial, and a little emoji accent.
export default function CharacterBadge({ character, size = 48, showEmoji = true, active = false }) {
  const c = getCharacter(typeof character === "string" ? character : character?.key);
  return (
    <span
      className={"badge" + (active ? " badge--active" : "")}
      style={{
        "--badge-color": c.color,
        "--badge-ink": c.ink,
        width: size,
        height: size,
        fontSize: size * 0.44,
      }}
      title={c.name}
    >
      <span className="badge__initial">{c.initial}</span>
      {showEmoji && (
        <span className="badge__emoji" style={{ fontSize: size * 0.34 }}>
          {c.emoji}
        </span>
      )}
    </span>
  );
}
