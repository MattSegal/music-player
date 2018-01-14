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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__canvas__ = __webpack_require__(1);
/*
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
consider using
    https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode
    for visualization

*/



// GET DAT DOM
const fileInput = document.getElementById('file-input');
const audio = document.getElementById('audio');
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');

// Some HTML5 crap
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const fileReader = new FileReader();
const canvas = new __WEBPACK_IMPORTED_MODULE_0__canvas__["a" /* default */]();

// Audio globals
let source;
let audioBuffer;

// Step 1 - file is uploaded and read into an ArrayBuffer
const handleFileInput = () => {
    const files = fileInput.files;
    if (!files.length > 0) {
        return;
    }
    fileReader.readAsArrayBuffer(files[0]);
};

// Step 2- ArrayBuffer is ready and decoded from compressed form
const handleFileRead = () => {
    if (fileReader.readyState == 2) {
        // DONE
        audioContext.decodeAudioData(fileReader.result, handleAudioDecoded);
    }
};

// Step 3 - decoded buffer is ready to play
const handleAudioDecoded = buffer => {
    audioBuffer = buffer;
    processBuffer().then(() => playBuffer());
};

// User clicks play first play
const handlePlayClick = e => {
    playBuffer();
    playButton.setAttribute('disabled', 'disabled');
};

// User clicks stop first play
const handleStopClick = e => {
    source.stop();
    playButton.removeAttribute('disabled');
};

const processBuffer = () => {
    const offlineContext = new OfflineAudioContext({
        numberOfChannels: audioBuffer.numberOfChannels,
        length: audioBuffer.length,
        sampleRate: audioBuffer.sampleRate
    });
    const bufferSize = 4096;
    const scriptProcessor = offlineContext.createScriptProcessor(bufferSize, 2, 2);
    const offlineSource = offlineContext.createBufferSource();
    scriptProcessor.onaudioprocess = canvas.drawWaveform;
    offlineSource.buffer = audioBuffer;
    offlineSource.connect(scriptProcessor);
    scriptProcessor.connect(offlineContext.destination);
    offlineSource.start();
    canvas.prepareDraw(audioBuffer, bufferSize);
    return offlineContext.startRendering();
};

const playBuffer = () => {
    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const bufferSize = 4096;
    const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 2, 1);
    scriptProcessor.onaudioprocess = canvas.drawPlay;
    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    canvas.prepareDrawPlay();
    source.start(0);
    source.onended = () => {
        scriptProcessor.disconnect();
        canvas.reDrawWaveform();
    };
};

playButton.onclick = handlePlayClick;
stopButton.onclick = handleStopClick;
fileInput.onchange = handleFileInput;
fileReader.onloadend = handleFileRead;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const GREY = 'rgb(238, 238, 238)';
const PLAYED_GREY = 'rgb(255, 230, 230)';
const BLACK = 'rgb(50, 50, 50)';
const RED = 'rgb(230, 0, 0)';
const WHITE = 'rgb(255, 255, 255)';
const BLUE = 'rgb(0, 255, 255)';
const CLEAR_BLUE = 'rgba(0, 255, 255, 0.3)';

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
  // Draw mouse cursor animations and handle user events
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
    };

    this.canvas.onmousemove = this.handleCursorMove;
    this.canvas.onmouseout = this.handleMouseOut;
    this.canvas.onmousedown = this.handleMouseDown;
    this.canvas.onmouseup = this.handleMouseUp;
    this.mouseIsDown = false;
  }

}

class Canvas {
  constructor() {
    this.prepareDraw = (rawBuffer, bufferSize) => {
      // Prepare to draw the waveform
      this.canvas.bg.clear();
      this.canvas.amp.clear();
      this.numBuckets = rawBuffer.length / bufferSize;
      this.bucketWidth = this.canvas.bg.canvas.width / this.numBuckets;
      this.bucketCount = 0;
      this.bucketArray = new Float32Array(this.numBuckets);
    };

    this.drawWaveform = audioEvent => {
      // Draw a subsection of the waveform
      const agg = (a, b) => Math.abs(a) + Math.abs(b);
      const sum = audioEvent.inputBuffer.getChannelData(0).reduce(agg) + audioEvent.inputBuffer.getChannelData(1).reduce(agg);
      const avg = sum / (2 * audioEvent.inputBuffer.length);
      this.bucketArray[this.bucketCount] = avg;
      const played = this.bucketCount / this.numBuckets;
      this.canvas.amp.drawBar(played, avg, this.bucketWidth, BLACK);
      this.bucketCount++;
    };

    this.reDrawWaveform = () => {
      this.canvas.bg.clear();
      this.canvas.amp.clear();
      this.bucketCount = 0;
      while (this.bucketCount < this.numBuckets) {
        const played = this.bucketCount / this.numBuckets;
        this.canvas.amp.drawBar(played, this.bucketArray[this.bucketCount], this.bucketWidth, BLACK);
        this.bucketCount++;
      }
    };

    this.prepareDrawPlay = () => {
      this.bucketCount = 0;
    };

    this.drawPlay = audioEvent => {
      // Draw 'played' color onto waveform as the track player
      // pass audio data through to output
      const played = this.bucketCount / this.numBuckets;
      this.canvas.amp.drawBar(played, this.bucketArray[this.bucketCount], this.bucketWidth, RED);
      this.canvas.bg.fillPlayed(played, PLAYED_GREY);
      this.bucketCount++;

      // Pass data through to source
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

    this.canvas = {
      bg: new BackgroundCanvas('background-canvas', 0),
      amp: new WaveformCanvas('amplitude-canvas', 1),
      cur: new CursorCanvas('cursor-canvas', 2)
    };
    this.canvas.bg.clear();
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Canvas;


/***/ })
/******/ ]);