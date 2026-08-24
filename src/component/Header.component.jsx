import React, { useContext } from "react";
import Slider from "./Header/Slider.component";
import { Context } from "../Context";

const Header = () => {
  const {
    bpm,
    setBpm,
    volume,
    setVolume,
    library,
    loadedId,
    setDrawerOpen,
    setSaveDialogOpen,
    updateLibrary,
    newMachine,
  } = useContext(Context);

  // UPDATE only makes sense while one of "my patterns" is loaded.
  const loaded = library.find((m) => m.id === loadedId);

  return (
    <div className="Header">
      <button
        className="Header-burger"
        title="Library"
        onClick={() => setDrawerOpen(true)}
      >
        <i></i>
        <i></i>
        <i></i>
      </button>
      <Slider label="volume" value={volume} onChange={setVolume} />
      <Slider label="BPM" min="40" max="200" value={bpm} onChange={setBpm} />
      <div className="Header-grow"></div>
      <button className="Header-button" onClick={() => setSaveDialogOpen(true)}>
        SAVE
      </button>
      <button className="Header-button" onClick={newMachine}>
        NEW
      </button>
      <button
        className="Header-button"
        disabled={!loaded}
        title={loaded ? `Overwrite "${loaded.name}"` : "Load one of your patterns first"}
        onClick={updateLibrary}
      >
        UPDATE
      </button>
    </div>
  );
};
export default Header;
