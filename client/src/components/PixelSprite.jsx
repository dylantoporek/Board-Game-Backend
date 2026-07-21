// Renders a pixel-art matrix (array of equal-length strings, one char per
// pixel, "." = transparent) as crisp SVG rects. All sprites are original
// art defined in src/data/sprites.js — no image files, no licensing worries.
export default function PixelSprite({ sprite, size = 32, className }) {
  const { grid, palette } = sprite;
  const rows = grid.length;
  const cols = grid[0].length;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = palette[ch];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />;
        })
      )}
    </svg>
  );
}
