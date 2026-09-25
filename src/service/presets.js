// Built-in Library grooves. Each payload is a full v2 snapshot, same shape as a
// share link, so loading one goes through the same hydrate() as /p/:slug.
import { STEP_COUNT } from "./kits.js";
import { DEFAULT_NOTE, parseNote } from "./bass808.js";

// Turn a list of step numbers into the level[16] a channel row stores
// (every hit at mid, 2).
const steps = (on) => Array.from({ length: STEP_COUNT }, (_, i) => (on.includes(i) ? 2 : 0));

const row = (kit, slot, on) => ({
  kit,
  slot,
  steps: steps(on),
  muted: false,
  solo: false,
});

// A preset can fill several pads: defs[i] = { kit, rows } lands on pad i+1.
// The remaining pads keep pattern 1's lineup with empty steps, and fx can
// carry pitch/pan/reverb/swing/filter so a preset loads with its own master sound.
const payload = (bpm, defs, fx = {}) => ({
  version: 2,
  bpm,
  swing: fx.swing ?? 50,
  filter: fx.filter ?? 0,
  pitch: fx.pitch ?? 0,
  pan: fx.pan ?? 0,
  reverb: fx.reverb ?? 0,
  patternNum: 0,
  patterns: [...Array(12)].map((_, i) =>
    defs[i]
      ? { kit: defs[i].kit, channels: defs[i].rows }
      : {
          kit: defs[0].kit,
          channels: defs[0].rows.map((r) => ({ ...r, steps: steps([]) })),
        }
  ),
});

export const PRESETS = [
  {
    name: "808 Boom Bap",
    meta: "808 · 98",
    payload: payload(98, [
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 7, 10]),
          row("808", 1, [4, 12]),
          row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 3, [14]),
        ],
      },
    ]),
  },
  {
    name: "707 House",
    meta: "707 · 133",
    payload: payload(133, [
      {
        kit: "707",
        rows: [
          row("707", 0, [0, 4, 8, 12]),
          row("707", 4, [4, 12]),
          row("707", 3, [2, 6, 10, 14]),
          row("707", 5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
        ],
      },
    ]),
  },
  {
    // The cowbell row is borrowed from the 808 kit — cross-kit mixing demo.
    name: "Linn 80s Pop",
    meta: "Linn · 124",
    payload: payload(124, [
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 8]),
          row("linndrum", 1, [4, 12]),
          row("linndrum", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("linndrum", 7, [4, 12]),
          row("808", 5, [6, 14]),
        ],
      },
    ]),
  },
  {
    // Four pads: main groove, busier variation, percussion break, tom fill.
    // The clave line runs a 3-2 son clave the whole way through.
    name: "808 Electro",
    meta: "808 · 128 · 4 pads",
    payload: payload(128, [
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 10]),
          row("808", 1, [4, 12]),
          row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 3, []),
          row("808", 6, [0, 3, 6, 10, 12]),
          row("808", 5, [0, 4, 8, 12]),
          row("808", 9, []),
          row("808", 10, []),
        ],
      },
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 10, 13]),
          row("808", 1, [4, 12]),
          row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 3, [2, 10]),
          row("808", 6, [0, 3, 6, 10, 12]),
          row("808", 5, [0, 4, 8, 12]),
          row("808", 9, [7]),
          row("808", 10, [15]),
        ],
      },
      {
        kit: "808",
        rows: [
          row("808", 0, []),
          row("808", 1, []),
          row("808", 2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
          row("808", 3, [4, 12]),
          row("808", 6, [0, 3, 6, 10, 12]),
          row("808", 5, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("808", 9, [8, 9]),
          row("808", 10, [12, 14]),
        ],
      },
      {
        kit: "808",
        rows: [
          row("808", 0, [0, 8]),
          row("808", 1, [12, 13, 14, 15]),
          row("808", 2, [0, 2, 4, 6, 8, 10]),
          row("808", 3, []),
          row("808", 6, [0, 3, 6]),
          row("808", 5, [0, 4, 8]),
          row("808", 9, [4, 6]),
          row("808", 10, [10, 11]),
        ],
      },
    ]),
  },
  {
    // Half-time trap: snare only on beat 3, hat rolls hand off between the two
    // closed hats; the offbeat tick on pads 3-4 is borrowed from the 808 rimshot.
    name: "Trap Hall",
    meta: "Hip Hop · 140 · 4 pads",
    payload: payload(140, [
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0, 7, 10]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("hiphop", 5, [13, 14, 15]),
          row("hiphop", 3, []),
          row("808", 7, []),
        ],
      },
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0, 7, 10, 13]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("hiphop", 5, [4, 5, 6, 7]),
          row("hiphop", 3, [14]),
          row("808", 7, []),
        ],
      },
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0, 10]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 4, 8, 12]),
          row("hiphop", 5, []),
          row("hiphop", 3, [2, 6, 10, 14]),
          row("808", 7, [3, 11]),
        ],
      },
      {
        kit: "hiphop",
        rows: [
          row("hiphop", 0, [0]),
          row("hiphop", 1, [8]),
          row("hiphop", 2, [0, 4, 8, 12]),
          row("hiphop", 5, []),
          row("hiphop", 3, []),
          row("808", 7, []),
          row("hiphop", 4, [12, 13, 14, 15]),
        ],
      },
    ]),
  },
  {
    // The Rhythm Ace doing what it was built for: a bossa. Pad 2 opens the
    // hats, pad 3 drops the kick for a percussion passage.
    name: "Ace Bossa",
    meta: "Acetone · 138 · 3 pads",
    payload: payload(138, [
      {
        kit: "acetone",
        rows: [
          row("acetone", 0, [0, 6, 8, 14]),
          row("acetone", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("acetone", 5, [0, 3, 6, 10, 13]),
          row("acetone", 4, [4, 12]),
          row("acetone", 3, []),
          row("acetone", 6, []),
        ],
      },
      {
        kit: "acetone",
        rows: [
          row("acetone", 0, [0, 6, 8, 14]),
          row("acetone", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("acetone", 5, [0, 3, 6, 10, 13]),
          row("acetone", 4, [4, 12]),
          row("acetone", 3, [7, 15]),
          row("acetone", 6, [8]),
        ],
      },
      {
        kit: "acetone",
        rows: [
          row("acetone", 0, []),
          row("acetone", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
          row("acetone", 5, [0, 3, 6, 10, 13]),
          row("acetone", 4, [0, 2, 5, 8, 10, 13]),
          row("acetone", 3, [4, 12]),
          row("acetone", 6, []),
        ],
      },
    ]),
  },
  {
    // 80s boogie: LinnDrum backbeat fattened with the 808 clap layered on top
    // of the snare — a classic cross-kit production trick.
    name: "Linn Boogie",
    meta: "Linn + 808 · 108 · 3 pads",
    payload: payload(108, [
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 5, 8, 10]),
          row("linndrum", 1, [4, 12]),
          row("808", 4, [4, 12]),
          row("linndrum", 2, [0, 2, 3, 4, 6, 8, 10, 11, 12, 14]),
          row("linndrum", 7, [2, 6, 10, 14]),
          row("linndrum", 5, []),
          row("linndrum", 9, []),
          row("linndrum", 10, []),
        ],
      },
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 5, 8, 10, 14]),
          row("linndrum", 1, [4, 12]),
          row("808", 4, [4, 12]),
          row("linndrum", 2, [0, 2, 3, 4, 6, 8, 10, 11, 12, 14]),
          row("linndrum", 7, [2, 6, 10, 14]),
          row("linndrum", 5, [0, 4, 8, 12]),
          row("linndrum", 9, []),
          row("linndrum", 10, []),
        ],
      },
      {
        kit: "linndrum",
        rows: [
          row("linndrum", 0, [0, 8]),
          row("linndrum", 1, [4, 12, 15]),
          row("808", 4, [4, 12]),
          row("linndrum", 2, [0, 2, 4, 6]),
          row("linndrum", 7, []),
          row("linndrum", 5, []),
          row("linndrum", 9, [8, 9]),
          row("linndrum", 10, [12, 13]),
        ],
      },
    ]),
  },
  {
    // Slow dub: one-drop on pad 1, steppers on pad 3, and the whole preset
    // loads with the master reverb up — the fx snapshot in action. The rimshot
    // and tambourine are borrowed from the LinnDrum.
    name: "Dub Echo",
    meta: "808 + Linn · 76 · 3 pads · reverb",
    payload: payload(
      76,
      [
        {
          kit: "808",
          rows: [
            row("808", 0, [8]),
            row("linndrum", 6, [8]),
            row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
            row("808", 3, []),
            row("808", 6, []),
            row("linndrum", 7, [4, 12]),
          ],
        },
        {
          kit: "808",
          rows: [
            row("808", 0, [8, 14]),
            row("linndrum", 6, [8]),
            row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
            row("808", 3, [6]),
            row("808", 6, [3, 11]),
            row("linndrum", 7, [4, 12]),
          ],
        },
        {
          kit: "808",
          rows: [
            row("808", 0, [0, 4, 8, 12]),
            row("linndrum", 6, [8]),
            row("808", 2, [0, 2, 4, 6, 8, 10, 12, 14]),
            row("808", 3, [14]),
            row("808", 6, []),
            row("linndrum", 7, [0, 2, 4, 6, 8, 10, 12, 14]),
          ],
        },
      ],
      { reverb: 0.35 }
    ),
  },
];

// The power-on demo: a trap beat in F minor across six pads, written as
// drum tabs. One character per 16th: "-" rest, 1 soft, 2 mid, 3 hard;
// spaces split beats. A row is its hits tab, or [hits, rolls] where a roll
// digit is how many times that step fires. The 808 row is { hits, notes }:
// one note per hit in order, "~" marking a slide into it. Half-time feel:
// the backbeat lands on step 9.
const LINEUP = {
  kick: ["808", 0],
  bass: ["synth", 0],
  clap: ["808", 4],
  snare: ["hiphop", 1],
  hat: ["808", 2],
  openHat: ["808", 3],
  rim: ["808", 7],
  cowbell: ["808", 5],
};
const REST = "---- ---- ---- ----";
const tab = (text, rest) => [...text.replace(/ /g, "")].map((c) => (c === "-" ? rest : Number(c)));
const bassLine = (steps, notes) => {
  const names = notes.split(" ").filter(Boolean);
  const hits = steps.filter(Boolean).length;
  if (names.length !== hits) throw new Error(`808 row has ${hits} hits but ${names.length} notes`);
  let next = 0;
  const line = steps.map((level) => (level ? names[next++] : null));
  return {
    notes: line.map((name) => (name ? parseNote(name.replace("~", "")) : DEFAULT_NOTE)),
    slides: line.map((name) => (name?.startsWith("~") ? 1 : 0)),
  };
};
const section = (tabs) => ({
  kit: "808",
  rows: Object.entries(LINEUP).map(([name, [kit, slot]]) => {
    const spec = tabs[name] ?? REST;
    const [hits, rolls = REST] = spec.hits ? [spec.hits] : [].concat(spec);
    const steps = tab(hits, 0);
    const row = { kit, slot, steps, rolls: tab(rolls, 1), muted: false, solo: false };
    return kit === "synth" ? { ...row, ...bassLine(steps, spec.notes ?? "") } : row;
  }),
});

const intro = section({
  hat:     "2-1- 2-1- 2-1- 2-1-",
  rim:     "---- ---- 2--- ----",
  cowbell: "2--2 --2- ---- ----",
});
const groove = section({
  kick:    "3--- ---- --3- --2-",
  bass:   { hits: "3--- ---- --2- --2-", notes: "F1 F1 ~G#1" },
  clap:    "---- ---- 3--- ----",
  snare:   "---- ---- 2--- ----",
  hat:    ["2-2- 2-22 2-2- 2-22",
           "---- ---2 ---- ---3"],
  cowbell: "1--1 --1- ---- ----",
});
const buildUp = section({
  kick:    "3--- ---- ---- ----",
  bass:   { hits: "3--- ---- ---- ----", notes: "F1" },
  clap:    "---- ---- 3--- ----",
  snare:   "2-2- 2-2- 2-2- 2-2-",
  hat:     "1111 1111 1111 1111",
});
// ends a beat early: the silence before the drop
const buildPeak = section({
  clap:    "---- ---- 3--- ----",
  snare:  ["2222 3333 3333 ----",
           "---- 2222 3344 ----"],
  hat:    ["1111 1111 ---- ----",
           "2222 2222 ---- ----"],
});
const chorus = section({
  kick:    "3--- ---2 --3- -2--",
  bass:   { hits: "3--- ---2 --3- -2--", notes: "F1 C2 ~A#1 ~G#1" },
  clap:    "---- ---- 3--- ----",
  snare:   "---- ---- 3--- ---1",
  hat:    ["2-22 2--2 2-22 2222",
           "---3 ---2 ---2 --34"],
  openHat: "---- --2- ---- ----",
  cowbell: "2--1 --2- 2--1 --2-",
});
const chorusFill = section({
  kick:    "3--- ---2 --3- ----",
  bass:   { hits: "3--- ---2 --3- ----", notes: "F1 ~F2 ~C2" },
  clap:    "---- ---- 3--- ----",
  snare:  ["---- ---- 3--- 2333",
           "---- ---- ---- 2234"],
  hat:    ["2-22 2--2 2222 ----",
           "---3 ---2 2344 ----"],
  openHat: "---- --2- ---- ----",
  cowbell: "2--1 --2- ---- ----",
});

// One entry per bar: which pad plays, and an optional filter sweep across
// the bar (FILTER knob values, from -> to). The intro opens up out of a
// low-pass, the build-up thins out through a rising high-pass, and the drop
// snaps it open. After the chorus fill it loops back to the groove.
export const DEMO_SONG = {
  payload: {
    ...payload(140, [intro, groove, buildUp, buildPeak, chorus, chorusFill], {
      reverb: 0.15,
      filter: -85,
    }),
    bass: { decay: 1.1, drive: 45, glide: 90 },
  },
  bars: [
    { pad: 0, filter: [-85, -70] },
    { pad: 0, filter: [-70, -25] },
    { pad: 1, filter: [0, 0] },
    { pad: 1 },
    { pad: 1 },
    { pad: 1 },
    { pad: 2, filter: [0, 40] },
    { pad: 3, filter: [40, 85] },
    { pad: 4, filter: [0, 0] },
    { pad: 4 },
    { pad: 4 },
    { pad: 5 },
  ],
  loopFrom: 2,
};
