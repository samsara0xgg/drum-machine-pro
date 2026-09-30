// Built-in Library songs, each a different style. Each payload is a full v2 snapshot, same shape as a
// share link, so loading one goes through the same hydrate() as /p/:slug.
// Every preset is a whole song: `bars` says which pad plays each bar (and
// how the FILTER knob moves across it), the way the power-on demo plays.
import { STEP_COUNT } from "./kits.js";
import { DEFAULT_NOTE, parseNote } from "./bass808.js";

// Songs fill the first pads; the remaining pads keep the first pad's lineup
// with nothing lit, ready to draw on. fx carries the master sound
// (pitch/pan/reverb/swing/filter) and bass the 808 voice.
const payload = (bpm, sections, fx = {}, bass) => ({
  version: 2,
  bpm,
  swing: fx.swing ?? 50,
  filter: fx.filter ?? 0,
  pitch: fx.pitch ?? 0,
  pan: fx.pan ?? 0,
  reverb: fx.reverb ?? 0,
  ...(bass && { bass }),
  patternNum: 0,
  patterns: [...Array(12)].map((_, i) =>
    sections[i]
      ? { kit: sections[i].kit, channels: sections[i].rows }
      : {
          kit: sections[0].kit,
          channels: sections[0].rows.map((r) => ({
            ...r,
            steps: Array(STEP_COUNT).fill(0),
            rolls: Array(STEP_COUNT).fill(1),
          })),
        }
  ),
});

// Sections are written as drum tabs. One character per 16th: "-" rest,
// 1 soft, 2 mid, 3 hard; spaces split beats. A row is its hits tab, or
// [hits, rolls] where a roll digit is how many times that step fires. The
// 808 row is { hits, notes }: one note per hit in order, "~" marking a
// slide into it. A lineup names each song's rows as [kit, slot], in order.
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
const tabs = (kit, lineup) => (spec) => ({
  kit,
  rows: Object.entries(lineup).map(([name, [rowKit, slot]]) => {
    const part = spec[name] ?? REST;
    const [hits, rolls = REST] = part.hits ? [part.hits] : [].concat(part);
    const steps = tab(hits, 0);
    const row = { kit: rowKit, slot, steps, rolls: tab(rolls, 1), muted: false, solo: false };
    return rowKit === "synth" ? { ...row, ...bassLine(steps, part.notes ?? "") } : row;
  }),
});

// ---- Trap: the power-on demo, in F minor across six pads. Half-time feel:
// the backbeat lands on step 9. ----
const trap = tabs("808", {
  kick: ["808", 0],
  bass: ["synth", 0],
  clap: ["808", 4],
  snare: ["hiphop", 1],
  hat: ["808", 2],
  openHat: ["808", 3],
  rim: ["808", 7],
  cowbell: ["808", 5],
});

const trapIntro = trap({
  hat:     "2-1- 2-1- 2-1- 2-1-",
  rim:     "---- ---- 2--- ----",
  cowbell: "2--2 --2- ---- ----",
});
const trapGroove = trap({
  kick:    "3--- ---- --3- --2-",
  bass:   { hits: "3--- ---- --2- --2-", notes: "F1 F1 ~G#1" },
  clap:    "---- ---- 3--- ----",
  snare:   "---- ---- 2--- ----",
  hat:    ["2-2- 2-22 2-2- 2-22",
           "---- ---2 ---- ---3"],
  cowbell: "1--1 --1- ---- ----",
});
const trapBuildUp = trap({
  kick:    "3--- ---- ---- ----",
  bass:   { hits: "3--- ---- ---- ----", notes: "F1" },
  clap:    "---- ---- 3--- ----",
  snare:   "2-2- 2-2- 2-2- 2-2-",
  hat:     "1111 1111 1111 1111",
});
// ends a beat early: the silence before the drop
const trapPeak = trap({
  clap:    "---- ---- 3--- ----",
  snare:  ["2222 3333 3333 ----",
           "---- 2222 3344 ----"],
  hat:    ["1111 1111 ---- ----",
           "2222 2222 ---- ----"],
});
const trapChorus = trap({
  kick:    "3--- ---2 --3- -2--",
  bass:   { hits: "3--- ---2 --3- -2--", notes: "F1 C2 ~A#1 ~G#1" },
  clap:    "---- ---- 3--- ----",
  snare:   "---- ---- 3--- ---1",
  hat:    ["2-22 2--2 2-22 2222",
           "---3 ---2 ---2 --34"],
  openHat: "---- --2- ---- ----",
  cowbell: "2--1 --2- 2--1 --2-",
});
const trapFill = trap({
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
  name: "Trap Demo",
  meta: "808 · 140 · 6 pads",
  about:
    "The power-on song in F minor: intro, groove, build-up, drop. Hear the 808 slide (~ on its pads), the hat rolls (sliced pads) and the FILTER sweeps.",
  payload: payload(
    140,
    [trapIntro, trapGroove, trapBuildUp, trapPeak, trapChorus, trapFill],
    { reverb: 0.15, filter: -85 },
    { decay: 1.1, drive: 45, glide: 90 }
  ),
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

// ---- Boom bap in D minor: 58% swing pushes every second 16th late, soft
// ghost snares sit between the backbeats, and the hook layers the 808 clap
// over the hip hop snare. The 808 stays short and up in octave 2, so the
// low end stays clear. ----
const boomBap = tabs("hiphop", {
  kick: ["hiphop", 0],
  bass: ["synth", 0],
  snare: ["hiphop", 1],
  clap: ["808", 4],
  ghost: ["hiphop", 4],
  hat: ["hiphop", 2],
  openHat: ["hiphop", 3],
  rim: ["808", 7],
});

const boomIntro = boomBap({
  kick:    "3--- ---- --2- ----",
  hat:     "2-1- 2-1- 2-1- 2-11",
  rim:     "---- 2--- ---- 2---",
});
const boomVerse = boomBap({
  kick:    "3--- ---2 --3- ----",
  bass:   { hits: "2--- ---- --2- ----", notes: "D2 F2" },
  snare:   "---- 3--- ---- 3---",
  ghost:   "---- ---- -1-- ---1",
  hat:     "2-1- 2-11 2-1- 2-1-",
});
const boomVerseB = boomBap({
  kick:    "3--- ---2 --3- -2--",
  bass:   { hits: "2--- ---- --2- -2--", notes: "D2 A2 G2" },
  snare:   "---- 3--- ---- 3---",
  ghost:   "--1- ---1 -1-- ---1",
  hat:     "2-1- 2-11 2-1- 2---",
  openHat: "---- ---- ---- --2-",
});
const boomHook = boomBap({
  kick:    "3--- ---2 --3- -2--",
  bass:   { hits: "2--- ---2 --2- ----", notes: "D2 C2 A2" },
  snare:   "---- 3--- ---- 3---",
  clap:    "---- 2--- ---- 2---",
  ghost:   "---- ---1 -1-- ---1",
  hat:     "3-1- 2-11 3-1- 2---",
  openHat: "---- ---- ---- --2-",
});
// drops the hats on beat 4 for a ghost-snare pickup into the next bar
const boomTurn = boomBap({
  kick:    "3--- ---- --3- ----",
  bass:   { hits: "2--- ---- --2- ----", notes: "D2 C2" },
  snare:   "---- 3--- ---- 3---",
  ghost:   "---- ---- -1-1 -123",
  hat:     "2-1- 2-1- 2-1- ----",
});

const BOOM_BAP = {
  name: "Boom Bap",
  meta: "Hip Hop · 90 · 5 pads",
  about:
    "Laid back at 58% SWING: a muffled intro, verse, hook, turnaround. Hear the soft ghost snares (half-lit pads), a short 808 walking with the kick, and the 808 clap layered on the hook.",
  payload: payload(
    90,
    [boomIntro, boomVerse, boomVerseB, boomHook, boomTurn],
    { swing: 58, reverb: 0.12, filter: -55 },
    { decay: 0.45, drive: 35, glide: 80 }
  ),
  bars: [
    { pad: 0, filter: [-55, -55] },
    { pad: 0, filter: [-55, -20] },
    { pad: 1, filter: [0, 0] },
    { pad: 1 },
    { pad: 2 },
    { pad: 4 },
    { pad: 3 },
    { pad: 3 },
    { pad: 3 },
    { pad: 4 },
  ],
  loopFrom: 2,
};

// ---- House in A minor on the 707: every pad adds a layer, then a snare
// roll (ROLL 2 to 4) builds under a rising high-pass into the drop. ----
const house = tabs("707", {
  kick: ["707", 0],
  bass: ["synth", 0],
  clap: ["707", 4],
  snare: ["707", 1],
  hat: ["707", 2],
  openHat: ["707", 3],
  tamb: ["707", 5],
});

const houseIntro = house({
  kick:    "3--- 3--- 3--- 3---",
  hat:     "21-1 21-1 21-1 21-1",
});
const houseGroove = house({
  kick:    "3--- 3--- 3--- 3---",
  clap:    "---- 3--- ---- 3---",
  hat:     "21-1 21-1 21-1 21-1",
  openHat: "--2- --2- --2- --2-",
});
const houseBass = house({
  kick:    "3--- 3--- 3--- 3---",
  bass:   { hits: "--3- --2- --3- -22-", notes: "A1 A1 C2 A1 G1" },
  clap:    "---- 3--- ---- 3---",
  hat:     "21-1 21-1 21-1 21-1",
  openHat: "--2- --2- --2- --2-",
});
const houseBuild = house({
  kick:    "3--- 3--- 3--- 3---",
  bass:   { hits: "3--- ---- ---- ----", notes: "A1" },
  clap:    "---- 3--- ---- 3---",
  snare:   "2-2- 2-2- 2-2- 2-2-",
  hat:     "1-1- 1-1- 1-1- 1-1-",
});
// ends a beat early: the silence before the drop
const housePeak = house({
  kick:    "3--- 3--- 3--- ----",
  snare:  ["2222 2222 3333 ----",
           "---- 2222 3344 ----"],
});
const houseDrop = house({
  kick:    "3--- 3--- 3--- 3---",
  bass:   { hits: "--3- --2- --3- -22-", notes: "A1 A1 C2 A1 ~G1" },
  clap:    "---- 3--- ---- 3---",
  hat:     "31-1 21-1 31-1 21-1",
  openHat: "--3- --2- --3- --2-",
  tamb:    "--1- --2- --1- --2-",
});

const HOUSE = {
  name: "House",
  meta: "707 · 124 · 6 pads",
  about:
    "Four on the floor, one layer per pad: intro, clap and hats, bassline, then a snare roll (ROLL 2 to 4) under a rising high-pass, and the drop.",
  payload: payload(
    124,
    [houseIntro, houseGroove, houseBass, houseBuild, housePeak, houseDrop],
    { reverb: 0.1, filter: -80 },
    { decay: 0.4, drive: 35, glide: 60 }
  ),
  bars: [
    { pad: 0, filter: [-80, -55] },
    { pad: 0, filter: [-55, -10] },
    { pad: 1, filter: [0, 0] },
    { pad: 1 },
    { pad: 2 },
    { pad: 2 },
    { pad: 3, filter: [0, 40] },
    { pad: 4, filter: [40, 85] },
    { pad: 5, filter: [0, 0] },
    { pad: 5 },
    { pad: 5 },
    { pad: 5 },
  ],
  loopFrom: 2,
};

// ---- Reggaeton in A minor: the dembow (kick on every beat, snare on the
// "boom-ch-boom-chick"), an 808 following the snare through Am, F, C, G,
// and timbale-style tom fills. The intro is thin, through a high-pass. The
// tight 707 kick and a short 808 keep the low end from booming. ----
const reggaeton = tabs("808", {
  kick: ["707", 0],
  bass: ["synth", 0],
  snare: ["808", 1],
  clap: ["808", 4],
  hat: ["808", 2],
  openHat: ["808", 3],
  rim: ["808", 7],
  hiTom: ["808", 8],
  midTom: ["808", 9],
  lowTom: ["808", 10],
});

const rgIntro = reggaeton({
  hat:     "2-1- 2-1- 2-1- 2-1-",
  rim:     "---2 --2- ---2 --2-",
});
const rgVerseA = reggaeton({
  kick:    "3--- 3--- 3--- 3---",
  bass:   { hits: "2--1 --1- 2--1 --1-", notes: "A2 A2 A2 F2 F2 F2" },
  snare:   "---2 --2- ---2 --2-",
  hat:     "2-1- 2-1- 2-1- 2-1-",
});
const rgVerseB = reggaeton({
  kick:    "3--- 3--- 3--- 3---",
  bass:   { hits: "2--1 --1- 2--1 --1-", notes: "C2 C2 C2 G2 G2 G2" },
  snare:   "---2 --2- ---2 --2-",
  hat:     "2-1- 2-1- 2-1- 2---",
  openHat: "---- ---- ---- --2-",
});
const rgHookA = reggaeton({
  kick:    "3--- 3--- 3--- 3---",
  bass:   { hits: "2--1 --1- 2--1 --1-", notes: "A2 A2 A2 F2 F2 F2" },
  snare:   "---3 --3- ---3 --3-",
  clap:    "---2 --2- ---2 --2-",
  hat:     "2121 2121 2121 2121",
});
const rgHookB = reggaeton({
  kick:    "3--- 3--- 3--- 3---",
  bass:   { hits: "2--1 --1- 2--1 --1-", notes: "C2 C2 C2 G2 G2 G2" },
  snare:   "---3 --3- ---3 --3-",
  clap:    "---2 --2- ---2 --2-",
  hat:     "2121 2121 2121 21--",
  openHat: "---- ---- ---- --2-",
});
// the toms tumble down over beats 3 and 4 into the next section
const rgFill = reggaeton({
  kick:    "3--- 3--- 3--- ----",
  bass:   { hits: "2--1 --1- 2--- ----", notes: "C2 C2 C2 G2" },
  snare:   "---2 --2- ---- ----",
  hat:     "2-1- 2-1- ---- ----",
  hiTom:   "---- ---- 3-2- ----",
  midTom:  "---- ---- ---- 3-2-",
  lowTom:  "---- ---- ---- ---3",
});

const REGGAETON = {
  name: "Reggaeton",
  meta: "808 + 707 · 95 · 6 pads",
  about:
    "The dembow beat: kick on every beat, snare on the boom-ch-boom-chick. It opens thin through a high-pass (FILTER right), then an 808 follows the snare and tom fills lead into the hook.",
  payload: payload(
    95,
    [rgIntro, rgVerseA, rgVerseB, rgHookA, rgHookB, rgFill],
    { reverb: 0.08, filter: 70 },
    { decay: 0.3, drive: 50, glide: 60 }
  ),
  bars: [
    { pad: 0, filter: [70, 70] },
    { pad: 0, filter: [70, 35] },
    { pad: 1, filter: [0, 0] },
    { pad: 2 },
    { pad: 1 },
    { pad: 5 },
    { pad: 3 },
    { pad: 4 },
    { pad: 3 },
    { pad: 5 },
  ],
  loopFrom: 2,
};

// ---- Amapiano in F minor: the 808 plays the log drum, bending in and out
// of notes with slides; shakers ride a light 54% swing. Two bars of log
// drum alone, then the drop brings in open hats and cowbell. ----
const amapiano = tabs("707", {
  kick: ["707", 0],
  bass: ["synth", 0],
  clap: ["707", 4],
  rim: ["808", 7],
  shaker: ["707", 5],
  openHat: ["707", 3],
  cowbell: ["808", 5],
});

const LOG_A = { hits: "3--2 --3- --2- 2-2-", notes: "F2 C2 F2 ~D#2 C2 ~G#2" };
const LOG_B = { hits: "3--2 --3- --2- 2--2", notes: "C#2 G#2 C#2 ~C2 D#2 ~F2" };
const apIntro = amapiano({
  shaker:  "1121 1121 1121 1121",
  rim:     "---- --2- ---- -2-2",
});
const apA = amapiano({
  kick:    "2--- 2--- 2--- 2---",
  bass:    LOG_A,
  clap:    "---- 2--- ---- 2---",
  rim:     "---- --1- ---- --1-",
  shaker:  "1121 1121 1121 1121",
});
const apB = amapiano({
  kick:    "2--- 2--- 2--- 2---",
  bass:    LOG_B,
  clap:    "---- 2--- ---- 2---",
  rim:     "---- --1- ---- -2-2",
  shaker:  "1121 1121 1121 1121",
});
const apSolo = amapiano({
  bass:    LOG_A,
  shaker:  "1121 1121 1121 1121",
  rim:     "---- --1- ---- --1-",
});
const apDropA = amapiano({
  kick:    "3--- 3--- 3--- 3---",
  bass:    LOG_A,
  clap:    "---- 3--- ---- 3---",
  shaker:  "1121 1121 1121 1121",
  openHat: "--2- --2- --2- --2-",
  cowbell: "2--1 --2- ---- ----",
});
const apDropB = amapiano({
  kick:    "3--- 3--- 3--- 3---",
  bass:    LOG_B,
  clap:    "---- 3--- ---- 3---",
  shaker:  "1121 1121 1121 1121",
  openHat: "--2- --2- --2- --2-",
  cowbell: "2--1 --2- ---- --1-",
});

const AMAPIANO = {
  name: "Amapiano",
  meta: "707 + 808 · 113 · 6 pads",
  about:
    "South African house. The 808 plays the log drum, its SLIDE notes bending up and down; the shakers sit on a light 54% SWING. Two bars of log drum alone, then the drop with cowbell.",
  payload: payload(
    113,
    [apIntro, apA, apB, apSolo, apDropA, apDropB],
    { swing: 54, reverb: 0.15, filter: -80 },
    { decay: 0.22, drive: 65, glide: 70 }
  ),
  bars: [
    { pad: 0, filter: [-80, -50] },
    { pad: 0, filter: [-50, -10] },
    { pad: 1, filter: [0, 0] },
    { pad: 2 },
    { pad: 1 },
    { pad: 2 },
    { pad: 3 },
    { pad: 3, filter: [0, 45] },
    { pad: 4, filter: [0, 0] },
    { pad: 5 },
    { pad: 4 },
    { pad: 5 },
  ],
  loopFrom: 2,
};

// ---- 80s synth-pop in A minor on the LinnDrum: an 808 jumping octaves on
// every eighth through Am, F, C, G (a short DECAY makes it a pluck), big
// reverb, a tambourine on the chorus and a tom fill back to the top. ----
const neon = tabs("linndrum", {
  kick: ["linndrum", 0],
  bass: ["synth", 0],
  snare: ["linndrum", 1],
  clap: ["linndrum", 4],
  hat: ["linndrum", 2],
  tamb: ["linndrum", 7],
  hiTom: ["linndrum", 8],
  midTom: ["linndrum", 9],
  lowTom: ["linndrum", 10],
});

const OCTAVES_A = { hits: "2-1- 2-1- 2-1- 2-1-", notes: "A1 A2 A1 A2 F1 F2 F1 F2" };
const OCTAVES_B = { hits: "2-1- 2-1- 2-1- 2-1-", notes: "C2 G2 C2 G2 G1 G2 G1 G2" };
const neIntro = neon({
  kick:    "3--- ---- 3--- ----",
  hat:     "2121 2121 2121 2121",
});
const neVerseA = neon({
  kick:    "3--- ---- 3--- ----",
  bass:    OCTAVES_A,
  snare:   "---- 3--- ---- 3---",
  hat:     "2121 2121 2121 2121",
});
const neVerseB = neon({
  kick:    "3--- ---- 3--- ----",
  bass:    OCTAVES_B,
  snare:   "---- 3--- ---- 3---",
  hat:     "2121 2121 2121 2121",
});
const neChorusA = neon({
  kick:    "3--- --2- 3--- ----",
  bass:    OCTAVES_A,
  snare:   "---- 3--- ---- 3---",
  clap:    "---- 3--- ---- 3---",
  hat:     "2121 2121 2121 2121",
  tamb:    "--2- --2- --2- --2-",
});
const neChorusB = neon({
  kick:    "3--- --2- 3--- ----",
  bass:    OCTAVES_B,
  snare:   "---- 3--- ---- 3---",
  clap:    "---- 3--- ---- 3---",
  hat:     "2121 2121 2121 2121",
  tamb:    "--2- --2- --2- --2-",
});
const neFill = neon({
  kick:    "3--- ---- 3--- ----",
  bass:   { hits: "2-1- 2-1- 2--- ----", notes: "C2 G2 C2 G2 G1" },
  snare:   "---- 3--- ---- ----",
  hat:     "2121 2121 ---- ----",
  hiTom:   "---- ---- 32-- ----",
  midTom:  "---- ---- --32 ----",
  lowTom:  "---- ---- ---- 3232",
});

const NEON_80S = {
  name: "Neon 80s",
  meta: "Linn · 118 · 6 pads",
  about:
    "Synth-pop on the LinnDrum: the 808 jumps octaves on every eighth (a short DECAY makes it a pluck), with big REVERB, a tambourine on the chorus and a tom fill back to the top.",
  payload: payload(
    118,
    [neIntro, neVerseA, neVerseB, neChorusA, neChorusB, neFill],
    { reverb: 0.25, filter: -75 },
    { decay: 0.25, drive: 40, glide: 50 }
  ),
  bars: [
    { pad: 0, filter: [-75, -50] },
    { pad: 0, filter: [-50, -5] },
    { pad: 1, filter: [0, 0] },
    { pad: 2 },
    { pad: 1 },
    { pad: 2 },
    { pad: 3 },
    { pad: 4 },
    { pad: 3 },
    { pad: 5 },
  ],
  loopFrom: 2,
};

// ---- UK garage in A minor on the 707: the skippy two-step kick, hats
// shuffled by 58% swing, and a bouncy bass kept up in octave 2. A break
// without the kick rises through a high-pass into the drop. ----
const garage = tabs("707", {
  kick: ["707", 0],
  bass: ["synth", 0],
  clap: ["707", 4],
  rim: ["808", 7],
  hat: ["707", 2],
  openHat: ["707", 3],
  tamb: ["707", 5],
});

const GARAGE_A = { hits: "2--2 --2- --2- -2--", notes: "A2 A2 G2 E2 G2" };
const GARAGE_B = { hits: "2--2 --2- --2- -2--", notes: "F2 F2 E2 C2 D2" };
const gIntro = garage({
  hat:     "-121 -121 -121 -121",
  rim:     "---2 --2- ---- -2--",
});
const gA = garage({
  kick:    "3--- ---- --3- ----",
  bass:    GARAGE_A,
  clap:    "---- 3--- ---- 3---",
  hat:     "-121 -121 -121 -121",
  rim:     "---2 ---- ---- -2--",
});
const gB = garage({
  kick:    "3--- ---1 --3- ----",
  bass:    GARAGE_B,
  clap:    "---- 3--- ---- 3---",
  hat:     "-121 -121 -121 -1--",
  openHat: "---- ---- ---- --2-",
  rim:     "---2 ---- ---- ----",
});
const gBreak = garage({
  bass:    GARAGE_A,
  clap:    "---- 3--- ---- 3---",
  hat:     "-121 -121 -121 -121",
  rim:     "---2 --2- ---2 --2-",
});
const gDropA = garage({
  kick:    "3--- ---- --3- ----",
  bass:    GARAGE_A,
  clap:    "---- 3--- ---- 3---",
  hat:     "-1-1 -1-1 -1-1 -1-1",
  openHat: "--2- --2- --2- --2-",
  tamb:    "2--- 2--- 2--- 2---",
  rim:     "---2 ---- ---- -2--",
});
const gDropB = garage({
  kick:    "3--- ---1 --3- ----",
  bass:    GARAGE_B,
  clap:    "---- 3--- ---- 3---",
  hat:     "-1-1 -1-1 -1-1 -1-1",
  openHat: "--2- --2- --2- --2-",
  tamb:    "2--- 2--- 2--- 2---",
});

const GARAGE = {
  name: "UK Garage",
  meta: "707 · 132 · 6 pads",
  about:
    "House's skippy cousin: a two-step kick, hats shuffled by 58% SWING and a bouncy bass. A break without the kick rises through a high-pass, then the drop adds open hats and tambourine.",
  payload: payload(
    132,
    [gIntro, gA, gB, gBreak, gDropA, gDropB],
    { swing: 58, reverb: 0.12, filter: -70 },
    { decay: 0.3, drive: 55, glide: 50 }
  ),
  bars: [
    { pad: 0, filter: [-70, -40] },
    { pad: 0, filter: [-40, -5] },
    { pad: 1, filter: [0, 0] },
    { pad: 2 },
    { pad: 1 },
    { pad: 2 },
    { pad: 3, filter: [0, 30] },
    { pad: 3, filter: [30, 70] },
    { pad: 4, filter: [0, 0] },
    { pad: 5 },
    { pad: 4 },
    { pad: 5 },
  ],
  loopFrom: 2,
};

export const PRESETS = [DEMO_SONG, HOUSE, GARAGE, NEON_80S, BOOM_BAP, REGGAETON, AMAPIANO];
