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
const LIBRARY_KEY = "drum-machine-library";

// Read the saved library, dropping anything that isn't a usable entry.
const readLibrary = () => {
  try {
    const list = JSON.parse(localStorage.getItem(LIBRARY_KEY));
    if (!Array.isArray(list)) return [];
    return list.filter((m) => m && m.payload && Array.isArray(m.payload.patterns));
  } catch {
    return [];
  }
};

// The blank machine: 12 patterns on the default kit with 6 default rows each.
const defaultPatterns = () =>
  [...Array(PATTERN_COUNT)].map(() => ({
    kit: DEFAULT_KIT,
    channels: [...Array(DEFAULT_CHANNEL_COUNT)].map((_, slot) =>
      newChannel(DEFAULT_KIT, slot)
    ),
  }));

const ContextProvider = ({ children }) => {
  // 12 independent patterns; each owns its kit and its channel rows:
  // { kit, channels: [{ uid, kit, slot, steps, muted, solo }] }
  // (rows carry their own kit too, so cross-kit mixing per row is allowed)
  const [patterns, setPatterns] = useState(defaultPatterns);

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
  // The tempo follows the kit's suggested BPM.
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
    setBpm(KITS[kitId].suggestedBpm);
  };

  // ---- Library: named machine snapshots kept in localStorage ----
  const [library, setLibrary] = useState(readLibrary);
  // Which of "my patterns" is currently loaded (enables the UPDATE button).
  const [loadedId, setLoadedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Bottom toast message; a fresh object each time so the timer restarts.
  const [notice, setNotice] = useState(null);
  const toast = (msg) => setNotice({ msg });

  // Part 1 of the screen: the latest param change to show there; a fresh
  // object each time so Display's 1.2s fade timer restarts.
  const [paramFlash, setParamFlash] = useState(null);
  const flashParam = (name, text) => setParamFlash({ name, text, ts: Date.now() });

  // Tempo lives in the center readout instead, so it glows there.
  const [bpmFlash, setBpmFlash] = useState(null);
  const flashBpm = () => setBpmFlash({ ts: Date.now() });

  // Keep the library mirrored in localStorage; storage may be blocked or full.
  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch {}
  }, [library]);

  // Another tab saved the library: adopt its version instead of clobbering it.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LIBRARY_KEY) setLibrary(readLibrary());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // The machine state that library entries and share links both capture.
  const snapshot = () => ({
    version: 1,
    bpm,
    pitch,
    pan,
    reverb,
    patternNum,
    patterns,
  });

  const saveToLibrary = (name) => {
    const entry = { id: Date.now(), name, savedAt: Date.now(), payload: snapshot() };
    setLibrary([...library, entry]);
    setLoadedId(entry.id);
    toast(<>Saved to Library: <b>{name}</b></>);
  };

  // Overwrite the loaded entry with the machine as it sounds now.
  const updateLibrary = () => {
    const entry = library.find((m) => m.id === loadedId);
    if (!entry) return;
    setLibrary(
      library.map((m) =>
        m.id === loadedId ? { ...m, savedAt: Date.now(), payload: snapshot() } : m
      )
    );
    toast(<>Updated <b>{entry.name}</b></>);
  };

  const deleteEntry = (id) => {
    const entry = library.find((m) => m.id === id);
    if (!entry) return;
    setLibrary(library.filter((m) => m.id !== id));
    if (loadedId === id) setLoadedId(null);
    toast(<>Deleted <b>{entry.name}</b></>);
  };

  const loadEntry = (id) => {
    const entry = library.find((m) => m.id === id);
    if (!entry || !hydrate(entry.payload)) return;
    setLoadedId(id);
    toast(<>Loaded <b>{entry.name}</b></>);
  };

  // Presets are built-in, so they never enable UPDATE.
  const loadPreset = (preset) => {
    if (!hydrate(preset.payload)) return;
    setLoadedId(null);
    toast(<>Loaded preset <b>{preset.name}</b></>);
  };

  // NEW: back to the blank default machine.
  const newMachine = () => {
    setPatterns(defaultPatterns());
    setPatternNum(0);
    setBpm(120);
    setPitch(0);
    setPan(0);
    setReverb(0);
    setLoadedId(null);
    toast("Reset to a blank machine");
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
    // Numeric fields are clamped to their controls' ranges; missing FX
    // fields (older links) just get the defaults.
    const num = (v, min, max, dflt) =>
      typeof v === "number" ? Math.min(max, Math.max(min, v)) : dflt;
    setBpm(num(payload.bpm, 40, 200, 120));
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
        library,
        loadedId,
        drawerOpen,
        setDrawerOpen,
        saveDialogOpen,
        setSaveDialogOpen,
        saveToLibrary,
        updateLibrary,
        deleteEntry,
        loadEntry,
        loadPreset,
        newMachine,
        notice,
        toast,
        paramFlash,
        flashParam,
        bpmFlash,
        flashBpm,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { ContextProvider, Context };
