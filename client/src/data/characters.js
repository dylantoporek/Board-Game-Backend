// The Castle Dash cast — original characters with hand-drawn pixel sprites
// (see sprites.js). Colors double as each racer's team color in the UI.

import { SPRITES } from "./sprites";

export const CHARACTERS = {
  ember: { key: "ember", name: "Ember", color: "#E4342B", ink: "#fff", initial: "E" },
  sprout: { key: "sprout", name: "Sprout", color: "#2FA84F", ink: "#fff", initial: "S" },
  blossom: { key: "blossom", name: "Blossom", color: "#F27DA6", ink: "#fff", initial: "B" },
  dot: { key: "dot", name: "Dot", color: "#4FA3E3", ink: "#fff", initial: "D" },
  chomp: { key: "chomp", name: "Chomp", color: "#7DBE3C", ink: "#fff", initial: "C" },
  drake: { key: "drake", name: "Drake", color: "#EF7D22", ink: "#fff", initial: "D" },
  bolt: { key: "bolt", name: "Bolt", color: "#F4C430", ink: "#3a2d00", initial: "B" },
  wisp: { key: "wisp", name: "Wisp", color: "#9B59B6", ink: "#fff", initial: "W" },
};

// Saved games from the previous version stored the old avatar keys; map them
// onto the new cast so old save files still load.
const LEGACY_KEYS = {
  mario: "ember",
  luigi: "sprout",
  peach: "blossom",
  toad: "dot",
  yoshi: "chomp",
  bowser: "drake",
  wario: "bolt",
  daisy: "wisp",
};

export const ROSTER = Object.values(CHARACTERS);

export const getCharacter = (key) =>
  CHARACTERS[key] || CHARACTERS[LEGACY_KEYS[key]] || CHARACTERS.ember;

export const getSprite = (key) => SPRITES[getCharacter(key).key];

// Pick `count` distinct characters at random, excluding the given keys.
export function randomCharacters(count, exclude = []) {
  const excluded = exclude.map((k) => getCharacter(k).key);
  const pool = ROSTER.filter((c) => !excluded.includes(c.key));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((c) => c.key);
}
