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
      <svg t="1598061086726" className="Board-Channel__delete" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5710" width="16" height="16"><path d="M989.431954 201.728L679.159954 512l310.272 310.272a118.198857 118.198857 0 0 1-167.058285 167.131429L512.028526 679.058286l-310.345143 310.345143A117.76 117.76 0 0 1 118.15424 1024a118.198857 118.198857 0 0 1-83.529143-201.728L344.897097 512 34.625097 201.728A118.125714 118.125714 0 0 1 201.683383 34.596571L512.028526 344.868571 822.300526 34.596571a118.198857 118.198857 0 0 1 167.131428 167.131429z" p-id="5711" fill="#000000"></path></svg>

        </main>
    )
}

export default Topbar