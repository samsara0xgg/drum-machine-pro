// Built-in Library grooves. Each payload is a full v2 snapshot, same shape as a
// share link, so loading one goes through the same hydrate() as /p/:slug.
import { STEP_COUNT } from "./kits.js";

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
// carry pitch/pan/reverb/swing so a preset loads with its own master sound.
const payload = (bpm, defs, fx = {}) => ({
  version: 2,
  bpm,
  swing: fx.swing ?? 50,
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

// The power-on demo: one 808 lineup across five pads, written as drum tabs.
// One character per 16th: "-" rest, 1 soft, 2 mid, 3 hard; spaces split beats.
const LINEUP = { kick: 0, snare: 1, clap: 4, hat: 2, openHat: 3, rim: 7, highTom: 8, lowTom: 10 };
const tabSteps = (tab = "---- ---- ---- ----") =>
  [...tab.replace(/ /g, "")].map((c) => (c === "-" ? 0 : Number(c)));
const section = (tabs) => ({
  kit: "808",
  rows: Object.entries(LINEUP).map(([name, slot]) => ({
    kit: "808",
    slot,
    steps: tabSteps(tabs[name]),
    muted: false,
    solo: false,
  })),
});

const intro = section({
  kick:    "3--- ---- ---- ----",
  hat:     "2-1- 2-1- 2-1- 2-11",
  rim:     "---- 2--- ---- 2---",
});
const groove = section({
  kick:    "3--- ---2 --3- ----",
  snare:   "---- 3--- -1-- 3--1",
  hat:     "3-11 2-1- 3-11 2---",
  openHat: "---- ---- ---- --2-",
});
const variation = section({
  kick:    "3--2 ---2 --3- -1--",
  snare:   "---- 3--- -1-- 3--1",
  hat:     "3-11 2-1- 3-11 2---",
  openHat: "---- --1- ---- --2-",
  rim:     "---2 ---- ---2 ----",
});
const fill = section({
  kick:    "3--- ---2 ---- ----",
  snare:   "---- 3--- ---- -123",
  clap:    "---- ---- ---- ---3",
  hat:     "3-1- 2-1- ---- ----",
  highTom: "---- ---- 3-2- ----",
  lowTom:  "---- ---- ---2 3---",
});
const chorus = section({
  kick:    "3--- ---2 --3- --1-",
  snare:   "---- 3--- -1-- 3--1",
  clap:    "---- 2--- ---- 3---",
  hat:     "3111 2-11 3111 2---",
  openHat: "---- ---- ---- --2-",
  rim:     "---- --1- ---- ----",
});

// Pads 1-5 = intro, groove, variation, fill, chorus. order is one pad per
// bar: a two-bar intro, two 4-bar groove phrases (ending in the variation,
// then the fill), a chorus phrase ending in the fill, then back to the groove.
export const DEMO_SONG = {
  payload: payload(90, [intro, groove, variation, fill, chorus], { swing: 57, reverb: 0.12 }),
  order: [0, 0, 1, 1, 1, 2, 1, 1, 1, 3, 4, 4, 4, 3],
  loopFrom: 2,
};
