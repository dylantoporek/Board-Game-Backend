// Original pixel-art sprites for the Castle Dash cast. Each is a 12x12 grid;
// "." is transparent, other chars index into the palette. Hand-drawn for this
// project, so the art is fully owned — nothing borrowed.

export const SPRITES = {
  ember: {
    // a cheery little flame
    palette: { r: "#e4342b", o: "#ff8f4d", y: "#ffd23f", k: "#33202a", m: "#b8241d" },
    grid: [
      ".....rr.....",
      ".....rr.....",
      "....rrrr....",
      "....rrrr....",
      "...rrrrrr...",
      "..rrrrrrrr..",
      ".rrroooorrr.",
      ".rrokoookrr.",
      ".rroooooorr.",
      ".rroommoorr.",
      "..rryyyyrr..",
      "...rryyrr...",
    ],
  },
  sprout: {
    // a seedling with a fresh leaf
    palette: { g: "#2fa84f", l: "#7dbe3c", s: "#9c6b3f", k: "#1f3320", m: "#1f8a3d" },
    grid: [
      "....ll......",
      "...llll.....",
      "....ss......",
      "..llllllll..",
      ".gggggggggg.",
      ".ggkggggkgg.",
      ".gggggggggg.",
      ".ggggmmgggg.",
      ".gggggggggg.",
      "..gggggggg..",
      "...gggggg...",
      "............",
    ],
  },
  blossom: {
    // a flower fairy with a sunny face
    palette: { p: "#f27da6", y: "#ffd23f", k: "#5a3a1a", m: "#e08a00", g: "#2fa84f" },
    grid: [
      "....pppp....",
      "..pppppppp..",
      ".pppyyyyppp.",
      ".ppyyyyyypp.",
      ".ppykyykypp.",
      ".ppyyyyyypp.",
      ".ppyymmyypp.",
      ".pppyyyyppp.",
      "..pppppppp..",
      "....pppp....",
      ".....gg.....",
      "....gggg....",
    ],
  },
  dot: {
    // a bouncy slime
    palette: { b: "#4fa3e3", d: "#2b7fd4", k: "#132c44", w: "#dff0ff", m: "#1d5fa8" },
    grid: [
      "............",
      "....bbbb....",
      "..bbbbbbbb..",
      ".bbwbbbbbbb.",
      ".bbbbbbbbbb.",
      "bbbkbbbbkbbb",
      "bbbbbbbbbbbb",
      "bbbbbmmbbbbb",
      "bbbbbbbbbbbb",
      "bbbbbbbbbbbb",
      ".bdbbddbbdb.",
      "............",
    ],
  },
  chomp: {
    // a wide-eyed frog
    palette: { f: "#7dbe3c", d: "#5a9e2e", k: "#1c3311", w: "#ffffff" },
    grid: [
      ".ff......ff.",
      "fwwf....fwwf",
      "fwkwf..fwkwf",
      ".ffffffffff.",
      "ffffffffffff",
      "ffffffffffff",
      "ffddddddddff",
      "ffffffffffff",
      ".ffffffffff.",
      "..ffffffff..",
      "..ff....ff..",
      ".fff....fff.",
    ],
  },
  drake: {
    // a stubby dragon with horns
    palette: { D: "#ef7d22", c: "#f8c789", h: "#b85a10", k: "#3a1c05" },
    grid: [
      ".h........h.",
      ".hh......hh.",
      "..DDDDDDDD..",
      ".DDDDDDDDDD.",
      ".DDkDDDDkDD.",
      ".DDDDDDDDDD.",
      "DDDccccccDDD",
      "DDccccccccDD",
      ".DDDDDDDDDD.",
      "..DDDDDDDD..",
      "..DD....DD..",
      "..DD....DD..",
    ],
  },
  bolt: {
    // a plucky robot
    palette: { s: "#c9d1d9", d: "#8b98a5", y: "#f4c430", k: "#20262c" },
    grid: [
      ".....yy.....",
      ".....ss.....",
      "..ssssssss..",
      ".ssssssssss.",
      ".sskkssskks.",
      ".ssssssssss.",
      ".ssyyyyyyss.",
      "..ssssssss..",
      "..dddddddd..",
      "..dddddddd..",
      "..dd....dd..",
      "..dd....dd..",
    ],
  },
  wisp: {
    // a friendly ghost
    palette: { v: "#9b59b6", L: "#b07cc6", k: "#2c1240", w: "#f3e8fa", m: "#6d3591" },
    grid: [
      "....vvvv....",
      "..vvvvvvvv..",
      ".vvLvvvvvvv.",
      ".vwwvvvvwwv.",
      ".vwkvvvvwkv.",
      ".vvvvvvvvvv.",
      ".vvvvmmvvvv.",
      ".vvvvvvvvvv.",
      ".vvvvvvvvvv.",
      ".vvvvvvvvvv.",
      "vv.vv..vv.vv",
      "............",
    ],
  },
};
