import React, {  useEffect } from 'react'
import knob from './img/maschine-default.png'


const Knob = ({info}) => {

  const {name,max,min,step,value} = info
/* 
  const [val, setVal] = useState(70)
 */
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://g200kg.github.io/webaudio-controls/webaudio-controls.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  /* useEffect(() => {
    document.getElementById("knob1").addEventListener("input", (event) => {
      setVal(event.target.value)
    });
  }, [val])
 */
  return (
    <div className="ControlPanel-knob">
      <webaudio-knob
        value={value}
        id="knob1"
        diameter="40"
        step={step}
        max={max}
        min={min}
        tooltip="%s"
        src={knob}
      />
      <div className="ControlPanel-knob__label">{name}</div>
    </div>
  )
}


export default Knob