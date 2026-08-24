import React, { useRef, useState } from "react";
import { DEFAULT_KIT, KITS, newChannel } from "./service/kits";

const Context = React.createContext();

const audioCtx = new AudioContext(); //Web Audio API
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);

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
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(80);
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
        switchKit,
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
