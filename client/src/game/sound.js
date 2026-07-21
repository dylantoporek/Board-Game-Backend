// Tiny Web Audio sound kit — all tones are synthesized, so there are no audio
// files to ship. Muting is remembered in localStorage.

let ctx = null;
let muted = typeof localStorage !== "undefined" && localStorage.getItem("castledash_muted") === "1";

function audio() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function beep({ freq = 440, dur = 0.12, type = "square", gain = 0.05, when = 0, slideTo = null }) {
  if (muted) return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export const sound = {
  isMuted: () => muted,
  toggle() {
    muted = !muted;
    if (typeof localStorage !== "undefined") localStorage.setItem("castledash_muted", muted ? "1" : "0");
    if (!muted) beep({ freq: 660, dur: 0.1, type: "triangle", gain: 0.05 });
    return muted;
  },
  roll() {
    for (let i = 0; i < 4; i++) {
      beep({ freq: 160 + Math.random() * 240, dur: 0.05, type: "square", gain: 0.03, when: i * 0.05 });
    }
  },
  land() {
    beep({ freq: 440, slideTo: 680, dur: 0.14, type: "triangle", gain: 0.05 });
  },
  coin() {
    beep({ freq: 988, dur: 0.07, type: "square", gain: 0.05 });
    beep({ freq: 1319, dur: 0.13, type: "square", gain: 0.05, when: 0.07 });
  },
  bad() {
    beep({ freq: 330, slideTo: 150, dur: 0.22, type: "sawtooth", gain: 0.045 });
    beep({ freq: 110, dur: 0.12, type: "square", gain: 0.04, when: 0.2 });
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      beep({ freq: f, dur: 0.18, type: "square", gain: 0.06, when: i * 0.13 })
    );
  },
};
