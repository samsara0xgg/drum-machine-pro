import React, { useEffect, useRef, useState } from "react";
import { AUTHOR, FORM_ACTION, FORM_ENDPOINT, MAIL_TAG } from "../service/site";

const EMPTY = { email: "", subject: "", message: "", honey: "" };

// CONTACT from the footer or the About sheet: a message form that lands in
// Yilun's inbox with a tagged subject, and the address to copy for anyone
// who'd rather write from their own mail. A sheet drawn like the "?" guide.
const Contact = ({ open, onClose }) => {
  const closeRef = useRef(null);
  const addressRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  // idle | sending | sent | handed-off | error
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  // The background send couldn't reach FormSubmit: SEND now posts the form
  // itself into a new tab instead.
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    // A draft survives closing the sheet; a sent message starts a fresh one.
    if (status === "sent" || status === "handed-off") {
      setForm(EMPTY);
      setStatus("idle");
    }
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });
  const replyTo = form.email.trim();
  const subject = `${MAIL_TAG} ${form.subject.trim() || "Message from the site"}`;

  const send = async (e) => {
    if (fallback) {
      // Let the browser post the form into a new tab. The form must still be
      // on the page when it does, so it's swapped for the note a tick later.
      setTimeout(() => setStatus("handed-off"), 0);
      return;
    }
    e.preventDefault();
    setStatus("sending");
    setError("");
    // Form-encoded with only an Accept header: a "simple" cross-site
    // request, so the browser sends it without a CORS preflight first.
    const body = new URLSearchParams({
      _subject: subject,
      _template: "table",
      _honey: form.honey,
      from: replyTo || "(not given)",
      message: form.message,
    });
    if (replyTo) body.set("_replyto", replyTo);
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || String(data.success) !== "true") {
        throw new Error(data.message || "The message didn't go through.");
      }
      setStatus("sent");
    } catch (err) {
      // fetch itself only throws when the mail service can't be reached
      if (err instanceof TypeError) {
        setFallback(true);
        setError("Couldn't send from this page. SEND again to finish in a new tab.");
      } else {
        setError(`${err.message} Try again, or write to the address below.`);
      }
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

        {status === "sent" || status === "handed-off" ? (
          <div className="Contact-sent" role="status">
            {status === "sent" ? (
              <>
                <b>Sent. Thanks!</b>
                <p>
                  {AUTHOR.name} will read it soon
                  {replyTo ? ` and can reply to ${replyTo}` : ""}.
                </p>
              </>
            ) : (
              <>
                <b>Almost there</b>
                <p>Your message opened in a new tab; finish sending it there.</p>
              </>
            )}
          </div>
        ) : (
          <form
            className="Contact-form"
            action={FORM_ACTION}
            method="POST"
            target="_blank"
            onSubmit={send}
          >
            <p className="Contact-lead">
              Questions, bugs or ideas for the machine? Send {AUTHOR.name} a message.
            </p>
            <label className="Contact-field">
              <span>Your email</span>
              <input
                type="email"
                name="from"
                placeholder="Optional, for a reply"
                {...bind("email")}
              />
            </label>
            <label className="Contact-field">
              <span>Subject</span>
              <input type="text" maxLength={120} {...bind("subject")} />
            </label>
            <label className="Contact-field">
              <span>Message</span>
              <textarea name="message" rows={5} required maxLength={5000} {...bind("message")} />
            </label>
            {/* what FormSubmit reads when the form posts itself */}
            <input type="hidden" name="_subject" value={subject} />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            {replyTo && <input type="hidden" name="_replyto" value={replyTo} />}
            {/* a field people never see; bots that fill it are dropped */}
            <input
              className="Contact-honey"
              type="text"
              name="_honey"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              {...bind("honey")}
            />
            {status === "error" && (
              <p className="Contact-error" role="alert">
                {error}
              </p>
            )}
            <div className="Contact-actions">
              <button
                type="submit"
                className="Header-button Contact-send"
                disabled={status === "sending" || !form.message.trim()}
              >
                {status === "sending" ? "SENDING…" : fallback ? "SEND IN A NEW TAB" : "SEND"}
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
