import React, { useEffect, useRef, useState } from "react";
import { AUTHOR, GMAIL, MAILTO, REPO } from "../service/site";
import { external } from "./Footer.component";

// CONTACT from the footer or the About sheet: the address with a copy
// button, then Gmail and the mail app to write from. A sheet drawn like
// the "?" guide.
const Contact = ({ open, onClose }) => {
  const closeRef = useRef(null);
  const addressRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Without clipboard access, select the address so Ctrl/Cmd+C copies it.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AUTHOR.email);
      setCopied(true);
    } catch {
      window.getSelection()?.selectAllChildren(addressRef.current);
    }
  };

  if (!open) return null;

  return (
    <div className="Help-wrap" onClick={onClose}>
      <div
        className="Help Contact"
        role="dialog"
        aria-modal="true"
        aria-label="Contact"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Help-head">
          <h2 className="Help-title">CONTACT</h2>
          <button ref={closeRef} className="Help-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="Contact-lead">
          Questions, bugs or ideas for the machine? Write to {AUTHOR.name}.
        </p>
        <div className="Contact-address">
          <span ref={addressRef} className="Contact-email">
            {AUTHOR.email}
          </span>
          <button className="Header-button" onClick={copy}>
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
        <div className="Contact-links">
          <a className="Header-button Contact-link" href={GMAIL} {...external}>
            WRITE IN GMAIL
          </a>
          <a className="Header-button Contact-link" href={MAILTO}>
            OPEN MAIL APP
          </a>
        </div>
        <p className="Contact-note">
          Or open an issue on{" "}
          <a href={`${REPO}/issues`} {...external}>
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Contact;
