// A procedurally generated board — no static image. Spaces snake back and
// forth (serpentine) across a grid, from the START flag to the CASTLE.

export const COLUMNS = 8;
export const ROWS = 4;
export const SPACE_COUNT = COLUMNS * ROWS; // 32
export const FINISH = SPACE_COUNT - 1;

function spaceType(i) {
  if (i === 0) return "start";
  if (i === FINISH) return "finish";
  if (i % 7 === 0) return "star";
  if (i % 5 === 0) return "bonus";
  return "normal";
}

// Each space knows its grid cell so the board can lay itself out, and its
// type so tiles can be decorated.
export const SPACES = Array.from({ length: SPACE_COUNT }, (_, i) => {
  const row = Math.floor(i / COLUMNS);
  const within = i % COLUMNS;
  const col = row % 2 === 0 ? within : COLUMNS - 1 - within; // boustrophedon
  return { index: i, row, col, type: spaceType(i) };
});
