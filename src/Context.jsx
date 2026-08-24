import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_KIT, KITS, newChannel, newUid } from "./service/kits";
import { loadPattern } from "./service/api";

const Context = React.createContext();

const audioCtx = new AudioContext(); //Web Audio API
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);

// Reverb impulse: two seconds of decaying noise, generated in code.
const makeImpulse = (ctx, seconds = 2, decay = 3) => {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return buffer;
};

// Master FX chain: notes enter fxIn, pass the panner, then split dry/wet.
const fxIn = audioCtx.createGain();
const panNode = audioCtx.createStereoPanner();
const convolver = audioCtx.createConvolver();
convolver.buffer = makeImpulse(audioCtx);
const dryGain = audioCtx.createGain();
const wetGain = audioCtx.createGain();
wetGain.gain.value = 0;
fxIn.connect(panNode);
panNode.connect(dryGain);
panNode.connect(convolver);
dryGain.connect(masterGain);
convolver.connect(wetGain);
wetGain.connect(masterGain);

const PATTERN_COUNT = 12;
const DEFAULT_CHANNEL_COUNT = 6;

const ContextProvider = ({ children }) => {
  // 12 independent patterns; each owns its kit and its channel rows:
  // { kit, channels: [{ uid, kit, slot, steps, muted, solo }] }
  // (rows carry their own kit too, so cross-kit mixing per row is allowed)
  const [patterns, setPatterns] = useState(() =>
    [...Array(PATTERN_COUNT)].map(() => ({
      kit: DEFAULT_KIT,
      channels: [...Array(DEFAULT_CHANNEL_COUNT)].map((_, slot) =>
        newChannel(DEFAULT_KIT, slot)
      ),
    }))
  );

  const [patternNum, setPatternNum] = useState(0);
  // Step the playhead is on right now (-1 = stopped); driven by the audio
  // engine's draw queue so visuals track what is actually sounding.
  const [currentStep, setCurrentStep] = useState(-1);
  // Transport position: the next step the scheduler will play. A ref so the
  // running scheduler reads it live — seeking is just writing to it.
  const nextStepRef = useRef(0);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(80);
  const [pitch, setPitch] = useState(0);
  const [pan, setPan] = useState(0);
  const [reverb, setReverb] = useState(0);

  useEffect(() => {
    panNode.pan.value = pan;
  }, [pan]);

  useEffect(() => {
    dryGain.gain.value = 1 - reverb;
    wetGain.gain.value = reverb;
  }, [reverb]);
  const [started, setStarted] = useState(false);

  // The kit "loaded" into the pattern currently being viewed/edited
  const currentKit = patterns[patternNum].kit;

  // Load a kit into the CURRENT pattern only: rows on the pattern's base kit
  // re-point at the new kit's sound in the same slot, so the drawn groove
  // survives with new flavor. Rows deliberately borrowed from another kit
  // keep their sound. Other patterns keep their own kits untouched.
  const switchKit = (kitId) => {
    setPatterns((prev) =>
      prev.map((pattern, i) =>
        i === patternNum
          ? {
              kit: kitId,
              channels: pattern.channels.map((channel) =>
                channel.kit === pattern.kit
                  ? {
                      ...channel,
                      kit: kitId,
                      slot: channel.slot % KITS[kitId].channels.length,
                    }
                  : channel
              ),
            }
          : pattern
      )
    );
  };

  // Jump the transport to a step (DAW ruler-click "locate"). While playing the
  // scheduler picks it up within one lookahead tick; while paused, move the
  // frozen playhead there too so the jump is visible.
  const seekTo = (step) => {
    nextStepRef.current = step;
    if (!started) setCurrentStep(step);
  };

  // Replace the whole machine state with a shared snapshot. Fields are picked
  // explicitly (junk dropped), and every row gets a fresh uid — uids minted in
  // the sharer's session would collide with this session's counter.
  const hydrate = (payload) => {
    if (!payload || payload.version !== 1) return false;
    setPatterns(
      payload.patterns.map((pattern) => ({
        kit: pattern.kit,
        channels: pattern.channels.map((c) => ({
          uid: newUid(),
          kit: c.kit,
          slot: c.slot,
          steps: c.steps,
          muted: c.muted,
          solo: c.solo,
        })),
      }))
    );
    setPatternNum(payload.patternNum);
    setBpm(payload.bpm);
    // FX fields are optional and clamped; older links just get the defaults.
    const num = (v, min, max, dflt) =>
      typeof v === "number" ? Math.min(max, Math.max(min, v)) : dflt;
    setPitch(num(payload.pitch, -24, 24, 0));
    setPan(num(payload.pan, -1, 1, 0));
    setReverb(num(payload.reverb, 0, 1, 0));
    return true;
  };

  // Visiting a share link (/p/:slug) loads that snapshot on boot; any failure
  // (unknown slug, server down) falls back silently to the default machine.
  useEffect(() => {
    const match = window.location.pathname.match(/^\/p\/([2-9A-Za-z]{8})$/);
    if (!match) return;
    loadPattern(match[1])
      .then((payload) => {
        if (!hydrate(payload)) window.history.replaceState(null, "", "/");
      })
      .catch(() => window.history.replaceState(null, "", "/"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Decoded AudioBuffers, keyed by sample URL. A ref because loading a sample
  // should not re-render the app; consumers read it at play time.
  const buffersRef = useRef(new Map());

  return (
    <Context.Provider
      value={{
        patterns,
        setPatterns,
        patternNum,
        setPatternNum,
        currentStep,
        setCurrentStep,
        nextStepRef,
        seekTo,
        currentKit,
        switchKit,
        bpm,
        setBpm,
        volume,
        setVolume,
        pitch,
        setPitch,
        pan,
        setPan,
        reverb,
        setReverb,
        fxIn,
        started,
        setStarted,
        audioCtx,
        masterGain,
        buffersRef,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { ContextProvider, Context };
