
const bufferSource = (URL) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  const context = new AudioContext();
  /* const playButton = document.querySelector(`#channel${index}`); */

  let yodelBuffer;
  console.log(2);

  window
    .fetch(URL)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      /*    playButton.disabled = false; */
      yodelBuffer = audioBuffer;
      play(yodelBuffer);
    });

  /*  playButton.onclick = () => {play(yodelBuffer)}; */

  
  function play(audioBuffer) {
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    const analyser = context.createAnalyser();

    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    source.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2.5;

        var r = barHeight + 25 * (i / bufferLength);
        var g = 250 * (i / bufferLength);
        var b = 50;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
    renderFrame();
    return source;
    //audio.play();

    //source.start();
  }
};
export default bufferSource;
