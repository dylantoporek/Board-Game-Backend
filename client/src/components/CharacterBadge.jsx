import { getCharacter, getSprite } from "../data/characters";
import PixelSprite from "./PixelSprite";

// A round character token: team-colored disc with the character's pixel
// sprite on top. `active` hops, `idleDelay` gives resting tokens a soft bob.
export default function CharacterBadge({ character, size = 48, active = false, idleDelay = null }) {
  const key = typeof character === "string" ? character : character?.key;
  const c = getCharacter(key);
  const sprite = getSprite(key);
  return (
    <span
      className={"badge" + (active ? " badge--active" : idleDelay != null ? " badge--idle" : "")}
      style={{
        "--badge-color": c.color,
        "--badge-ink": c.ink,
        width: size,
        height: size,
        animationDelay: idleDelay != null ? `${idleDelay}s` : undefined,
      }}
      title={c.name}
    >
      <PixelSprite sprite={sprite} size={Math.round(size * 0.78)} className="badge__sprite" />
    </span>
  );
}
