const loadAndBufferAudio = () => {
  const audioCtx = new AudioContext();
  const pads = document.querySelectorAll(".Board-Channel__group");

  // Loading the file: fetch the audio file and decode the data
  async function getFile(audioContext, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  // Create a buffer, plop in data, connect and play -> modify graph here if required
  function playSample(audioContext, audioBuffer, time) {
    const sampleSource = new AudioBufferSourceNode(audioCtx, {
      buffer: audioBuffer,
    });
    sampleSource.connect(audioContext.destination);
    sampleSource.start(time);
    return sampleSource;
  }

  async function setupSample() {
    const filePath = "assets/audio/707-bd.mp3";
    // Here we're waiting for the load of the file
    // To be able to use this keyword we need to be within an `async` function
    const sample = await getFile(audioCtx, filePath);
    return sample;
  }
  // Scheduling
  let tempo = 60.0;
  // const bpmControl = document.querySelector("#BPM");

  // bpmControl.addEventListener(
  //   "input",
  //   (ev) => {
  //     tempo = parseInt(ev.target.value, 10);
  //   },
  //   false
  // );

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

  // When the sample has loaded, allow play

  const playButton = document.querySelector("#test3");
  let isPlaying = false;
  setupSample().then((sample) => {
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
      } else {
        console.log("error");
        window.clearTimeout(timerID);
      }
    });
  });
};

export default loadAndBufferAudio;
