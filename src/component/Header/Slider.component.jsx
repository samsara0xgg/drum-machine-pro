import React, { useState } from "react";

const Slider = (props) => {
  const [value, setValue] = useState(props.defaultValue);

  return (
    <div style={{ marginRight: "2vw" }}>
      <div className="sliderLabel">{props.label}</div>
      <input
        type="range"
        id={`range${props.id}`}
        min={props.min || "1"}
        max={props.max || "100"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default Slider;
