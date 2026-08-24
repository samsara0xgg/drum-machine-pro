import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { customAlphabet } from "nanoid";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

// URL-friendly, no lookalike characters (0/O, 1/l/I, o)
const newSlug = customAlphabet(
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  8
);

// Structural validation only: shaped like machine state and bounded in size.
// Deliberately NOT checked against the kit registry — the server would need a
// copy that goes stale every time the frontend gains a kit.
const isStep = (s) => typeof s === "boolean";
const isChannel = (c) =>
  typeof c === "object" &&
  c !== null &&
  typeof c.kit === "string" &&
  c.kit.length <= 32 &&
  Number.isInteger(c.slot) &&
  c.slot >= 0 &&
  c.slot < 32 &&
  Array.isArray(c.steps) &&
  c.steps.length === 16 &&
  c.steps.every(isStep) &&
  typeof c.muted === "boolean" &&
  typeof c.solo === "boolean";
const isPattern = (p) =>
  typeof p === "object" &&
  p !== null &&
  typeof p.kit === "string" &&
  p.kit.length <= 32 &&
  Array.isArray(p.channels) &&
  p.channels.length <= 20 &&
  p.channels.every(isChannel);
const isValidPayload = (body) =>
  typeof body === "object" &&
  body !== null &&
  body.version === 1 &&
  typeof body.bpm === "number" &&
  body.bpm >= 30 &&
  body.bpm <= 300 &&
  Array.isArray(body.patterns) &&
  body.patterns.length >= 1 &&
  body.patterns.length <= 16 &&
  body.patterns.every(isPattern) &&
  Number.isInteger(body.patternNum) &&
  body.patternNum >= 0 &&
  body.patternNum < body.patterns.length;

const app = express();
app.use(cors());
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
});

app.post("/api/patterns", async (req, res) => {
  if (!isValidPayload(req.body)) {
    return res.status(400).json({ error: "invalid payload" });
  }
  // UNIQUE(slug) is the collision detector: insert, and on the (astronomically
  // rare) duplicate key error just roll a new slug and try again.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = newSlug();
    try {
      await pool.execute(
        "INSERT INTO patterns (slug, payload) VALUES (?, ?)",
        [slug, JSON.stringify(req.body)]
      );
      return res.status(201).json({ slug });
    } catch (err) {
      if (err.code !== "ER_DUP_ENTRY") throw err;
    }
  }
  res.status(500).json({ error: "could not allocate a slug" });
});

app.get("/api/patterns/:slug", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT payload FROM patterns WHERE slug = ?",
    [req.params.slug]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(rows[0].payload);
});

// Express 5 forwards rejected async handlers here
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`drum-machine-pro API listening on http://localhost:${port}`);
});
