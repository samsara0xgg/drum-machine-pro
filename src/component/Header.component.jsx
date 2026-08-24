import React, { useContext } from "react";
import { Context } from "../Context";

const Header = () => {
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
