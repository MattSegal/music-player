/*
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
*/
// GET DAT DOM
const fileInput = document.getElementById('file-input')
const audio = document.getElementById('audio')
const playButton = document.getElementById('play-btn')
const stopButton = document.getElementById('stop-btn')

// Some HTML5 crap
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const fileReader = new FileReader()

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
    source.connect(audioContext.destination)
    source.start(0)
}


playButton.onclick = handlePlayClick
stopButton.onclick = handleStopClick
fileInput.onchange = handleFileInput
fileReader.onloadend = handleFileRead
