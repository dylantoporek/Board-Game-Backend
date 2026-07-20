// Self-contained inline-SVG scenery so the board reads as a little living
// diorama — no external image files to load or break.

export function Cloud({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 56" width="120" height="56" aria-hidden="true">
      <g fill="#ffffff">
        <ellipse cx="38" cy="34" rx="30" ry="20" />
        <ellipse cx="66" cy="26" rx="26" ry="22" />
        <ellipse cx="90" cy="36" rx="24" ry="18" />
        <rect x="18" y="36" width="86" height="16" rx="8" />
      </g>
      <g fill="#eaf3ff">
        <ellipse cx="90" cy="40" rx="20" ry="10" />
      </g>
    </svg>
  );
}

export function Sun({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" width="86" height="86" aria-hidden="true">
      <g stroke="#ffd54a" strokeWidth="6" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * 34}
              y1={50 + Math.sin(a) * 34}
              x2={50 + Math.cos(a) * 46}
              y2={50 + Math.sin(a) * 46}
            />
          );
        })}
      </g>
      <circle cx="50" cy="50" r="30" fill="#ffe066" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#ffcf33" strokeWidth="3" />
    </svg>
  );
}

export function Tree({ className }) {
  return (
    <svg className={className} viewBox="0 0 80 100" width="72" height="90" aria-hidden="true">
      <rect x="34" y="60" width="12" height="34" rx="4" fill="#9c6b3f" />
      <circle cx="40" cy="40" r="26" fill="#3f9b4a" />
      <circle cx="22" cy="52" r="18" fill="#348a3f" />
      <circle cx="58" cy="52" r="18" fill="#4aa956" />
      <circle cx="40" cy="30" r="16" fill="#54b761" />
      <circle cx="32" cy="36" r="4" fill="#ffffff55" />
    </svg>
  );
}

export function Bush({ className }) {
  return (
    <svg className={className} viewBox="0 0 90 50" width="84" height="46" aria-hidden="true">
      <g fill="#3f9b4a">
        <circle cx="22" cy="34" r="18" />
        <circle cx="45" cy="26" r="22" />
        <circle cx="68" cy="34" r="18" />
        <rect x="8" y="34" width="74" height="16" rx="8" />
      </g>
      <circle cx="45" cy="22" r="5" fill="#54b76155" />
    </svg>
  );
}

export function Flower({ className, color = "#f27da6" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">
      <g fill={color}>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 * Math.PI) / 180;
          return <circle key={i} cx={20 + Math.cos(a) * 10} cy={20 + Math.sin(a) * 10} r="7" />;
        })}
      </g>
      <circle cx="20" cy="20" r="6" fill="#ffe066" />
    </svg>
  );
}

export function Castle({ className, hill = true }) {
  return (
    <svg className={className} viewBox="0 0 160 150" width="150" height="140" aria-hidden="true">
      {/* hill */}
      {hill && <ellipse cx="80" cy="150" rx="95" ry="30" fill="#4aa956" />}
      {/* towers */}
      <g fill="#d9c7a3">
        <rect x="26" y="60" width="26" height="82" />
        <rect x="108" y="60" width="26" height="82" />
        <rect x="58" y="46" width="44" height="96" />
      </g>
      {/* battlements */}
      <g fill="#c9b48c">
        <rect x="26" y="56" width="26" height="8" />
        <rect x="108" y="56" width="26" height="8" />
        <rect x="58" y="42" width="44" height="8" />
      </g>
      {/* roofs */}
      <polygon points="39,60 24,42 54,42" fill="#e4342b" />
      <polygon points="121,60 106,42 136,42" fill="#e4342b" />
      <polygon points="80,46 56,20 104,20" fill="#e4342b" />
      {/* door + windows */}
      <path d="M70 142 v-26 a10 10 0 0 1 20 0 v26 z" fill="#7a5a86" />
      <rect x="34" y="80" width="10" height="16" rx="4" fill="#7a5a86" />
      <rect x="116" y="80" width="10" height="16" rx="4" fill="#7a5a86" />
      {/* flag */}
      <line x1="80" y1="20" x2="80" y2="2" stroke="#8a6d3b" strokeWidth="3" />
      <polygon className="castle-flag" points="80,3 100,9 80,15" fill="#2b7fd4" />
    </svg>
  );
}

export function Firefly({ style }) {
  return <span className="firefly" style={style} aria-hidden="true" />;
}

/* ---------- tile icons ---------- */

export function FlagIcon() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <line x1="8" y1="4" x2="8" y2="30" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
      <path className="tile-flag" d="M8 5 h16 l-4 5 l4 5 h-16 z" fill="#e4342b" />
    </svg>
  );
}

// The finish tile: a castle gate / archway the token walks through.
export function GateIcon() {
  return (
    <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
      <rect x="5" y="9" width="22" height="20" rx="2" fill="#d9c7a3" />
      <path d="M5 9 h4 v-3 h3 v3 h8 v-3 h3 v3 h4 v3 h-22 z" fill="#c9b48c" />
      <path d="M11 29 v-9 a5 5 0 0 1 10 0 v9 z" fill="#6a4a76" />
      <path d="M13 29 v-8 a3 3 0 0 1 6 0 v8" fill="none" stroke="#ffd23f" strokeWidth="1.4" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg className="tile-star" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <polygon
        points="16,2 20,12 31,12 22,19 25,30 16,23 7,30 10,19 1,12 12,12"
        fill="#ffd23f"
        stroke="#e6a700"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QBlockIcon() {
  return (
    <svg className="tile-qblock" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#f4b400" stroke="#c98a00" strokeWidth="2" />
      <g fill="#fff">
        <circle cx="7" cy="7" r="1.6" />
        <circle cx="25" cy="7" r="1.6" />
        <circle cx="7" cy="25" r="1.6" />
        <circle cx="25" cy="25" r="1.6" />
      </g>
      <text x="16" y="23" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">?</text>
    </svg>
  );
}
