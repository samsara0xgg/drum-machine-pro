import React, { useEffect, useRef, useState } from "react";
import { AUTHOR, FORM_ENDPOINT, MAIL_TAG } from "../service/site";

const EMPTY = { email: "", subject: "", message: "", honey: "" };

// CONTACT from the footer or the About sheet: a message form that lands in
// Yilun's inbox with a tagged subject, and the address to copy for anyone
// who'd rather write from their own mail. A sheet drawn like the "?" guide.
const Contact = ({ open, onClose }) => {
  const closeRef = useRef(null);
  const addressRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  // idle | sending | sent | error
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    // A draft survives closing the sheet; a sent message starts a fresh one.
    if (status === "sent") {
      setForm(EMPTY);
      setStatus("idle");
    }
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const field = (name) => ({
    name,
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  });

  const send = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `${MAIL_TAG} ${form.subject.trim() || "Message from the site"}`,
          _replyto: form.email.trim() || undefined,
          _template: "table",
          _honey: form.honey,
          from: form.email.trim() || "(not given)",
          message: form.message,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || String(data.success) !== "true") {
        throw new Error(data.message || "The message didn't go through.");
      }
      setStatus("sent");
    } catch (err) {
      // fetch itself only throws when the mail service can't be reached
      setError(err instanceof TypeError ? "Couldn't reach the mail service." : err.message);
      setStatus("error");
    }
  };

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

        {status === "sent" ? (
          <div className="Contact-sent" role="status">
            <b>Sent. Thanks!</b>
            <p>
              {AUTHOR.name} will read it soon
              {form.email.trim() ? ` and can reply to ${form.email.trim()}` : ""}.
            </p>
          </div>
        ) : (
          <form className="Contact-form" onSubmit={send}>
            <p className="Contact-lead">
              Questions, bugs or ideas for the machine? Send {AUTHOR.name} a message.
            </p>
            <label className="Contact-field">
              <span>Your email</span>
              <input type="email" placeholder="Optional, for a reply" {...field("email")} />
            </label>
            <label className="Contact-field">
              <span>Subject</span>
              <input type="text" maxLength={120} {...field("subject")} />
            </label>
            <label className="Contact-field">
              <span>Message</span>
              <textarea rows={5} required maxLength={5000} {...field("message")} />
            </label>
            {/* a field people never see; bots that fill it are dropped */}
            <input
              className="Contact-honey"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              {...field("honey")}
            />
            {status === "error" && (
              <p className="Contact-error" role="alert">
                {error} Try again, or write to the address below.
              </p>
            )}
            <div className="Contact-actions">
              <button
                type="submit"
                className="Header-button Contact-send"
                disabled={status === "sending" || !form.message.trim()}
              >
                {status === "sending" ? "SENDING…" : "SEND"}
              </button>
            </div>
          </form>
        )}

        <div className="Contact-direct">
          <span>Or write to</span>
          <span ref={addressRef} className="Contact-email">
            {AUTHOR.email}
          </span>
          <button className="Header-button Contact-copy" onClick={copy}>
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
