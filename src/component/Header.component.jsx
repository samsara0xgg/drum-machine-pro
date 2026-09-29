import React, { useContext } from "react";
import { Context } from "../Context";

const Header = ({ onHelp }) => {
  const {
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
      <span className="Header-brand">DRUM MACHINE PRO</span>
      <div className="Header-grow"></div>
      <button
        className="Header-button Header-save"
        title="Store the whole machine in the Library"
        onClick={() => setSaveDialogOpen(true)}
      >
        SAVE
      </button>
      <button className="Header-button" title="Start from a blank machine" onClick={newMachine}>
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
      <button
        className="Header-button Header-help"
        title="Guide: every control, and the tour"
        aria-label="Guide"
        onClick={onHelp}
      >
        ?
      </button>
    </div>
  );
};
export default Header;
