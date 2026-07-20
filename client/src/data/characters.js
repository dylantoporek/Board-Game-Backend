// The playable roster. Tokens are drawn purely from a color + initial + emoji
// accent (no copyrighted artwork), keeping the Mario Party spirit.

export const CHARACTERS = {
  mario: { key: "mario", name: "Mario", color: "#E4342B", ink: "#fff", initial: "M", emoji: "🍄" },
  luigi: { key: "luigi", name: "Luigi", color: "#2FA84F", ink: "#fff", initial: "L", emoji: "🌿" },
  peach: { key: "peach", name: "Peach", color: "#F27DA6", ink: "#fff", initial: "P", emoji: "🌸" },
  toad: { key: "toad", name: "Toad", color: "#4FA3E3", ink: "#fff", initial: "T", emoji: "🍄" },
  yoshi: { key: "yoshi", name: "Yoshi", color: "#7DBE3C", ink: "#fff", initial: "Y", emoji: "🥚" },
  bowser: { key: "bowser", name: "Bowser", color: "#EF7D22", ink: "#fff", initial: "B", emoji: "🔥" },
  wario: { key: "wario", name: "Wario", color: "#F4C430", ink: "#3a2d00", initial: "W", emoji: "⚡" },
  daisy: { key: "daisy", name: "Daisy", color: "#9B59B6", ink: "#fff", initial: "D", emoji: "🌼" },
};

export const ROSTER = Object.values(CHARACTERS);

export const getCharacter = (key) => CHARACTERS[key] || CHARACTERS.mario;

// Pick `count` distinct characters at random, excluding the given keys.
export function randomCharacters(count, exclude = []) {
  const pool = ROSTER.filter((c) => !exclude.includes(c.key));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((c) => c.key);
}
