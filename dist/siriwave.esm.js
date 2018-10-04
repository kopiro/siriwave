import raf from 'raf';
import lerp from 'lerp';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Curve =
/*#__PURE__*/
function () {
  function Curve(opt) {
    _classCallCheck(this, Curve);

    this.ctrl = opt.ctrl;
    this.definition = opt.definition;
    this.ATT_FACTOR = 4;
  }

  _createClass(Curve, [{
    key: "_globalAttFn",
    value: function _globalAttFn(x) {
      return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)), this.ATT_FACTOR);
    }
  }, {
    key: "_xpos",
    value: function _xpos(i) {
      return this.ctrl.width / 2 + i * (this.ctrl.width / 4);
    }
  }, {
    key: "_ypos",
    value: function _ypos(i) {
      return this.ctrl.heightMax + this._globalAttFn(i) * (this.ctrl.heightMax * this.ctrl.amplitude / this.definition.attenuation) * Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase);
    }
  }, {
    key: "draw",
    value: function draw() {
      var ctx = this.ctrl.ctx;
      ctx.moveTo(0, 0);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(' + this.ctrl.color + ',' + this.definition.opacity + ')';
      ctx.lineWidth = this.definition.lineWidth; // Cycle the graph from -X to +X every PX_DEPTH and draw the line

      for (var i = -this.ctrl.MAX_X; i <= this.ctrl.MAX_X; i += this.ctrl.opt.pixelDepth) {
        ctx.lineTo(this._xpos(i), this._ypos(i));
      }

      ctx.stroke();
    }
  }], [{
    key: "getDefinition",
    value: function getDefinition() {
      return [{
        attenuation: -2,
        lineWidth: 1,
        opacity: 0.1
      }, {
        attenuation: -6,
        lineWidth: 1,
        opacity: 0.2
      }, {
        attenuation: 4,
        lineWidth: 1,
        opacity: 0.4
      }, {
        attenuation: 2,
        lineWidth: 1,
        opacity: 0.6
      }, {
        attenuation: 1,
        lineWidth: 1.5,
        opacity: 1
      }];
    }
  }]);

  return Curve;
}();

var iOS9Curve =
/*#__PURE__*/
function () {
  function iOS9Curve() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, iOS9Curve);

    this.ctrl = opt.ctrl;
    this.definition = opt.definition;
    this.phase = 0;
    this.AMPLITUDE_RANGE = [0.1, 1];
    this.WIDTH_RANGE = [0.1, 0.3];

    this._respawn();
  }

  _createClass(iOS9Curve, [{
    key: "_respawn",
    value: function _respawn() {
      // Generate a random seed
      this.seed = Math.random(); // Generate random properties for this wave

      this.amplitude = this.AMPLITUDE_RANGE[0] + Math.random() * (this.AMPLITUDE_RANGE[1] - this.AMPLITUDE_RANGE[0]);
      this.width = this.ctrl.width * (this.WIDTH_RANGE[0] + Math.random() * (this.WIDTH_RANGE[1] - this.WIDTH_RANGE[0])); // Generate a random number to determine the wave class

      this.openClass = 2 + (Math.random() * 3 | 0);
    }
  }, {
    key: "_ypos",
    value: function _ypos(i) {
      var y = 1 * // Actual real Y in the SIN function
      Math.abs(Math.sin(this.phase)) * // Amplitude of the original controller
      this.ctrl.amplitude * // Amplitude of current wave
      this.amplitude * // Maximum height for the complete wave
      this.ctrl.heightMax * // Class of the wave (small to big)
      Math.pow(1 / (1 + Math.pow(this.openClass * i, 2)), 2); // If we reach a minimum threshold to consider this wave "dead", 
      // respawn with other properties

      if (Math.abs(y) < this.ctrl.DEAD_THRESHOLD) {
        this._respawn();
      }

      return y;
    }
  }, {
    key: "draw",
    value: function draw() {
      this.phase += this.ctrl.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI)); // TODO:  we have to ensure that same colors are not near

      var xBase = 2 * this.width + (-this.width + this.seed * (2 * this.width));
      var yBase = this.ctrl.heightMax;
      var x, y;
      var height = Math.abs(this._ypos(0));
      var xInit = xBase + -this.ctrl.MAX_X * this.width;
      var ctx = this.ctrl.ctx; // Write two opposite waves

      var _arr = [-1, 1];

      for (var _i = 0; _i < _arr.length; _i++) {
        var sign = _arr[_i];
        ctx.beginPath(); // Cycle the graph from -X to +X every PX_DEPTH and draw the line

        for (var i = -this.ctrl.MAX_X; i <= this.ctrl.MAX_X; i += this.ctrl.opt.pixelDepth) {
          x = xBase + i * this.width;
          y = yBase + sign * this._ypos(i);
          ctx.lineTo(x, y);
        }

        var gradient = ctx.createRadialGradient(xBase, yBase, height * 1.15, xBase, yBase, height * 0.3);
        gradient.addColorStop(0, 'rgba(' + this.definition.color + ', 0.8)');
        gradient.addColorStop(1, 'rgba(' + this.definition.color + ', 0.2)');
        ctx.fillStyle = gradient;
        ctx.lineTo(xInit, yBase);
        ctx.closePath();
        ctx.fill();
      }
    }
  }], [{
    key: "getDefinition",
    value: function getDefinition() {
      return [{
        color: '32,133,252'
      }, {
        color: '94,252,169'
      }, {
        color: '253,71,103'
      }];
    }
  }]);

  return iOS9Curve;
}();

var SiriWave =
/*#__PURE__*/
function () {
  /**
   * Build the SiriWave
   * @param {Object} opt 
   * @param {DOMElement} [opt.container=document.body] The DOM container where the DOM canvas element will be added
   * @param {String} [opt.style='ios'] The style of the wave: `ios` or `ios9`
   * @param {Number} [opt.ratio=null] Ratio of the display to use. Calculated by default.
   * @param {Number} [opt.speed=0.2] The speed of the animation.
   * @param {Number} [opt.amplitude=1] The amplitude of the complete wave.
   * @param {Number} [opt.frequency=6] The frequency for the complete wave (how many waves). - Not available in iOS9 Style
   * @param {String} [opt.color='#fff'] The color of the wave, in hexadecimal form (`#336699`, `#FF0`). - Not available in iOS9 Style
   * @param {Boolean} [opt.cover=false] The `canvas` covers the entire width or height of the container.
   * @param {Number} [opt.width=null] Width of the canvas. Calculated by default.
   * @param {Number} [opt.height=null] Height of the canvas. Calculated by default.
   * @param {Boolean} [opt.autostart=false] Decide wether start the animation on boot.
   * @param {Number} [opt.pixelDepth=0.02] Number of step (in pixels) used when drawed on canvas.
   * @param {Number} [opt.lerpSpeed=0.01] Lerp speed to interpolate properties.
   */
  function SiriWave() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SiriWave);

    this.container = opt.container || document.body; // In this.opt you could find definitive opt with defaults values

    this.opt = Object.assign({
      style: 'ios',
      ratio: window.devicePixelRatio || 1,
      speed: 0.1,
      amplitude: 1,
      frequency: 6,
      color: '#fff',
      speedInterpolationSpeed: 0.05,
      amplitudeInterpolationSpeed: 0.005,
      cover: false,
      width: window.getComputedStyle(this.container).width.replace('px', ''),
      height: window.getComputedStyle(this.container).height.replace('px', ''),
      autostart: false,
      pixelDepth: 0.02,
      lerpSpeed: 0.01
    }, opt);
    /**
     * Max X coordinate to draw the graph
     */

    this.MAX_X = 2;
    /**
     * A really small value to consider a wave "dead" (used in iOS9)
     */

    this.DEAD_THRESHOLD = 0.05;
    /**
     * Phase of the wave (passed to Math.sin function)
     */

    this.phase = 0;
    /**
     * Boolean value indicating the the animation is running
     */

    this.run = false;
    /**
     * Actual speed of the animation. Is not safe to change this value directly, use `setSpeed` instead.
     */

    this.speed = Number(this.opt.speed);
    /**
     * Actual amplitude of the animation. Is not safe to change this value directly, use `setAmplitude` instead.
     */

    this.amplitude = Number(this.opt.amplitude);
    /**
     * Width of the canvas multiplied by pixel ratio
     */

    this.width = Number(this.opt.ratio * this.opt.width);
    /**
     * Height of the canvas multiplied by pixel ratio
     */

    this.height = Number(this.opt.ratio * this.opt.height);
    /**
     * Maximum height for a single wave
     */

    this.heightMax = Number(this.height / 2) - 6;
    /**
     * Color of the wave (used in Classic iOS)
     */

    this.color = this._hex2rgb(this.opt.color);
    /**
     * An object containing controller variables that need to be interpolated 
     * to an another value before to be actually changed
     */

    this.interpolation = {
      speed: this.speed,
      amplitude: this.amplitude
    };
    /**
     * Canvas DOM Element where curves will be drawn
     */

    this.canvas = document.createElement('canvas');
    /**
     * 2D Context from Canvas
     */

    this.ctx = this.canvas.getContext('2d'); // Set dimensions

    this.canvas.width = this.width;
    this.canvas.height = this.height; // By covering, we ensure the canvas is in the same size of the parent

    if (this.opt.cover === true) {
      this.canvas.style.width = this.canvas.style.height = '100%';
    } else {
      this.canvas.style.width = this.width / this.opt.ratio + 'px';
      this.canvas.style.height = this.height / this.opt.ratio + 'px';
    }
    /**
     * Curves objects to animate
     */


    this.curves = []; // Instantiate all curves based on the style

    if (this.opt.style === 'ios9') {
      var numberOfCurvesPerDef = 2;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = iOS9Curve.getDefinition()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var def = _step.value;

          for (var j = 0; j < numberOfCurvesPerDef; j++) {
            this.curves.push(new iOS9Curve({
              ctrl: this,
              definition: def
            }));
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Curve.getDefinition()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _def = _step2.value;
          this.curves.push(new Curve({
            ctrl: this,
            definition: _def
          }));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    } // Attach to the container


    this.container.appendChild(this.canvas); // Start the animation

    if (opt.autostart) {
      this.start();
    }
  }
  /**
   * Convert an HEX color to RGB
   * @param {String} hex
   * @returns RGB value that could be used
   * @memberof SiriWave
   */


  _createClass(SiriWave, [{
    key: "_hex2rgb",
    value: function _hex2rgb(hex) {
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? parseInt(result[1], 16).toString() + ',' + parseInt(result[2], 16).toString() + ',' + parseInt(result[3], 16).toString() : null;
    }
    /**
     * Interpolate a property to the value found in $.interpolation
     * @param {String} propertyStr
     * @returns
     * @memberof SiriWave
     */

  }, {
    key: "_lerp",
    value: function _lerp(propertyStr) {
      this[propertyStr] = lerp(this[propertyStr], this.interpolation[propertyStr], this.opt.lerpSpeed);
      return this[propertyStr];
    }
    /**
     * Clear the canvas
     * @memberof SiriWave
     */

  }, {
    key: "_clear",
    value: function _clear() {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = 'source-over';
    }
    /**
     * Draw all curves
     * @memberof SiriWave
     */

  }, {
    key: "_draw",
    value: function _draw() {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.curves[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var curve = _step3.value;
          curve.draw();
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
    /**
     * Clear the space, interpolate values, calculate new steps and draws
     * @returns
     * @memberof SiriWave
     */

  }, {
    key: "_startDrawCycle",
    value: function _startDrawCycle() {
      if (this.run === false) return;

      this._clear(); // Interpolate values


      this._lerp('amplitude');

      this._lerp('speed');

      this._draw();

      this.phase = (this.phase + Math.PI * this.speed) % (2 * Math.PI);
      raf(this._startDrawCycle.bind(this), 20);
    }
    /* API */

    /**
     * Start the animation
     * @memberof SiriWave
     */

  }, {
    key: "start",
    value: function start() {
      this.phase = 0;
      this.run = true;

      this._startDrawCycle();
    }
    /**
     * Stop the animation
     * @memberof SiriWave
     */

  }, {
    key: "stop",
    value: function stop() {
      this.phase = 0;
      this.run = false;
    }
    /**
     * Set a new value for a property (interpolated)
     * @param {String} propertyStr
     * @param {Number} v
     * @memberof SiriWave
     */

  }, {
    key: "set",
    value: function set(propertyStr, v) {
      this.interpolation[propertyStr] = Number(v);
    }
    /**
     * Set a new value for the speed property (interpolated)
     * @param {Number} v
     * @memberof SiriWave
     */

  }, {
    key: "setSpeed",
    value: function setSpeed(v) {
      this.set('speed', v);
    }
    /**
     * Set a new value for the amplitude property (interpolated)
     * @param {Number} v
     * @memberof SiriWave
     */

  }, {
    key: "setAmplitude",
    value: function setAmplitude(v) {
      this.set('amplitude', v);
    }
  }]);

  return SiriWave;
}();

export default SiriWave;
