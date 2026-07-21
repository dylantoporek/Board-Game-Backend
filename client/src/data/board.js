// A procedurally generated board — no static image. The trail climbs from the
// bottom-left (space 0, furthest from the goal) and snakes upward, ending at
// the top-center tile that sits right at the castle gate — so the final step
// walks you straight into the castle.

export const COLUMNS = 7;
export const ROWS = 5;

const range = (from, to) => {
  const out = [];
  const step = from <= to ? 1 : -1;
  for (let i = from; i !== to + step; i += step) out.push(i);
  return out;
};

function buildPath() {
  const cells = [];
  let leftToRight = true;
  // Full serpentine rows from the bottom (ROWS-1) up to row 1.
  for (let row = ROWS - 1; row >= 1; row--) {
    for (const col of leftToRight ? range(0, COLUMNS - 1) : range(COLUMNS - 1, 0)) {
      cells.push({ row, col });
    }
    leftToRight = !leftToRight;
  }
  // Top row: approach from the left edge in to the center, under the castle.
  const center = Math.floor(COLUMNS / 2);
  for (const col of range(0, center)) cells.push({ row: 0, col });
  return cells;
}

const PATH = buildPath();
export const SPACE_COUNT = PATH.length; // 32
export const FINISH = SPACE_COUNT - 1;

// The grid cell of the finish tile, so the castle can be centered above it.
export const FINISH_CELL = PATH[FINISH];

function spaceType(i) {
  if (i === 0) return "start";
  if (i === FINISH) return "finish";
  if (i % 7 === 0) return "star";
  if (i % 5 === 0) return "bonus";
  return "normal";
}

export const SPACES = PATH.map((cell, i) => ({
  index: i,
  row: cell.row,
  col: cell.col,
  type: spaceType(i),
}));
