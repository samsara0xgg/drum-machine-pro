// Synthesized 808 bass. One mono voice, like the hardware: a new note cuts
// the one before, and a slide note glides the running voice to its pitch
// instead of restarting it. Each hit is a sine that starts high and drops
// onto the note (the punch), then fades out on a long exponential tail.
// A tanh drive adds the harmonics that let the sub reach small speakers.

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const LOWEST_NOTE = 24; // C1
export const HIGHEST_NOTE = 47; // B2
export const DEFAULT_NOTE = 36; // C2

export const noteName = (midi) => NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
export const parseNote = (name) => {
  const match = /^([A-G]#?)(\d)$/.exec(name);
  if (!match) throw new Error(`Not a note: ${name}`);
  return NAMES.indexOf(match[1]) + (Number(match[2]) + 1) * 12;
};
export const isBlackKey = (midi) => NAMES[midi % 12].length > 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

const ATTACK = 0.003; // click-free onset
const PUNCH = 3; // a hit starts this many times above its note...
const PUNCH_TIME = 0.04; // ...and drops onto it this fast
const RELEASE = 0.006; // how fast a cut note fades, short but click-free
const RESTRIKE = 0.01; // a slide's re-accent
const DRIVE_RANGE = 10; // the shaper curve spans tanh over +-10

// tanh over [-DRIVE_RANGE, DRIVE_RANGE]; the drive gain scales the signal
// into that window, so the output is tanh(signal * pre-gain).
const driveCurve = () => {
  const curve = new Float32Array(2048);
  for (let i = 0; i < curve.length; i++) {
    curve[i] = Math.tanh(((i / (curve.length - 1)) * 2 - 1) * DRIVE_RANGE);
  }
  return curve;
};

// DRIVE 0-100 -> pre-gain 0.6 (nearly clean) to 10 (heavy), with makeup
// gain so a full-scale hit peaks at the same level either way.
export const driveGains = (amount) => {
  const pre = 0.6 + (amount / 100) * 9.4;
  return { input: pre / DRIVE_RANGE, makeup: 1 / Math.tanh(pre) };
};

export const createBass = (ctx, output) => {
  const drive = new GainNode(ctx);
  const shaper = new WaveShaperNode(ctx, { curve: driveCurve(), oversample: "4x" });
  const makeup = new GainNode(ctx);
  // tames the fizz heavy drive adds up top
  const tone = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 6000, Q: 0.5 });
  drive.connect(shaper).connect(makeup).connect(tone).connect(output);

  let voice = null;

  // The running voice's gain at time t (the attack is too short to matter).
  const gainAt = (v, t) =>
    t <= v.decayFrom ? v.peak : v.peak * Math.exp(-(t - v.decayFrom) / v.tau);

  const release = (v, t) => {
    v.amp.gain.cancelScheduledValues(t);
    v.amp.gain.setValueAtTime(gainAt(v, t), t);
    v.amp.gain.linearRampToValueAtTime(0, t + RELEASE);
    v.osc.stop(t + RELEASE + 0.01);
  };

  return {
    setDrive(amount) {
      const { input, makeup: level } = driveGains(amount);
      drive.gain.setTargetAtTime(input, ctx.currentTime, 0.02);
      makeup.gain.setTargetAtTime(level, ctx.currentTime, 0.02);
    },

    // Calls must come in time order (the scheduler's are). decay and glide
    // are in seconds; slide glides the running voice instead of cutting it.
    play(t, midi, peak, { decay, glide, slide }) {
      const f = hz(midi);
      const tau = decay / 5; // ~99% faded after decay seconds

      if (slide && voice && voice.end > t) {
        const v = voice;
        v.osc.frequency.cancelScheduledValues(t);
        v.osc.frequency.setValueAtTime(v.freq, t);
        v.osc.frequency.exponentialRampToValueAtTime(f, t + glide);
        v.amp.gain.cancelScheduledValues(t);
        v.amp.gain.setValueAtTime(gainAt(v, t), t);
        v.amp.gain.linearRampToValueAtTime(peak, t + RESTRIKE);
        v.amp.gain.setTargetAtTime(0, t + RESTRIKE, tau);
        Object.assign(v, { freq: f, peak, tau, decayFrom: t + RESTRIKE, end: t + RESTRIKE + decay });
        v.osc.stop(v.end + 0.05); // a later stop() replaces the earlier one
        return;
      }

      if (voice && voice.end > t) release(voice, t);
      const osc = new OscillatorNode(ctx);
      osc.frequency.setValueAtTime(f * PUNCH, t);
      osc.frequency.exponentialRampToValueAtTime(f, t + PUNCH_TIME);
      const amp = new GainNode(ctx, { gain: 0 });
      amp.gain.setValueAtTime(0, t);
      amp.gain.linearRampToValueAtTime(peak, t + ATTACK);
      amp.gain.setTargetAtTime(0, t + ATTACK, tau);
      osc.connect(amp).connect(drive);
      osc.start(t);
      const end = t + ATTACK + decay;
      osc.stop(end + 0.05);
      voice = { osc, amp, freq: f, peak, tau, decayFrom: t + ATTACK, end };
    },

    // Pause: fade out whatever is ringing (or scheduled).
    stop(t = ctx.currentTime) {
      if (voice && voice.end > t) release(voice, t);
      voice = null;
    },
  };
};
