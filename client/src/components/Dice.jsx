import { useEffect, useState } from "react";

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, rolling, onClick, disabled, small }) {
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
    <button
      type="button"
      className={"die" + (rolling ? " die--rolling" : "") + (small ? " die--small" : "")}
      onClick={onClick}
      disabled={disabled || rolling || !onClick}
      aria-label={onClick && !disabled ? "Roll the dice" : "Die"}
    >
      <span className="die__grid">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={"die__pip" + (pips.includes(i) ? " is-on" : "")} />
        ))}
      </span>
    </button>
  );
}

// One tappable die, plus a second die that appears for a double roll.
export default function Dice({ values, rolling, onRoll, disabled, label }) {
  const two = values.length === 2;
  return (
    <div className="dice-area">
      <div className={"dice-row" + (two ? " dice-row--double" : "")}>
        <Die value={values[0]} rolling={rolling} onClick={onRoll} disabled={disabled} small={two} />
        {two && <Die value={values[1]} rolling={rolling} disabled small />}
      </div>
      <div className="dice-area__label">{label}</div>
    </div>
  );
}
