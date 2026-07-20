const COLORS = ["#e4342b", "#2fa84f", "#2b7fd4", "#f4c430", "#f27da6", "#9b59b6", "#ff8f4d"];

// Lightweight DOM confetti burst — a fixed set of pieces with randomized
// position, color, and timing, animated by CSS. Rendered on the win screen.
const PIECES = Array.from({ length: 60 }, (_, i) => ({
  left: Math.random() * 100,
  color: COLORS[i % COLORS.length],
  delay: Math.random() * 0.6,
  dur: 1.8 + Math.random() * 1.6,
  size: 6 + Math.random() * 8,
  rot: Math.random() * 360,
  round: Math.random() > 0.5,
}));

export default function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti__bit"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            "--rot": `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}
