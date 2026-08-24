# DRUM MACHINE PRO

A hardware-style 16-step drum machine with five classic kits,
real-time FX, and shareable patterns. Built with React and the Web Audio API.
Deployed on Vercel and Railway (API + MySQL).

**[Live demo](https://drum-machine-pro1.vercel.app/)**

## Features

- 16-step sequencer with 12 patterns and up to 20 channels, mute/solo, drag to reorder
- Five classic kits (TR-707, TR-808, LinnDrum, Acetone Rhythm Ace, hip hop),
  switchable mid-playback, with cross-kit channel mixing
- Master FX rack: pitch, pan, and convolution reverb
- Library drawer: save patterns locally, load built-in grooves, or share any pattern
  as a short link (`/p/xxxxxxxx`)

## Run locally

Requires Node and MySQL.

```
npm install
npm install --prefix server
mysql -u root -p < server/db/setup.sql
cp server/.env.example server/.env   # then fill in your DB password
npm run dev                          # frontend on :3000, proxies /api
npm run dev --prefix server          # API on :3001
```
