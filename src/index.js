/*
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
consider using
    https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode
    for visualization

*/

import Canvas from './canvas'


// GET DAT DOM
const fileInput = document.getElementById('file-input')
const audio = document.getElementById('audio')
const playButton = document.getElementById('play-btn')
const stopButton = document.getElementById('stop-btn')

// Some HTML5 crap
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const fileReader = new FileReader()
const canvas = new Canvas()


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
    processBuffer().then(() =>
      playBuffer()
    )
}

// User clicks play first play
const handlePlayClick = e => {
    playBuffer()
    playButton.setAttribute('disabled', 'disabled')
}

// User clicks stop first play
const handleStopClick = e => {
    source.stop()   
    playButton.removeAttribute('disabled')
}

const processBuffer = () => {
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: audioBuffer.numberOfChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
  })
  const bufferSize = 4096
  const scriptProcessor = offlineContext.createScriptProcessor(bufferSize, 2, 2)
  const offlineSource = offlineContext.createBufferSource()
  scriptProcessor.onaudioprocess = canvas.drawWaveform
  offlineSource.buffer = audioBuffer
  offlineSource.connect(scriptProcessor)
  scriptProcessor.connect(offlineContext.destination)
  offlineSource.start()
  canvas.prepareDraw(audioBuffer, bufferSize)
  return offlineContext.startRendering()
}

const playBuffer = () => {
    source = audioContext.createBufferSource()
    source.buffer = audioBuffer

    const bufferSize = 4096
    const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 2, 1)
    scriptProcessor.onaudioprocess = canvas.drawPlay
    source.connect(scriptProcessor)
    scriptProcessor.connect(audioContext.destination)
    canvas.prepareDrawPlay()
    source.start(0)
    source.onended = () => {
      scriptProcessor.disconnect()
      canvas.reDrawWaveform()
    }
}


playButton.onclick = handlePlayClick
stopButton.onclick = handleStopClick
fileInput.onchange = handleFileInput
fileReader.onloadend = handleFileRead

