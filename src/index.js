import AudioThing from './audio'

// Disable / enable buttons
const disable = el =>  el.setAttribute('disabled', 'disabled')
const enable = el => el.removeAttribute('disabled')

// Get the DOM input elements
const fileInput = document.getElementById('file-input')
const playButton = document.getElementById('play-btn')
const stopButton = document.getElementById('stop-btn')
const pauseButton = document.getElementById('pause-btn')

// This thing reads the file
const fileReader = new FileReader()

// This thing does everything else
const audioThing = new AudioThing()

// Step 1 - User uploads a file
// and then we read it into an ArrayBuffer
const handleFileInput = () => {
    const files = fileInput.files
    if (!files.length > 0) {
        return
    }
    fileReader.readAsArrayBuffer(files[0])
}

// Step 2- ArrayBuffer is read
// and then we process it
const handleFileRead = () => {
    // Check if DONE
    if (fileReader.readyState == 2) {
      audioThing.processArrayBuffer(fileReader.result)
    }
}

// Step 3 - ArrayBuffer is processed
// and the user can now play music
const handleAudioReady = () => {
  enable(playButton)
}

// User clicks play
const handlePlayClick = e => {
    disable(playButton)
    enable(stopButton)
    enable(pauseButton)
    audioThing.play()
}

// User clicks stop
const handleStopClick = e => {
    enable(playButton)
    disable(stopButton)
    disable(pauseButton)
    audioThing.stop()   
}

// User clicks pause
const handlePauseClick = e => {
    enable(playButton)
    disable(stopButton)
    disable(pauseButton)
    audioThing.pause()
}

audioThing.onready = handleAudioReady
playButton.onclick = handlePlayClick
stopButton.onclick = handleStopClick
pauseButton.onclick = handlePauseClick
fileInput.onchange = handleFileInput
fileReader.onloadend = handleFileRead
