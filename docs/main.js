/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__audio__ = __webpack_require__(2);


// Disable / enable buttons
const disable = el => el.setAttribute('disabled', 'disabled');
const enable = el => el.removeAttribute('disabled');

// Get the DOM input elements
const fileInput = document.getElementById('file-input');
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');
const pauseButton = document.getElementById('pause-btn');

// This thing reads the file
const fileReader = new FileReader();

// This thing does everything else
const audioThing = new __WEBPACK_IMPORTED_MODULE_0__audio__["a" /* default */]();

// Step 1 - User uploads a file
// and then we read it into an ArrayBuffer
const handleFileInput = () => {
    const files = fileInput.files;
    if (!files.length > 0) {
        return;
    }
    fileReader.readAsArrayBuffer(files[0]);
};

// Step 2- ArrayBuffer is read
// and then we process it
const handleFileRead = () => {
    // Check if DONE
    if (fileReader.readyState == 2) {
        audioThing.processArrayBuffer(fileReader.result);
    }
};

// Step 3 - ArrayBuffer is processed
// and the user can now play music
const handleAudioReady = () => {
    enable(playButton);
};

// User clicks play
const handlePlayClick = e => {
    disable(playButton);
    enable(stopButton);
    enable(pauseButton);
    audioThing.play();
};

// User clicks stop
const handleStopClick = e => {
    enable(playButton);
    disable(stopButton);
    disable(pauseButton);
    audioThing.stop();
};

// User clicks pause
const handlePauseClick = e => {
    enable(playButton);
    disable(stopButton);
    disable(pauseButton);
    audioThing.pause();
};

audioThing.onready = handleAudioReady;
playButton.onclick = handlePlayClick;
stopButton.onclick = handleStopClick;
pauseButton.onclick = handlePauseClick;
fileInput.onchange = handleFileInput;
fileReader.onloadend = handleFileRead;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const GREY = 'rgb(238, 238, 238)';
const PLAYED_PINK = 'rgb(255, 230, 230)';
const BLACK = 'rgb(50, 50, 50)';
const RED = 'rgb(230, 0, 0)';
const WHITE = 'rgb(255, 255, 255)';
const BLUE = 'rgb(0, 255, 255)';
const CLEAR_BLUE = 'rgba(0, 255, 255, 0.3)';
const PROCESSING_BLUE = 'rgb(160, 240, 240)';

class BaseCanvas {
  // Wraps a HTML5 <canvas> element
  constructor(domId, order) {
    this.clear = () => {
      // Clear the whole canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    this.canvas = document.getElementById(domId);
    this.canvas.width = window.innerWidth;
    this.canvas.height = 200;
    this.canvas.style.zIndex = String(order);
    this.ctx = this.canvas.getContext("2d");
  }

}

class BackgroundCanvas extends BaseCanvas {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.fillPlayed = (played, color) => {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, played * this.canvas.width, this.canvas.height);
    }, _temp;
  }
  // Draws the music player background


}

class WaveformCanvas extends BaseCanvas {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this.drawBar = (played, amplitude, width, color) => {
      // Draw an amplitude bar - amplitude: sound intensity (0 - 1)
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
      // left X, top Y
      this.canvas.width * played, 0.5 * (1 - amplitude) * this.canvas.height,
      // width, height
      width, amplitude * this.canvas.height);
    }, _temp2;
  }
  // Draws the music player waveform


}

class CursorCanvas extends BaseCanvas {
  // Draw mouse cursor animations and handle user interactions
  constructor(domId, order) {
    super(domId, order);

    this.handleCursorMove = e => {
      this.clear();
      if (!this.mouseIsDown) {
        this.ctx.fillStyle = BLUE;
        this.ctx.fillRect(e.clientX, 0, 1, this.canvas.height);
      } else {
        this.ctx.fillStyle = CLEAR_BLUE;
        this.ctx.fillRect(this.startX, 0, e.clientX - this.startX, this.canvas.height);
      }
    };

    this.handleMouseOut = e => {
      this.clear();
      this.mouseIsDown = false;
    };

    this.handleMouseDown = e => {
      this.mouseIsDown = true;
      this.startX = e.clientX;
    };

    this.handleMouseUp = e => {
      this.mouseIsDown = false;
      const endX = e.clientX;
      let start, end;
      if (endX > this.startX) {
        start = this.startX / this.canvas.clientWidth;
        end = endX / this.canvas.clientWidth;
      } else {
        start = endX / this.canvas.clientWidth;
        end = this.startX / this.canvas.clientWidth;
      }
      this.onregionselect(start, end);
    };

    this.canvas.onmousemove = this.handleCursorMove;
    this.canvas.onmouseout = this.handleMouseOut;
    this.canvas.onmousedown = this.handleMouseDown;
    this.canvas.onmouseup = this.handleMouseUp;
    this.mouseIsDown = false;
  }

}

class TextOverlay {
  // Allows us to display text messages on the player
  constructor() {
    this.write = text => {
      this.textEl.innerText = text;
      this.textEl.style.zIndex = 3;
    };

    this.clear = () => {
      this.textEl.innerText = '';
      this.textEl.style.zIndex = -1;
    };

    this.textEl = document.getElementById('text-overlay');
    this.textEl.style.zIndex = -1;
  }
}

class Canvas {
  constructor(onregionselect) {
    this.startProcessing = (rawBuffer, bufferSize) => {
      // Prepare to read the waveform into memory
      this.text.write('Processing...');
      this.canvas.bg.clear();
      this.canvas.amp.clear();
      this.numBuckets = rawBuffer.length / bufferSize;
      this.bucketWidth = this.canvas.bg.canvas.width / this.numBuckets;
      this.bucketCount = 0;
      this.bucketArray = new Float32Array(this.numBuckets);
    };

    this.proccessWaveform = audioEvent => {
      // Read a section of the waveform into a bucket
      const agg = (a, b) => Math.abs(a) + Math.abs(b);
      const sum = audioEvent.inputBuffer.getChannelData(0).reduce(agg) + audioEvent.inputBuffer.getChannelData(1).reduce(agg);
      const avg = sum / (2 * audioEvent.inputBuffer.length);
      this.bucketArray[this.bucketCount] = avg;
      const played = this.bucketCount / this.numBuckets;
      this.canvas.bg.fillPlayed(played, PROCESSING_BLUE);
      this.bucketCount++;
    };

    this.drawWaveform = () => {
      // Render the waveform to the canvas
      this.text.clear();
      this.canvas.amp.clear();
      this.canvas.bg.clear();
      this.bucketCount = 0;
      while (this.bucketCount < this.numBuckets) {
        const played = this.bucketCount / this.numBuckets;
        this.canvas.amp.drawBar(played, this.bucketArray[this.bucketCount], this.bucketWidth, BLACK);
        this.bucketCount++;
      }
    };

    this.prepareDrawPlay = () => {
      // Get ready to draw the play animation
      this.bucketCount = 0;
      this.text.clear();
    };

    this.drawPlay = audioEvent => {
      // Draw the 'play' animation
      const played = this.bucketCount / this.numBuckets;
      this.canvas.amp.drawBar(played, this.bucketArray[this.bucketCount], this.bucketWidth, RED);
      this.canvas.bg.fillPlayed(played, PLAYED_PINK);
      this.bucketCount++;

      // We must pass the audio data through to the player
      let inputBuffer = audioEvent.inputBuffer;
      let outputBuffer = audioEvent.outputBuffer;
      for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);
        for (var sample = 0; sample < inputBuffer.length; sample++) {
          outputData[sample] = inputData[sample];
        }
      }
    };

    this.text = new TextOverlay();
    this.canvas = {
      bg: new BackgroundCanvas('background-canvas', 0),
      amp: new WaveformCanvas('amplitude-canvas', 1),
      cur: new CursorCanvas('cursor-canvas', 2)
    };
    this.canvas.bg.clear();
    this.text.write('Upload a file');
    this.canvas.cur.onregionselect = onregionselect;
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Canvas;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__canvas__ = __webpack_require__(1);


// This thing plays and proccesses the music
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

class AudioThing {
  constructor() {
    this.play = () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
        return;
      }

      this.createSource();
      this.source.start(0);
    };

    this.pause = () => {
      audioContext.suspend();
    };

    this.stop = () => {
      this.source.stop();
    };

    this.handleRegionSelect = (start, end) => {
      console.log('selected', start, 'to', end);

      // this.start = (this.end - this.start) * start
      // this.end = (this.end - this.start) * end

      if (this.source && audioContext.state === 'running') {
        this.source.stop();
      }

      this.createSource();
      this.source.loop = true;
      this.source.loopStart = this.buffer.duration * start;
      this.source.loopEnd = this.buffer.duration * end;
      this.source.start(0, this.source.loopStart);
    };

    this.processArrayBuffer = arrayBuffer => {
      // Decompress audio data
      audioContext.decodeAudioData(arrayBuffer, this.handleArrayBufferDecoded);
    };

    this.handleArrayBufferDecoded = buffer => {
      // Handle decompressed audio data
      this.buffer = buffer;
      this.processBuffer().then(() => this.onready());
    };

    this.processBuffer = () => {
      const offlineContext = new OfflineAudioContext({
        numberOfChannels: this.buffer.numberOfChannels,
        length: this.buffer.length,
        sampleRate: this.buffer.sampleRate
      });
      const scriptProcessor = offlineContext.createScriptProcessor(this.bufferSize, 2, 2);
      const offlineSource = offlineContext.createBufferSource();

      this.canvas.startProcessing(this.buffer, this.bufferSize);
      scriptProcessor.onaudioprocess = this.canvas.proccessWaveform;

      offlineSource.buffer = this.buffer;
      offlineSource.connect(scriptProcessor);
      scriptProcessor.connect(offlineContext.destination);
      offlineSource.start();
      return offlineContext.startRendering().then(() => new Promise(resolve => {
        this.canvas.drawWaveform();
        resolve();
      }));
    };

    this.createSource = () => {
      this.source = audioContext.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(audioContext.destination);
      // const scriptProcessor = audioContext.createScriptProcessor(this.bufferSize, 2, 1)
      // scriptProcessor.onaudioprocess = this.canvas.drawPlay
      // this.source.connect(scriptProcessor)
      // scriptProcessor.connect(audioContext.destination)
      // this.canvas.prepareDrawPlay()
      this.source.onended = () => {
        // scriptProcessor.disconnect()
        // this.canvas.drawWaveform()
      };
    };

    this.bufferSize = 4096;
    this.canvas = new __WEBPACK_IMPORTED_MODULE_0__canvas__["a" /* default */](this.handleRegionSelect);
    this.start = 0;
    this.end = 1;
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = AudioThing;


/***/ })
/******/ ]);