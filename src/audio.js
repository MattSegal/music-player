import Canvas from './canvas'

// This thing plays and proccesses the music
const audioContext = new (window.AudioContext || window.webkitAudioContext)()


export default class AudioThing {
  constructor() {
    this.bufferSize = 4096
    this.canvas = new Canvas(this.handleRegionSelect, this.handleFramePop)
    this.frameStack = []
    this.frameStack.push([0, 1]) // start, end
  }

  play = () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume()
      return
    }

    // Start from the start of the current frame
    const frame = this.frameStack[this.frameStack.length -1]
    this.createSource(frame[0], frame[1])
    this.source.start(0)
  }

  pause = () => {
    audioContext.suspend()
  }

  stop = () => {
    this.source.stop()
  }

  handleRegionSelect = (start, end) => {
    if (this.frameStack.length > 3) {
      return
    }
    if (end - start < 0.01) {
      return
    }
    if (end > 0.96) {
      end = 1
    }
    if (start < 0.04) {
      start = 0
    }
    const frame = this.frameStack[this.frameStack.length -1]
    const currentFrameSize = frame[1] - frame[0] 
    const frameStart = frame[0] + currentFrameSize * start
    const frameEnd = frame[0] + currentFrameSize * end
    this.frameStack.push([frameStart, frameEnd])
    this.canvas.drawFrameStack(this.frameStack)

    this.createSource(frameStart, frameEnd)
    this.source.loop = true
    this.source.loopStart = this.buffer.duration * frameStart
    this.source.loopEnd = this.buffer.duration * frameEnd
    this.source.start(0, this.source.loopStart)
    this.onregionselect()
  }

  handleFramePop = () => {
    if (this.frameStack.length < 2) {
      return
    }
    this.frameStack.pop()
    const frame = this.frameStack[this.frameStack.length -1]
    const frameStart = frame[0]
    const frameEnd = frame[1]
    this.canvas.drawFrameStack(this.frameStack)
    this.createSource(frameStart, frameEnd)
    this.source.loop = true
    this.source.loopStart = this.buffer.duration * frameStart
    this.source.loopEnd = this.buffer.duration * frameEnd
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
        this.canvas.setupDraw(0, 1)
        resolve()
    }))
  }

  createSource = (start, end) => {
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    } 
    if (this.source) {
      this.source.stop()
    }
    this.source = audioContext.createBufferSource()
    this.source.buffer = this.buffer

    this.canvas.setupDraw(start, end)
    const scriptProcessor = audioContext.createScriptProcessor(this.bufferSize, 2, 1)
    scriptProcessor.onaudioprocess = this.canvas.drawPlay
    this.source.connect(scriptProcessor)
    scriptProcessor.connect(audioContext.destination)

    this.source.onended = () => {
      scriptProcessor.disconnect()
      this.canvas.redraw()
    }
  }
}
