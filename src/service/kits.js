// Kit registry: display name, suggested BPM, and channels (label, sample URL, mix gain).
// Slots share an order across kits (kick / snare / closed hat / open hat / percussion...)
// so switching kits remaps row i -> new kit's slot i and the groove stays musical.
export const KITS = {
  707: {
    name: "Roland TR-707",
    suggestedBpm: 133,
    channels: [
      { id: "Bass", sample: "/assets/audio/707-bd.mp3", gain: 1 },
      { id: "Snare High", sample: "/assets/audio/707-sd-high.mp3", gain: 1 },
      { id: "Hi-Hat Closed", sample: "/assets/audio/707-ch.mp3", gain: 0.19 },
      { id: "Hi-Hat Open", sample: "/assets/audio/707-oh.mp3", gain: 0.32 },
      { id: "Clap", sample: "/assets/audio/707-clap.mp3", gain: 0.75 },
      { id: "Tambourine", sample: "/assets/audio/707-tamb.mp3", gain: 0.37 },
      { id: "Snare Low", sample: "/assets/audio/707-sd-low.mp3", gain: 1 },
    ],
  },
  808: {
    name: "Roland TR-808",
    suggestedBpm: 105,
    channels: [
      { id: "Bass", sample: "/assets/audio/808/808-bd-short.mp3", gain: 0.83 },
      { id: "Snare", sample: "/assets/audio/808/808-sd.mp3", gain: 1 },
      { id: "Hi-Hat Closed", sample: "/assets/audio/808/808-ch.mp3", gain: 0.21 },
      { id: "Hi-Hat Open", sample: "/assets/audio/808/808-oh.mp3", gain: 0.28 },
      { id: "Clap", sample: "/assets/audio/808/808-clap.mp3", gain: 0.85 },
      { id: "Cowbell", sample: "/assets/audio/808/808-cowbell.mp3", gain: 0.55 },
      { id: "Clave", sample: "/assets/audio/808/808-clav.mp3", gain: 0.31 },
      { id: "Rimshot", sample: "/assets/audio/808/808-rs.mp3", gain: 0.43 },
      { id: "High Tom", sample: "/assets/audio/808/808-ht.mp3", gain: 0.71 },
      { id: "Mid Tom", sample: "/assets/audio/808/808-mt.mp3", gain: 0.59 },
      { id: "Low Tom", sample: "/assets/audio/808/808-lt.mp3", gain: 0.71 },
    ],
  },
  linndrum: {
    name: "LinnDrum",
    suggestedBpm: 124,
    channels: [
      { id: "Bass", sample: "/assets/audio/linndrum/linn-bd.mp3", gain: 1 },
      { id: "Snare", sample: "/assets/audio/linndrum/linn-sd.mp3", gain: 0.65 },
      { id: "Hi-Hat Closed", sample: "/assets/audio/linndrum/linn-ch.mp3", gain: 0.1 },
      { id: "Hi-Hat Pedal", sample: "/assets/audio/linndrum/linn-ph.mp3", gain: 0.15 },
      { id: "Clap", sample: "/assets/audio/linndrum/linn-clap.mp3", gain: 0.44 },
      { id: "Cowbell", sample: "/assets/audio/linndrum/linn-cowbell.mp3", gain: 0.24 },
      { id: "Rimshot", sample: "/assets/audio/linndrum/linn-rim.mp3", gain: 0.43 },
      { id: "Tambourine", sample: "/assets/audio/linndrum/linn-tamb.mp3", gain: 0.28 },
      { id: "High Tom", sample: "/assets/audio/linndrum/linn-ht.mp3", gain: 0.26 },
      { id: "Mid Tom", sample: "/assets/audio/linndrum/linn-mt.mp3", gain: 0.27 },
      { id: "Low Tom", sample: "/assets/audio/linndrum/linn-lt.mp3", gain: 0.3 },
    ],
  },
  hiphop: {
    name: "Hip Hop",
    suggestedBpm: 98,
    channels: [
      { id: "Bass 1", sample: "/assets/audio/hip-hop/hip-hop-bd-1.mp3", gain: 1 },
      { id: "Snare 1", sample: "/assets/audio/hip-hop/hip-hop-sd-1.mp3", gain: 1 },
      { id: "Hi-Hat Closed 1", sample: "/assets/audio/hip-hop/hip-hop-ch-1.mp3", gain: 1 },
      { id: "Hi-Hat Open", sample: "/assets/audio/hip-hop/hip-hop-oh.mp3", gain: 0.33 },
      { id: "Snare 2", sample: "/assets/audio/hip-hop/hip-hop-sd-2.mp3", gain: 0.6 },
      { id: "Hi-Hat Closed 2", sample: "/assets/audio/hip-hop/hip-hop-ch-2.mp3", gain: 0.46 },
      { id: "Bass 2", sample: "/assets/audio/hip-hop/hip-hop-bd-2.mp3", gain: 1 },
    ],
  },
  acetone: {
    name: "Acetone Rhythm Ace",
    suggestedBpm: 140,
    channels: [
      { id: "Bass", sample: "/assets/audio/acetone/acetone-bd.mp3", gain: 1 },
      { id: "Snare Short", sample: "/assets/audio/acetone/acetone-sd-1.mp3", gain: 0.73 },
      { id: "Hi-Hat Closed", sample: "/assets/audio/acetone/acetone-ch.mp3", gain: 0.28 },
      { id: "Hi-Hat Open", sample: "/assets/audio/acetone/acetone-oh.mp3", gain: 0.46 },
      { id: "Percussion Low", sample: "/assets/audio/acetone/acetone-perc-1.mp3", gain: 0.45 },
      { id: "Percussion High", sample: "/assets/audio/acetone/acetone-perc-2.mp3", gain: 0.41 },
      { id: "Snare Long", sample: "/assets/audio/acetone/acetone-sd-2.mp3", gain: 0.7 },
    ],
  },
};

export const DEFAULT_KIT = "707";
export const CHANNEL_LIMIT = 20;
export const STEP_COUNT = 16;

// Factory for one board row: which sound it plays + its own step pattern.
// newUid is also used when hydrating a shared snapshot: uids from someone
// else's session would collide with this counter, so loaded rows get fresh ones.
let uid = 0;
export const newUid = () => `ch-${++uid}`;
export const newChannel = (kit, slot) => ({
  uid: newUid(),
  kit,
  slot,
  steps: Array(STEP_COUNT).fill(false),
  muted: false,
  solo: false,
});

// Look up the sample definition (label / URL / gain) a channel points at
export const sampleDef = (channel) => KITS[channel.kit].channels[channel.slot];

// Fetch + decode one sample into the shared cache (no-op if already cached)
export async function loadSample(audioCtx, sample, cache) {
  if (cache.has(sample)) return;
  const response = await fetch(sample);
  const arrayBuffer = await response.arrayBuffer();
  cache.set(sample, await audioCtx.decodeAudioData(arrayBuffer));
}

// Fetch + decode every sample of a kit once into the shared cache
export async function loadKitBuffers(audioCtx, kitId, cache) {
  await Promise.all(
    KITS[kitId].channels.map(({ sample }) => loadSample(audioCtx, sample, cache))
  );
}
