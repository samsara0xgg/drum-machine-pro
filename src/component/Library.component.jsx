import React, { useContext, useEffect, useState } from "react";
import { Context } from "../Context";
import { PRESETS } from "../service/presets";
import { savePattern } from "../service/api";

// Bottom-center toast; a new notice restarts the slide-up timer.
const Toast = () => {
  const { notice } = useContext(Context);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!notice) return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  return <div className={"Toast" + (show ? " is-show" : "")}>{notice && notice.msg}</div>;
};

// Name dialog opened by the header SAVE button; saves locally only.
const SaveDialog = () => {
  const { saveDialogOpen, setSaveDialogOpen, saveToLibrary, setDrawerOpen } =
    useContext(Context);
  const [name, setName] = useState("");

  if (!saveDialogOpen) return null;

  const save = () => {
    saveToLibrary(name.trim() || "untitled");
    setSaveDialogOpen(false);
    setName("");
    setDrawerOpen(true);
  };

  const cancel = () => {
    setSaveDialogOpen(false);
    setName("");
  };

  return (
    <div className="Library-dlgwrap">
      <div className="Library-dlg">
        <h3>Save pattern</h3>
        <input
          autoFocus
          maxLength={40}
          placeholder="Name this pattern"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            // ignore the Enter that just commits an IME composition
            if (e.key === "Enter" && !e.nativeEvent.isComposing) save();
          }}
        />
        <div className="Library-dlg__buttons">
          <button className="Header-button" onClick={cancel}>
            CANCEL
          </button>
          <button className="Header-button" onClick={save}>
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

const Library = () => {
  const {
    library,
    loadedId,
    drawerOpen,
    setDrawerOpen,
    deleteEntry,
    loadEntry,
    loadPreset,
    toast,
  } = useContext(Context);

  // Share one entry: POST its payload for a slug, then copy the link.
  const shareEntry = async (entry) => {
    try {
      const slug = await savePattern(entry.payload);
      const url = `${window.location.origin}/p/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast(<>Share link copied: <b>/p/{slug}</b></>);
      } catch {
        toast(`Share link: ${url}`);
      }
    } catch {
      toast("Share failed — is the server running?");
    }
  };

  const entryMeta = (entry) =>
    `${entry.payload.patterns[entry.payload.patternNum].kit} · ${entry.payload.bpm}`;

  return (
    <>
      <div
        className={"Library-overlay" + (drawerOpen ? " is-open" : "")}
        onClick={() => setDrawerOpen(false)}
      ></div>
      <aside className={"Library" + (drawerOpen ? " is-open" : "")}>
        <h2 className="Library-title">LIBRARY</h2>
        <div className="Library-group">Presets</div>
        {PRESETS.map((preset) => (
          <div
            key={preset.name}
            className="Library-entry"
            onClick={() => loadPreset(preset)}
          >
            <span className="Library-entry__name">{preset.name}</span>
            <span className="Library-entry__meta">{preset.meta}</span>
          </div>
        ))}
        <div className="Library-group">My Patterns</div>
        {library.length === 0 && (
          <div className="Library-empty">No saved patterns yet — hit SAVE to add one</div>
        )}
        {library.map((entry) => (
          <div
            key={entry.id}
            className={
              "Library-entry" + (entry.id === loadedId ? " is-active" : "")
            }
            onClick={() => loadEntry(entry.id)}
          >
            <span className="Library-entry__name">{entry.name}</span>
            <span className="Library-entry__meta">{entryMeta(entry)}</span>
            <button
              className="Library-entry__action"
              title="Copy share link"
              onClick={(e) => {
                e.stopPropagation();
                shareEntry(entry);
              }}
            >
              ⇪
            </button>
            <button
              className="Library-entry__action"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteEntry(entry.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </aside>
      <SaveDialog />
      <Toast />
    </>
  );
};
export default Library;
