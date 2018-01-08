/*
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
consider using
    https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode
    for visualization

*/
// GET DAT DOM
const fileInput = document.getElementById('file-input')
const audio = document.getElementById('audio')
const canvas = document.getElementById('canvas')
const playButton = document.getElementById('play-btn')
const stopButton = document.getElementById('stop-btn')

// Some HTML5 crap
const canvasContext = canvas.getContext("2d")
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const fileReader = new FileReader()
const analyser = audioContext.createAnalyser()
analyser.fftSize = 2048

// Audio globals
let source
let audioBuffer

// Step 1 - file is uploaded and read into an ArrayBuffer
const handleFileInput = () => {
    const files = fileInput.files
    if (!files.length > 0) {
        return
    }
    fileReader.readAsArrayBuffer(files[0])
}

// Step 2- ArrayBuffer is ready and decoded from compressed form
const handleFileRead = () => {
    if (fileReader.readyState == 2) { // DONE
        audioContext.decodeAudioData(fileReader.result, handleAudioDecoded)
    }
}

// Step 3 - decoded buffer is ready to play
const handleAudioDecoded = buffer => {
    audioBuffer = buffer
    playBuffer()
}

// User clicks play first play
const handlePlayClick = e => {
    playBuffer()
    playButton.setAttribute('disabled', 'disabled')
}

// User clicks stop first play
const handleStopClick = e => {
    source.stop(0)   
    playButton.removeAttribute('disabled')
}

const playBuffer = () => {
    source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    draw(audioBuffer)
    source.start(0)
}

const draw = () => {

  drawVisual = requestAnimationFrame(draw)

  var bufferLength = analyser.frequencyBinCount
  var dataArray = new Uint8Array(bufferLength)
  // analyser.getByteTimeDomainData(dataArray)
  analyser.getByteFrequencyData(dataArray)
  debugger
  canvasContext.fillStyle = 'rgb(200, 200, 200)'
  canvasContext.fillRect(0, 0, canvas.width, canvas.height)

  canvasContext.lineWidth = 1
  canvasContext.strokeStyle = 'rgb(0, 0, 0)'

  canvasContext.beginPath()

  var sliceWidth = canvas.width * 1.0 / bufferLength
  var x = 0

  for (var i = 0; i < bufferLength; i++) {

    var v = dataArray[i] / 128.0
    var y = v * canvas.height / 2

    if (i === 0) {
      canvasContext.moveTo(x, y)
    } else {
      canvasContext.lineTo(x, y)
    }

    x += sliceWidth
  }

  canvasContext.lineTo(canvas.width, canvas.height / 2)
  canvasContext.stroke()
}


playButton.onclick = handlePlayClick
stopButton.onclick = handleStopClick
fileInput.onchange = handleFileInput
fileReader.onloadend = handleFileRead

