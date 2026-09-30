import React, { useEffect, useRef } from "react";
import { AUTHOR, REPO } from "../service/site";
import { GitHubMark, external } from "./Footer.component";

// The footer's ABOUT: who made the machine, what it is, and how to reach
// them. A sheet drawn like the "?" guide.
const About = ({ open, onClose, onContact }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="Help-wrap" onClick={onClose}>
      <div
        className="Help About"
        role="dialog"
        aria-modal="true"
        aria-label="About"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Help-head">
          <h2 className="Help-title">ABOUT</h2>
          <button ref={closeRef} className="Help-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="About-card">
          <img className="About-avatar" src={AUTHOR.avatar} alt="" width="56" height="56" />
          <div>
            <div className="About-name">{AUTHOR.name}</div>
            <div className="About-bio">{AUTHOR.bio}</div>
          </div>
        </div>
        <div className="About-links">
          <a className="Header-button About-link" href={AUTHOR.github} {...external}>
            <GitHubMark />@{AUTHOR.handle}
          </a>
          <a className="Header-button About-link" href={REPO} {...external}>
            SOURCE CODE
          </a>
          <button className="Header-button About-link" onClick={onContact}>
            CONTACT
          </button>
        </div>

        <section className="Help-section">
          <h3>The machine</h3>
          <p>
            Drum Machine Pro is a 16-step drum machine that runs in the browser, laid out
            like a hardware groovebox. Draw a beat on the pads, pick one of five classic
            kits, add an 808 bassline, shape the mix with swing and FX, then chain 12
            patterns into a song and share it as a link.
          </p>
        </section>

        <section className="Help-section">
          <h3>Built with</h3>
          <p>
            React and the Web Audio API. The drums are samples of classic machines, the
            808 bass is synthesized as it plays, and the reverb and filter run on the
            audio graph. Share links are stored by a small Express and MySQL API.
          </p>
        </section>

        <section className="Help-section">
          <h3>Feedback</h3>
          <p>
            Found a bug, or have an idea for the machine? Write through CONTACT above, or
            open an issue on{" "}
            <a href={`${REPO}/issues`} {...external}>
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
