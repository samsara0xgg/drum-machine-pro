import React, { useContext } from "react";
import Knob from "./ControlPanel/Knob.component";
import SelectBox from "./ControlPanel/SelectBox.component";
import { Context } from "../Context";

const ControlPanel = () => {
  const {
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
    flashParam,
    flashBpm,
  } = useContext(Context);

  // TEMPO's home is the center readout, so it glows there instead of Part 1.
  const master = [
    { name: "TEMPO", min: 40, max: 200, step: 1, defaultValue: 120, value: bpm,
      onChange: (v) => { setBpm(v); flashBpm(); } },
    { name: "VOL", min: 0, max: 100, step: 1, defaultValue: 80, value: volume,
      onChange: (v) => { setVolume(v); flashParam("MASTER VOLUME", "" + v); } },
  ];
  const fx = [
    { name: "PITCH", min: -24, max: 24, step: 1, defaultValue: 0, value: pitch,
      onChange: (v) => { setPitch(v); flashParam("PITCH", (v > 0 ? "+" : "") + v + " ST"); } },
    { name: "PAN", min: -1, max: 1, step: 0.1, defaultValue: 0, value: pan,
      onChange: (v) => {
        setPan(v);
        flashParam("PAN", v === 0 ? "C" : (v < 0 ? "L " : "R ") + Math.round(Math.abs(v) * 100));
      } },
    { name: "REVERB", min: 0, max: 1, step: 0.01, defaultValue: 0, value: reverb,
      onChange: (v) => { setReverb(v); flashParam("REVERB", Math.round(v * 100) + "%"); } },
  ];

  return (
    <>
      <div className="Machine-card">
        <span className="Machine-card__label">MASTER</span>
        {master.map((knob) => (
          <Knob key={knob.name} {...knob} />
        ))}
      </div>
      <div className="Machine-card">
        <span className="Machine-card__label">FX</span>
        {fx.map((knob) => (
          <Knob key={knob.name} {...knob} />
        ))}
      </div>
      <div className="Machine-card">
        <span className="Machine-card__label">INSTRUMENT</span>
        <SelectBox />
      </div>
    </>
  );
};
export default ControlPanel;
