const GREY = 'rgb(238, 238, 238)'
const PLAYED_PINK = 'rgb(255, 230, 230)'
const BLACK = 'rgb(50, 50, 50)'
const RED = 'rgb(230, 0, 0)'
const WHITE = 'rgb(255, 255, 255)'
const BLUE = 'rgb(0, 255, 255)'
const CLEAR_BLUE = 'rgba(0, 255, 255, 0.3)'
const PROCESSING_BLUE = 'rgb(160, 240, 240)'


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


class FrameCanvas extends BaseCanvas {
  constructor(domId, order) {
    super(domId, order)
    this.canvas.onclick = () => this.onframepop()
  }

  // Draws the frame stack
  drawFrameStack = frameStack => {
    if (frameStack.length > 4) {
      throw Error('Frame stack has max 4 frames ')
    }
    // Ignore base frame (0, 1)
    const stack = frameStack.slice(1)
    this.clear()
    const height = this.canvas.height / 3
    for (let i = 0; i < stack.length; i++) {
      const width = (stack[i][1] - stack[i][0]) * this.canvas.width
      const x = stack[i][0] * this.canvas.width
      const y = i * height

      this.ctx.fillStyle = GREY
      this.ctx.fillRect(0, y, this.canvas.width, height)
      this.ctx.fillStyle = this.frameColors[i]
      this.ctx.fillRect(x, y, width, height)
    }
  }

  frameColors = {
    0: 'rgb(160, 240, 240)',
    1: 'rgb(100, 200, 200)',
    2: 'rgb(50, 150, 150)',
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
  // Draw mouse cursor animations and handle user interactions
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
    const endX = e.clientX
    let start, end
    if (endX > this.startX) {
      start = this.startX / this.canvas.clientWidth
      end = endX / this.canvas.clientWidth
    } else {
      start = endX / this.canvas.clientWidth
      end = this.startX / this.canvas.clientWidth
    }
    this.onregionselect(start, end)
  }
}


class TextOverlay {
  // Allows us to display text messages on the player
  constructor() {
    this.textEl = document.getElementById('text-overlay')
    this.textEl.style.zIndex = -1
  }
  write = text => {
    this.textEl.innerText = text
    this.textEl.style.zIndex = 3
  }
  clear = () => {
    this.textEl.innerText = ''
    this.textEl.style.zIndex = -1
  }
}


export default class Canvas {
  constructor(onregionselect, onframepop) {
    this.text = new TextOverlay()
    this.canvas = {
      bg: new BackgroundCanvas('background-canvas', 0),
      amp: new WaveformCanvas('amplitude-canvas', 1),
      cur: new CursorCanvas('cursor-canvas', 2),
      frame: new FrameCanvas('frame-canvas', 0)
    }
    this.canvas.bg.clear()
    this.text.write('Upload a file')
    this.canvas.cur.onregionselect = onregionselect
    this.canvas.frame.onframepop = onframepop
  }

  startProcessing = (rawBuffer, bufferSize) => {
    // Prepare to read the waveform into memory
    this.text.write('Processing...')
    this.canvas.bg.clear()
    this.canvas.amp.clear()
    this.numBuckets = Math.floor(rawBuffer.length / bufferSize)
    this.bucketArray = new Float32Array(this.numBuckets)
    this.bucketCount = 0
  }

  proccessWaveform = audioEvent => {
    // Read a section of the waveform into a bucket
    const agg = (a, b) => Math.abs(a) + Math.abs(b)
    const sum = (
      audioEvent.inputBuffer.getChannelData(0).reduce(agg) + 
      audioEvent.inputBuffer.getChannelData(1).reduce(agg)
    )
    const avg = sum / (2 * audioEvent.inputBuffer.length)
    this.bucketArray[this.bucketCount] = avg
    const played = this.bucketCount / this.numBuckets
    this.canvas.bg.fillPlayed(played, PROCESSING_BLUE)
    this.bucketCount++
  }

  redraw = () => {
    // Render the waveform to the canvas
    if (!(this.startBucketCount + this.endBucketCount)) {
      throw Error('Must setup draw before redraw')
    }
    this.text.clear()
    this.canvas.bg.clear()
    this.canvas.amp.clear()
    let bucketCount = this.startBucketCount
    while (bucketCount < this.endBucketCount) {
      const played = (bucketCount - this.startBucketCount) / this.numBucketsInFrame
      const val = this.bucketArray[bucketCount] / this.maxVal
      this.canvas.amp.drawBar(played, val, this.bucketWidth, BLACK)
      bucketCount++
    }
  }

  setupDraw = (start, end) => {
    // Get ready to draw the play animation
    if (this.numBuckets < 1) {
      throw Error('Must process waveform before setting up draw')
    }

    this.start = start
    this.end = end
    this.startBucketCount = Math.floor(this.numBuckets * start)
    this.endBucketCount = Math.floor(this.numBuckets * end)
    this.bucketCount = this.startBucketCount
    this.bucketWidth = this.canvas.bg.canvas.width / (this.endBucketCount - this.startBucketCount)
    this.numBucketsInFrame = this.endBucketCount - this.startBucketCount
    this.maxVal = this.bucketArray
      .slice(this.startBucketCount, this.endBucketCount)
      .reduce((a, b) => Math.max(a, b))
    this.redraw()
  }

  drawPlay = audioEvent => {
    if (this.bucketCount > this.endBucketCount) {
      this.redraw()
      this.bucketCount = this.startBucketCount
    }

    // Draw the 'play' animation
    const played = (this.bucketCount - this.startBucketCount) / this.numBucketsInFrame
    const val = this.bucketArray[this.bucketCount] / this.maxVal
    this.canvas.amp.drawBar(played, val, this.bucketWidth, RED)
    this.canvas.bg.fillPlayed(played, PLAYED_PINK)
    this.bucketCount++

    // We must pass the audio data through to the player
    this.copyAudioData(audioEvent)
  }

  copyAudioData = audioEvent => {
    // Copy input data into output so that the music plays
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

  drawFrameStack = frameStack => {
    this.canvas.frame.drawFrameStack(frameStack)
  }
}
