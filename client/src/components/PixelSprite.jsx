// Renders a pixel-art matrix (array of equal-length strings, one char per
// pixel, "." = transparent) as crisp SVG rects. All sprites are original
// art defined in src/data/sprites.js — no image files, no licensing worries.

// Bare rects for composing into a larger SVG scene (logo frames, scenery).
export function PixelRects({ sprite }) {
  const { grid, palette } = sprite;
  return grid.flatMap((row, y) =>
    [...row].map((ch, x) => {
      const fill = palette[ch];
      if (!fill) return null;
      return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />;
    })
  );
}

export default function PixelSprite({ sprite, size = 32, className }) {
  const rows = sprite.grid.length;
  const cols = sprite.grid[0].length;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={Math.round((size * rows) / cols)}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <PixelRects sprite={sprite} />
    </svg>
  );
}
