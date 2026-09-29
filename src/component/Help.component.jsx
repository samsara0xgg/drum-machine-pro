import React, { useEffect, useRef } from "react";
import { PRESETS } from "../service/presets";

// Mini pads for the legend, drawn like the grid's (see .Help-pad).
const Pad = ({ level = 2, roll = 1, note }) => (
  <span className="Help-pad" data-level={level} data-roll={roll} aria-hidden="true">
    {note}
  </span>
);

// The reference the "?" button opens: everything the tour leaves out, one
// module per section, plus the tour itself.
const Help = ({ open, onClose, onTour }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="Help-wrap" onClick={onClose}>
      <div
        className="Help"
        role="dialog"
        aria-modal="true"
        aria-label="Guide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Help-head">
          <h2 className="Help-title">GUIDE</h2>
          <button className="Header-button" onClick={onTour}>
            TAKE THE TOUR
          </button>
          <button ref={closeRef} className="Help-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <section className="Help-section">
          <h3>Start here</h3>
          <ol>
            <li>Open ☰ and pick a preset song: it plays at once and walks through its pads.</li>
            <li>Press ▶ on the screen (or Space) to play and pause your own beat.</li>
            <li>Click pads to light them; click a lit pad again to clear it.</li>
            <li>Pick a kit under INSTRUMENT, then SAVE the machine to your Library.</li>
          </ol>
        </section>

        <div className="Help-grid">
          <section className="Help-section">
            <h3>Pads</h3>
            <ul className="Help-legend">
              <li><Pad /> Lit: plays on that 16th</li>
              <li><Pad level={1} /> HIT SOFT: quiet, for ghost notes</li>
              <li><Pad level={3} /> HIT HARD: loud, bright rim</li>
              <li><Pad roll={4} /> ROLL 2-4: fires 2-4 times in its step, one slice per hit</li>
              <li><Pad note="~F1" /> 808 row: the note it plays, ~ slides in</li>
            </ul>
            <p>
              HIT and ROLL above the grid are brushes: new pads take their settings. A pad
              that already matches is cleared, any other is repainted. To take a roll off a
              pad, set ROLL to 1 and click the pad. While stopped, a pad plays once as it
              lights, so you can hear what you drew.
            </p>
          </section>

          <section className="Help-section">
            <h3>808 Bass</h3>
            <p>
              <b>+ 808 BASS</b> above the grid adds an 808 Bass row and its keyboard. Click a
              key to hear a note and choose it, then click pads on the 808 Bass row. SLIDE
              makes new notes glide in from the one before; DECAY sets the tail, DRIVE the
              grit, GLIDE the slide time.
            </p>
            <p>
              The same button hides or shows the keyboard. Delete the 808 Bass row (✕) to
              take the bass out.
            </p>
          </section>

          <section className="Help-section">
            <h3>Rows</h3>
            <p>
              Click a row's name to swap its sound for any kit's. The green dot mutes the
              row, the red dot solos it; rows that won't sound dim. Drag ≡ to reorder, ✕
              deletes. ADD CHANNEL+ adds rows, up to 20.
            </p>
          </section>

          <section className="Help-section">
            <h3>Knobs</h3>
            <p>
              Drag up or right to turn, double-click to reset; the screen shows the value.
              SWING pushes every second 16th late (50% is straight). FILTER turned left
              muffles the mix, right thins it, center is off. On phones the knobs are
              sliders.
            </p>
          </section>

          <section className="Help-section">
            <h3>Patterns and songs</h3>
            <p>
              12 pads, each with its own beat and kit. A preset song moves through its pads
              by itself; click a pad or edit the grid and it stays on that section. Load the
              preset again to hear the whole song. Click a step number above the grid to
              move the playhead there.
            </p>
          </section>

          <section className="Help-section">
            <h3>Library</h3>
            <p>
              ☰ holds {PRESETS.length} preset songs in different styles, each with what to
              listen for, and your saved patterns (kept in this browser). SAVE stores the
              whole machine, UPDATE overwrites the one you loaded, NEW starts blank, ⇪
              copies a share link.
            </p>
          </section>

          <section className="Help-section">
            <h3>Screen and glow</h3>
            <p>
              The screen shows the kit, pattern and tempo, the last knob you turned, and
              the live waveform. The machine's rim flashes with every kick.
            </p>
          </section>

          <section className="Help-section">
            <h3>Keys</h3>
            <p>
              <kbd>Space</kbd> play / pause. In the tour: <kbd>←</kbd> <kbd>→</kbd> to move,{" "}
              <kbd>Esc</kbd> to close.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Help;
