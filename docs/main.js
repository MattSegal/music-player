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
    processBuffer()
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

const processBuffer = () => {
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: audioBuffer.numberOfChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
  })
  const scriptProcessor = offlineContext.createScriptProcessor({
    numberOfInputChannels: 2,
    numberOfOutputChannels: 1,
  })
  const offlineSource = offlineContext.createBufferSource()
  scriptProcessor.onaudioprocess = handleOnAudioProcess
  offlineSource.buffer = audioBuffer
  offlineSource.connect(scriptProcessor)
  scriptProcessor.connect(offlineContext.destination)
  offlineSource.start()
  offlineContext.startRendering().then(drawProcessed)
}

const handleOnAudioProcess = e => {
  // Take average of 2 input channels to get output
  const inputOne = e.inputBuffer.getChannelData(0)
  const inputTwo = e.inputBuffer.getChannelData(1)
  let outputData = e.outputBuffer.getChannelData(0)

  // Process each sample
  for (let sample = 0; sample < e.inputBuffer.length; sample++) {
    outputData[sample] = (
      Math.abs(inputOne[sample]) +
      Math.abs(inputTwo[sample])
    ) / 2
  }
}

const drawProcessed = renderedBuffer => {
  canvasContext.fillStyle = 'rgb(200, 200, 200)'
  canvasContext.fillRect(0, 0, canvas.width, canvas.height)
  canvasContext.lineWidth = 1
  canvasContext.strokeStyle = 'rgb(0, 0, 0)'
  canvasContext.fillStyle = 'rgb(0, 0, 0)'

  const sliceWidth = canvas.width * 1.0 / renderedBuffer.length

  canvasContext.beginPath()
  const amplitudes = renderedBuffer.getChannelData(0)
  const bucketSize = renderedBuffer.sampleRate * 0.05

  // Process each sample
  let x = 0
  let barHeight
  let sum = 0
  for (let sample = 0; sample < renderedBuffer.length; sample++) {
    if (sample % bucketSize !== 0) {
      sum += amplitudes[sample]
    } else {
      barHeight = 0.5 * canvas.height * sum / bucketSize
      canvasContext.fillRect(
         x, 0.5 * canvas.height - barHeight,   // top-left x, y
         0.2, 2 * barHeight                    // width, height
       )
      sum = 0
    }
    x += sliceWidth
  }
  canvasContext.lineTo(canvas.width, canvas.height / 2)
  canvasContext.stroke()
}

const playBuffer = () => {
    source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    drawAnalyser()
    source.start(0)
}

const drawAnalyser = () => {
  requestAnimationFrame(drawAnalyser)

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

