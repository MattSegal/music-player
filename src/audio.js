import Canvas from './canvas'

// This thing plays and proccesses the music
const audioContext = new (window.AudioContext || window.webkitAudioContext)()


export default class AudioThing {
  constructor() {
    this.bufferSize = 4096
    this.canvas = new Canvas(this.handleRegionSelect)
    this.start = 0
    this.end = 1
  }

  play = () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume()
      return
    }

    this.createSource()
    this.source.start(0)
  }

  pause = () => {
    audioContext.suspend()
  }

  stop = () => {
    this.source.stop()
  }

  handleRegionSelect = (start, end) => {
    console.log('selected', start, 'to', end)

    // this.start = (this.end - this.start) * start
    // this.end = (this.end - this.start) * end

    if (this.source && audioContext.state === 'running') {
      this.source.stop()
    }

    this.createSource()
    this.source.loop = true
    this.source.loopStart = this.buffer.duration * start
    this.source.loopEnd = this.buffer.duration * end
    this.source.start(0, this.source.loopStart)
  }

  processArrayBuffer = arrayBuffer => {
    // Decompress audio data
    audioContext.decodeAudioData(arrayBuffer, this.handleArrayBufferDecoded)
  }

  handleArrayBufferDecoded = buffer => {
    // Handle decompressed audio data
    this.buffer = buffer
    this.processBuffer().then(() => this.onready())
  }

  processBuffer = () => {
    const offlineContext = new OfflineAudioContext({
      numberOfChannels: this.buffer.numberOfChannels,
      length: this.buffer.length,
      sampleRate: this.buffer.sampleRate,
    })
    const scriptProcessor = offlineContext.createScriptProcessor(this.bufferSize, 2, 2)
    const offlineSource = offlineContext.createBufferSource()
    
    this.canvas.startProcessing(this.buffer, this.bufferSize)
    scriptProcessor.onaudioprocess = this.canvas.proccessWaveform
    
    offlineSource.buffer = this.buffer
    offlineSource.connect(scriptProcessor)
    scriptProcessor.connect(offlineContext.destination)
    offlineSource.start()
    return offlineContext.startRendering().then(() => new Promise(
      resolve => {
        this.canvas.drawWaveform()
        resolve()
    }))
  }

  createSource = () => {
    this.source = audioContext.createBufferSource()
    this.source.buffer = this.buffer
    this.source.connect(audioContext.destination)
    // const scriptProcessor = audioContext.createScriptProcessor(this.bufferSize, 2, 1)
    // scriptProcessor.onaudioprocess = this.canvas.drawPlay
    // this.source.connect(scriptProcessor)
    // scriptProcessor.connect(audioContext.destination)
    // this.canvas.prepareDrawPlay()
    this.source.onended = () => {
      // scriptProcessor.disconnect()
      // this.canvas.drawWaveform()
    }
  }
}
