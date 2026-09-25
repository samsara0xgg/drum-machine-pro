import React from "react";

const BRUSHES = [
  { level: 1, label: "SOFT" },
  { level: 2, label: "MID" },
  { level: 3, label: "HARD" },
];

const Topbar = ({ currentStep, seekTo, stepIndices, brush, setBrush }) => {
  return (
    <main className="Board-TopBar">
      {/* velocity brush: clicked pads are drawn at this level */}
      <div className="Board-TopBar__channel Board-Brush" role="group" aria-label="Hit strength">
        {BRUSHES.map(({ level, label }) => (
          <button
            key={level}
            className={"Board-Brush__button" + (brush === level ? " is-active" : "")}
            data-level={level}
            aria-pressed={brush === level}
            title={`Draw ${label.toLowerCase()} hits`}
            onClick={() => setBrush(level)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="Board-TopBar__group">
        {stepIndices.map((i) => (
          <div
            key={i}
            className={
              "Board-TopBar__label" +
              (i === currentStep ? " Board-TopBar__label--now" : "")
            }
            onClick={() => seekTo(i)}
            title={`Jump to step ${i + 1}`}
          >
            {i + 1}
            <div className="Board-TopBar__led" />
          </div>
        ))}
      </div>
      {/* spacer matching the delete icon on channel rows, keeps columns aligned */}
      <span className="Board-TopBar__spacer"></span>
    </main>
    )
}

export default Topbar