import { useEffect, useState } from "react";

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// A die face with nine pip slots. While `rolling`, it shakes and flickers
// through random faces before settling on `value`.
export default function Dice({ value, rolling, onRoll, disabled, label }) {
  const [face, setFace] = useState(value || 1);

  useEffect(() => {
    if (rolling) {
      const iv = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 90);
      return () => clearInterval(iv);
    }
    if (value) setFace(value);
    return undefined;
  }, [rolling, value]);

  const pips = PIPS[face] || [];

  return (
    <div className="dice-area">
      <button
        type="button"
        className={"die" + (rolling ? " die--rolling" : "")}
        onClick={onRoll}
        disabled={disabled || rolling}
        aria-label={disabled ? "Waiting" : "Roll the dice"}
      >
        <span className="die__grid">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={"die__pip" + (pips.includes(i) ? " is-on" : "")} />
          ))}
        </span>
      </button>
      <div className="dice-area__label">{label}</div>
    </div>
  );
}
