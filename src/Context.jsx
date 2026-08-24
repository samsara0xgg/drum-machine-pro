import React, { useRef, useState } from "react";
import { DEFAULT_KIT, newChannel } from "./service/kits";

const Context = React.createContext();

const audioCtx = new AudioContext(); //Web Audio API
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);

const PATTERN_COUNT = 12;
const DEFAULT_CHANNEL_COUNT = 6;

const ContextProvider = ({ children }) => {
  // 12 patterns; each pattern is a list of channels { uid, kit, slot, steps, muted, solo }
  const [patterns, setPatterns] = useState(() =>
    [...Array(PATTERN_COUNT)].map(() =>
      [...Array(DEFAULT_CHANNEL_COUNT)].map((_, slot) =>
        newChannel(DEFAULT_KIT, slot)
      )
    )
  );

  const [patternNum, setPatternNum] = useState(0);
  const [currentKit, setCurrentKit] = useState(DEFAULT_KIT);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(80);
  const [started, setStarted] = useState(false);

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
        currentKit,
        setCurrentKit,
        bpm,
        setBpm,
        volume,
        setVolume,
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
