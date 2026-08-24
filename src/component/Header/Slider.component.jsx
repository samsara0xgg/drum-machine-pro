import React from "react";

// Fully controlled: the value lives in Context, this just renders it
const Slider = ({ label, min, max, value, onChange }) => {
  return (
    <div style={{ marginRight: "2vw" }}>
      <div className="sliderLabel">{label}</div>
      <input
        type="range"
        min={min || "1"}
        max={max || "100"}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

export default Slider;
