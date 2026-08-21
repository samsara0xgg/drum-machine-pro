// Loading the file: fetch the audio file and decode the data

const audioCtx = new AudioContext();

const pads = document.querySelectorAll(".Board-Channel__group");

console.log(pads[0]);
console.log(URL);
async function getFile(audioContext, filepath) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

// let playbackRate = 1;
// const rateControl = document.querySelector("#range2");
// rateControl.addEventListener(
//   "input",
//   (ev) => {
//     playbackRate = parseInt(ev.target.value, 10);
//     console.log(playbackRate)
//   },
//   false
// );

// Create a buffer, plop in data, connect and play -> modify graph here if required
function playSample(audioContext, audioBuffer, time) {
  const sampleSource = new AudioBufferSourceNode(audioCtx, {
    buffer: audioBuffer,
    // playbackRate: playbackRate,
  });
  sampleSource.connect(audioContext.destination);
  sampleSource.start(time);
  return sampleSource;
}

async function setupSample() {
  const filePath = URL;
  // Here we're waiting for the load of the file
  // To be able to use this keyword we need to be within an `async` function
  const sample = await getFile(audioCtx, filePath);
  return sample;
}

// Scheduling
let tempo = 60.0;
const bpmControl = document.querySelector("#range2");
// const bpmValEl = document.querySelector("#range2");

bpmControl.addEventListener(
  "input",
  (e) => {
    tempo = parseInt(e.target.value * 0.6, 10);
    console.log(tempo);
    // bpmValEl.innerText = tempo;
  },
  false
);

const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

let currentNote = 0; // The note we are currently playing
let nextNoteTime = 0.0; // when the next note is due.
function nextNote() {
  const secondsPerBeat = 60.0 / tempo;

  nextNoteTime += secondsPerBeat; // Add beat length to last beat time

  // Advance the beat number, wrap to zero when reaching 4
  currentNote = (currentNote + 1) % 16;
}

// Create a queue for the notes that are to be played, with the current time that we want them to play:
const notesInQueue = [];
let dtmf;

function scheduleNote(beatNumber, time) {
  // Push the note into the queue, even if we're not playing.
  notesInQueue.push({ note: beatNumber, time: time });

  if (pads[0].querySelectorAll("input")[beatNumber].checked) {
    playSample(audioCtx, dtmf, time);
  }
}

let timerID;
function scheduler() {
  // While there are notes that will need to play before the next interval,
  // schedule them and advance the pointer.
  while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleNote(currentNote, nextNoteTime);
    nextNote();
  }
  timerID = setTimeout(scheduler, lookahead);
}

// Draw function to update the UI, so we can see when the beat progress.
// This is a loop: it reschudele itself to redraw at the end.
let lastNoteDrawn = 3;
function draw() {
  let drawNote = lastNoteDrawn;
  const currentTime = audioCtx.currentTime;

  while (notesInQueue.length && notesInQueue[0].time < currentTime) {
    drawNote = notesInQueue[0].note;
    notesInQueue.shift(); // Remove note from queue
  }

  // We only need to draw if the note has moved.
  if (lastNoteDrawn !== drawNote) {
    pads.forEach((pad) => {
      pad.children[lastNoteDrawn * 2].style.borderColor = "var(--black)";
      pad.children[drawNote * 2].style.borderColor = "var(--yellow)";
    });

    lastNoteDrawn = drawNote;
  }
  // Set up to draw again
  requestAnimationFrame(draw);
}

// When the sample has loaded, allow play
// const loadingEl = document.querySelector(".loading");
const playButton = document.querySelector(".Display-enter");
let isPlaying = false;
setupSample().then((sample) => {
  // loadingEl.style.display = "none";

  dtmf = sample; // to be used in our playSample function

  playButton.addEventListener("click", (ev) => {
    isPlaying = !isPlaying;

    if (isPlaying) {
      // Start playing

      // Check if context is in suspended state (autoplay policy)
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      currentNote = 0;
      nextNoteTime = audioCtx.currentTime;
      scheduler(); // kick off scheduling
      requestAnimationFrame(draw); // start the drawing loop.
      ev.target.dataset.playing = "true";
    } else {
      window.clearTimeout(timerID);
      ev.target.dataset.playing = "false";
    }
  });
});
