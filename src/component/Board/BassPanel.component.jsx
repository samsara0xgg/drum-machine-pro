import React, { useContext } from "react";
import Knob from "../ControlPanel/Knob.component";
import { Context } from "../../Context";
import { ensureAudioReady } from "../../service/audio";
import { HIGHEST_NOTE, LOWEST_NOTE, isBlackKey, noteName } from "../../service/bass808";

const KEYS = Array.from({ length: HIGHEST_NOTE - LOWEST_NOTE + 1 }, (_, i) => LOWEST_NOTE + i);
const WHITE = 21; // white key width + gap, px (matches .Bass808__key)

// Shown while the pattern has an 808 row: the note brush as a two-octave
// keyboard (a key also plays its note, so lines can be picked by ear), the
// SLIDE brush, and the voice's DECAY / DRIVE / GLIDE.
const BassPanel = ({ note, setNote, slide, setSlide }) => {
  const {
    audioCtx,
    bass,
    pitch,
    bassDecay,
    setBassDecay,
    bassDrive,
    setBassDrive,
    bassGlide,
    setBassGlide,
    flashParam,
  } = useContext(Context);

  const audition = (midi) => {
    setNote(midi);
    // resume() has to start inside the click (iOS)
    ensureAudioReady(audioCtx)
      .then(() =>
        bass.play(audioCtx.currentTime + 0.01, midi + pitch, 0.9, {
          decay: bassDecay,
          glide: bassGlide / 1000,
          slide: false,
        })
      )
      .catch(() => {});
  };

  const knobs = [
    { name: "DECAY", min: 0.1, max: 3, step: 0.05, defaultValue: 0.9, value: bassDecay,
      onChange: (v) => { setBassDecay(v); flashParam("808 DECAY", v.toFixed(2) + " S"); } },
    { name: "DRIVE", min: 0, max: 100, step: 1, defaultValue: 30, value: bassDrive,
      onChange: (v) => { setBassDrive(v); flashParam("808 DRIVE", v + "%"); } },
    { name: "GLIDE", min: 10, max: 300, step: 5, defaultValue: 80, value: bassGlide,
      onChange: (v) => { setBassGlide(v); flashParam("808 GLIDE", v + " MS"); } },
  ];

  let whites = 0;
  return (
    <div className="Bass808">
      <span className="Bass808__label">808 BASS</span>
      <div className="Bass808__keys" role="group" aria-label="Note">
        {KEYS.map((midi) => {
          const black = isBlackKey(midi);
          const style = black ? { left: whites * WHITE - 7 } : undefined;
          if (!black) whites += 1;
          return (
            <button
              key={midi}
              className={
                "Bass808__key" + (black ? " is-black" : "") + (midi === note ? " is-active" : "")
              }
              style={style}
              aria-label={noteName(midi)}
              aria-pressed={midi === note}
              onClick={() => audition(midi)}
            >
              {midi % 12 === 0 ? noteName(midi) : ""}
            </button>
          );
        })}
      </div>
      <button
        className={"Board-Brush__button Bass808__slide" + (slide ? " is-active" : "")}
        aria-pressed={Boolean(slide)}
        title="Paint notes that glide in from the note before"
        onClick={() => setSlide(slide ? 0 : 1)}
      >
        SLIDE
      </button>
      <div className="Bass808__knobs">
        {knobs.map((knob) => (
          <Knob key={knob.name} {...knob} />
        ))}
      </div>
    </div>
  );
};

export default BassPanel;
