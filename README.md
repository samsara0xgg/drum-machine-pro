# DRUM MACHINE PRO

A hardware-style 16-step drum machine with five classic kits, a synthesized
808 bass, real-time FX, and shareable patterns. Built with React and the Web
Audio API. Deployed on Vercel and Railway (API + MySQL).

**[Live demo](https://drum-machine-pro1.vercel.app/)**

## Features

- Power-on intro: the machine boots, writes a 140 BPM trap demo onto the pads and
  plays it as a song across six patterns (filter sweeps, a build-up, the drop),
  then a guided tour explains every module, the Library and the guide
- A guide behind the header's `?`: every control, what the pads' looks mean
  (soft, hard, sliced rolls, 808 notes), the 808, and the tour again. Space plays
  and pauses
- 16-step sequencer with 12 patterns and up to 20 channels, mute/solo, drag to reorder
- Per-step velocity (soft / mid / hard) and rolls (2-4 hits per step), painted with
  brushes; MPC-style swing
- Synthesized 808 bass: a mono voice with punch, drive, and legato slides, played
  from a two-octave note keyboard (`+ 808 BASS` above the grid adds it, and hides
  or shows the keyboard)
- Five classic kits (TR-707, TR-808, LinnDrum, Acetone Rhythm Ace, hip hop),
  switchable mid-playback, with cross-kit channel mixing
- Master FX rack: pitch, pan, convolution reverb, and a DJ filter (low-pass / high-pass)
- Kick-reactive glow and a live oscilloscope on the screen
- Library drawer: seven preset songs (the trap demo, boom bap, house, lo-fi,
  reggaeton, amapiano, 80s synth-pop) that play through their sections, each
  showing off different features; save patterns locally, or share any pattern
  as a short link (`/p/xxxxxxxx`)

## Run with Docker

Requires only Docker. Starts MySQL, the API, and the built frontend behind nginx.

```
docker compose up --build   # app on http://localhost:8088
docker compose down         # stop; add -v to also wipe saved patterns
```

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
