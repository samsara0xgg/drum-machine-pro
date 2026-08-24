import React, { useContext } from "react";
import { Context } from "../Context";

// 12 patterns as hardware pads; the selected one lights up
const Pattern = () => {
  const { patterns, patternNum, setPatternNum } = useContext(Context);

  return (
    <div className="Machine-card">
      <div className="Pattern">
        {patterns.map((_, i) => (
          <button
            key={`pattern${i}`}
            className={
              "Pattern-pad" + (patternNum === i ? " Pattern-pad--on" : "")
            }
            onClick={() => setPatternNum(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
export default Pattern;
