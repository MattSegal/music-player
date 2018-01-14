const GREY = 'rgb(238, 238, 238)'
const PLAYED_GREY = 'rgb(255, 230, 230)'
const BLACK = 'rgb(50, 50, 50)'
const RED = 'rgb(230, 0, 0)'
const WHITE = 'rgb(255, 255, 255)'
const BLUE = 'rgb(0, 255, 255)'
const CLEAR_BLUE = 'rgba(0, 255, 255, 0.3)'


class BaseCanvas {
  // Wraps a HTML5 <canvas> element
  constructor(domId, order) {
    this.canvas = document.getElementById(domId)
    this.canvas.width  = window.innerWidth
    this.canvas.height = 200
    this.canvas.style.zIndex = String(order)
    this.ctx = this.canvas.getContext("2d")
  }

  clear = () => {
    // Clear the whole canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}


class BackgroundCanvas extends BaseCanvas {
  // Draws the music player background
  fillPlayed = (played, color) => {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, played * this.canvas.width, this.canvas.height)
  }
}


class WaveformCanvas extends BaseCanvas {
  // Draws the music player waveform
  drawBar = (played, amplitude, width, color) => {
    // Draw an amplitude bar - amplitude: sound intensity (0 - 1)
    this.ctx.fillStyle = color
    this.ctx.fillRect(
      // left X, top Y
      this.canvas.width * played,
      0.5 * (1 - amplitude) * this.canvas.height,
      // width, height
      width,
      amplitude * this.canvas.height
    )
  }
}


class CursorCanvas extends BaseCanvas {
  // Draw mouse cursor animations and handle user events
  constructor(domId, order) {
    super(domId, order)
    this.canvas.onmousemove = this.handleCursorMove
    this.canvas.onmouseout = this.handleMouseOut
    this.canvas.onmousedown = this.handleMouseDown 
    this.canvas.onmouseup =  this.handleMouseUp
    this.mouseIsDown = false
  }

  handleCursorMove = e => {
    this.clear()
    if (!this.mouseIsDown) {
      this.ctx.fillStyle = BLUE
      this.ctx.fillRect(e.clientX, 0, 1, this.canvas.height)
    } else {
      this.ctx.fillStyle = CLEAR_BLUE
      this.ctx.fillRect(this.startX, 0, e.clientX - this.startX, this.canvas.height)
    }
  }

  handleMouseOut = e => {
    this.clear()
    this.mouseIsDown = false
  }

  handleMouseDown = e => {
    this.mouseIsDown = true
    this.startX = e.clientX
  }
  handleMouseUp = e => {
    this.mouseIsDown = false
  }
}


export default class Canvas {
  constructor() {
    this.canvas = {
      bg: new BackgroundCanvas('background-canvas', 0),
      amp: new WaveformCanvas('amplitude-canvas', 1),
      cur: new CursorCanvas('cursor-canvas', 2),
    }
    this.canvas.bg.clear()
  }

  prepareDraw = (rawBuffer, bufferSize) => {
    // Prepare to draw the waveform
    this.canvas.bg.clear()
    this.canvas.amp.clear()
    this.numBuckets = rawBuffer.length / bufferSize
    this.bucketWidth = this.canvas.bg.canvas.width / this.numBuckets
    this.bucketCount = 0
    this.bucketArray = new Float32Array(this.numBuckets)
  }

  drawWaveform = (audioEvent) => {
    // Draw a subsection of the waveform
    const agg = (a, b) => Math.abs(a) + Math.abs(b)
    const sum = (
      audioEvent.inputBuffer.getChannelData(0).reduce(agg) + 
      audioEvent.inputBuffer.getChannelData(1).reduce(agg)
    )
    const avg = sum / (2 * audioEvent.inputBuffer.length)
    this.bucketArray[this.bucketCount] = avg
    const played = this.bucketCount / this.numBuckets
    this.canvas.amp.drawBar(played, avg, this.bucketWidth, BLACK)
    this.bucketCount++
  }

  reDrawWaveform = () => {
    this.canvas.bg.clear()
    this.canvas.amp.clear()
    this.bucketCount = 0
    while (this.bucketCount < this.numBuckets) {
      const played = this.bucketCount / this.numBuckets
      this.canvas.amp.drawBar(played, this.bucketArray[this.bucketCount], this.bucketWidth, BLACK)
      this.bucketCount++
    }
  }

  prepareDrawPlay = () => {
    this.bucketCount = 0
  }

  drawPlay = (audioEvent) => {
    // Draw 'played' color onto waveform as the track player
    // pass audio data through to output
    const played = this.bucketCount / this.numBuckets
    this.canvas.amp.drawBar(played, this.bucketArray[this.bucketCount], this.bucketWidth, RED)
    this.canvas.bg.fillPlayed(played, PLAYED_GREY)
    this.bucketCount++

    // Pass data through to source
    let inputBuffer = audioEvent.inputBuffer
    let outputBuffer = audioEvent.outputBuffer
    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);
      for (var sample = 0; sample < inputBuffer.length; sample++) {
        outputData[sample] = inputData[sample];
      }
    }
  }
}