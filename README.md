# drum-machine-pro

A 16-step drum sequencer built with React and the Web Audio API.

- 16-step pattern grid with 6 drum channels (Roland TR-707 samples)
- 12 switchable patterns, editable while playing
- BPM (40-200) and master volume controls
- Lookahead scheduling on the Web Audio clock for stable timing

More kits (808, LinnDrum, hip hop, acetone) are sampled under `src/service/`
and `public/assets/audio/` but not wired into the UI yet.

## Run

```
npm install
npm start
```

by alllllen shi
