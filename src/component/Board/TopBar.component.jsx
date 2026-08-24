import React from "react";

const Topbar = ({ currentStep, seekTo }) => {
  return (
    <main className="Board-TopBar">
      <div className="Board-TopBar__channel">Channel</div>
      <div className="Board-TopBar__group">
        {Array.from({ length: 16 }, (_, i) => (
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