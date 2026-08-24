import React, { useRef } from "react";
import knobImg from "./img/maschine-default.png";

const FRAMES = 31;

// Drag right/up to turn clockwise; double-click resets to the default.
const Knob = ({ name, min, max, step, value, defaultValue, onChange }) => {
  const drag = useRef(null);

  const clamp = (v) =>
    Number(
      Math.min(max, Math.max(min, Math.round(v / step) * step)).toFixed(2)
    );

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, startValue: value };
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    // Right and up both increase; 150px of drag covers the full range.
    const px = e.clientX - drag.current.x + (drag.current.y - e.clientY);
    const v = clamp(drag.current.startValue + (px / 150) * (max - min));
    // Only report real changes, so tiny jitters don't flash the screen.
    if (v !== value) onChange(v);
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  // The image is a 31-frame filmstrip; show the frame for the current value.
  const frame = Math.round(((value - min) / (max - min)) * (FRAMES - 1));

  return (
    <div className="ControlPanel-knob">
      <div
        className="ControlPanel-knob__dial"
        style={{
          backgroundImage: `url(${knobImg})`,
          backgroundPosition: `0 ${-frame * 40}px`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => onChange(defaultValue)}
        title={`${name}: ${value}`}
      />
      <div className="ControlPanel-knob__label">{name}</div>
    </div>
  );
};

export default Knob;
