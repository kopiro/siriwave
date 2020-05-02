(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.SiriWave = factory());
}(this, (function () { 'use strict';

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

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelper(o) {
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var it,
        normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  function lerp(v0, v1, t) {
      return v0*(1-t)+v1*t
  }
  var lerp_1 = lerp;

  var Curve = /*#__PURE__*/function () {
    function Curve(opt) {
      _classCallCheck(this, Curve);

      this.ctrl = opt.ctrl;
      this.definition = opt.definition;
      this.ATT_FACTOR = 4;
      this.GRAPH_X = 2;
      this.AMPLITUDE_FACTOR = 0.6;
    }

    _createClass(Curve, [{
      key: "globalAttFn",
      value: function globalAttFn(x) {
        return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)), this.ATT_FACTOR);
      }
    }, {
      key: "_xpos",
      value: function _xpos(i) {
        return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
      }
    }, {
      key: "_ypos",
      value: function _ypos(i) {
        return this.AMPLITUDE_FACTOR * (this.globalAttFn(i) * (this.ctrl.heightMax * this.ctrl.amplitude) * (1 / this.definition.attenuation) * Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase));
      }
    }, {
      key: "draw",
      value: function draw() {
        var ctx = this.ctrl.ctx;
        ctx.moveTo(0, 0);
        ctx.beginPath();
        var color = this.ctrl.color.replace(/rgb\(/g, "").replace(/\)/g, "");
        ctx.strokeStyle = "rgba(".concat(color, ",").concat(this.definition.opacity, ")");
        ctx.lineWidth = this.definition.lineWidth; // Cycle the graph from -X to +X every PX_DEPTH and draw the line

        for (var i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
          ctx.lineTo(this._xpos(i), this.ctrl.heightMax + this._ypos(i));
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

  var iOS9Curve = /*#__PURE__*/function () {
    function iOS9Curve() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, iOS9Curve);

      this.ctrl = opt.ctrl;
      this.definition = opt.definition;
      this.GRAPH_X = 25;
      this.AMPLITUDE_FACTOR = 0.8;
      this.SPEED_FACTOR = 1;
      this.DEAD_PX = 2;
      this.ATT_FACTOR = 4;
      this.DESPAWN_FACTOR = 0.02;
      this.NOOFCURVES_RANGES = [2, 5];
      this.AMPLITUDE_RANGES = [0.3, 1];
      this.OFFSET_RANGES = [-3, 3];
      this.WIDTH_RANGES = [1, 3];
      this.SPEED_RANGES = [0.5, 1];
      this.DESPAWN_TIMEOUT_RANGES = [500, 2000];
      this.respawn();
    }

    _createClass(iOS9Curve, [{
      key: "getRandomRange",
      value: function getRandomRange(e) {
        return e[0] + Math.random() * (e[1] - e[0]);
      }
    }, {
      key: "respawnSingle",
      value: function respawnSingle(ci) {
        this.phases[ci] = 0;
        this.amplitudes[ci] = 0;
        this.despawnTimeouts[ci] = this.getRandomRange(this.DESPAWN_TIMEOUT_RANGES);
        this.offsets[ci] = this.getRandomRange(this.OFFSET_RANGES);
        this.speeds[ci] = this.getRandomRange(this.SPEED_RANGES);
        this.finalAmplitudes[ci] = this.getRandomRange(this.AMPLITUDE_RANGES);
        this.widths[ci] = this.getRandomRange(this.WIDTH_RANGES);
        this.verses[ci] = this.getRandomRange([-1, 1]);
      }
    }, {
      key: "respawn",
      value: function respawn() {
        this.spawnAt = Date.now();
        this.noOfCurves = Math.floor(this.getRandomRange(this.NOOFCURVES_RANGES));
        this.phases = new Array(this.noOfCurves);
        this.offsets = new Array(this.noOfCurves);
        this.speeds = new Array(this.noOfCurves);
        this.finalAmplitudes = new Array(this.noOfCurves);
        this.widths = new Array(this.noOfCurves);
        this.amplitudes = new Array(this.noOfCurves);
        this.despawnTimeouts = new Array(this.noOfCurves);
        this.verses = new Array(this.noOfCurves);

        for (var ci = 0; ci < this.noOfCurves; ci++) {
          this.respawnSingle(ci);
        }
      }
    }, {
      key: "globalAttFn",
      value: function globalAttFn(x) {
        return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, 2)), this.ATT_FACTOR);
      }
    }, {
      key: "sin",
      value: function sin(x, phase) {
        return Math.sin(x - phase);
      }
    }, {
      key: "_grad",
      value: function _grad(x, a, b) {
        if (x > a && x < b) return 1;
        return 1;
      }
    }, {
      key: "yRelativePos",
      value: function yRelativePos(i) {
        var y = 0;

        for (var ci = 0; ci < this.noOfCurves; ci++) {
          // Generate a static T so that each curve is distant from each oterh
          var t = 4 * (-1 + ci / (this.noOfCurves - 1) * 2); // but add a dynamic offset

          t += this.offsets[ci];
          var k = 1 / this.widths[ci];
          var x = i * k - t;
          y += Math.abs(this.amplitudes[ci] * this.sin(this.verses[ci] * x, this.phases[ci]) * this.globalAttFn(x));
        } // Divide for NoOfCurves so that y <= 1


        return y / this.noOfCurves;
      }
    }, {
      key: "_ypos",
      value: function _ypos(i) {
        return this.AMPLITUDE_FACTOR * this.ctrl.heightMax * this.ctrl.amplitude * this.yRelativePos(i) * this.globalAttFn(i / this.GRAPH_X * 2);
      }
    }, {
      key: "_xpos",
      value: function _xpos(i) {
        return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
      }
    }, {
      key: "drawSupportLine",
      value: function drawSupportLine(ctx) {
        var coo = [0, this.ctrl.heightMax, this.ctrl.width, 1];
        var gradient = ctx.createLinearGradient.apply(ctx, coo);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.1, "rgba(255,255,255,.5)");
        gradient.addColorStop(1 - 0.1 - 0.1, "rgba(255,255,255,.5)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect.apply(ctx, coo);
      }
    }, {
      key: "draw",
      value: function draw() {
        var ctx = this.ctrl.ctx;
        ctx.globalAlpha = 0.7;
        ctx.globalCompositeOperation = "lighter";

        if (this.definition.supportLine) {
          // Draw the support line
          return this.drawSupportLine(ctx);
        }

        for (var ci = 0; ci < this.noOfCurves; ci++) {
          if (this.spawnAt + this.despawnTimeouts[ci] <= Date.now()) {
            this.amplitudes[ci] -= this.DESPAWN_FACTOR;
          } else {
            this.amplitudes[ci] += this.DESPAWN_FACTOR;
          }

          this.amplitudes[ci] = Math.min(Math.max(this.amplitudes[ci], 0), this.finalAmplitudes[ci]);
          this.phases[ci] = (this.phases[ci] + this.ctrl.speed * this.speeds[ci] * this.SPEED_FACTOR) % (2 * Math.PI);
        }

        var maxY = -Infinity;

        for (var _i = 0, _arr = [1, -1]; _i < _arr.length; _i++) {
          var sign = _arr[_i];
          ctx.beginPath();

          for (var i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
            var x = this._xpos(i);

            var y = this._ypos(i);

            ctx.lineTo(x, this.ctrl.heightMax - sign * y);
            maxY = Math.max(maxY, y);
          }

          ctx.closePath();
          ctx.fillStyle = "rgba(".concat(this.definition.color, ", 1)");
          ctx.strokeStyle = "rgba(".concat(this.definition.color, ", 1)");
          ctx.fill();
        }

        if (maxY < this.DEAD_PX && this.prevMaxY > maxY) {
          this.respawn();
        }

        this.prevMaxY = maxY;
        return null;
      }
    }], [{
      key: "getDefinition",
      value: function getDefinition(waveColors) {
        return Object.assign([{
          color: "255,255,255",
          supportLine: true
        }, {
          // blue
          color: "15, 82, 169"
        }, {
          // red
          color: "173, 57, 76"
        }, {
          // green
          color: "48, 220, 155"
        }], waveColors);
      }
    }]);

    return iOS9Curve;
  }();

  var SiriWave = /*#__PURE__*/function () {
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
     * @param {Number} [opt.lerpSpeed=0.1] Lerp speed to interpolate properties.
     */
    function SiriWave() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, SiriWave);

      this.container = opt.container || document.body; // In this.opt you could find definitive opt with defaults values

      this.opt = Object.assign({
        style: "ios",
        ratio: window.devicePixelRatio || 1,
        speed: 0.2,
        amplitude: 1,
        frequency: 6,
        color: "#fff",
        cover: false,
        width: window.getComputedStyle(this.container).width.replace("px", ""),
        height: window.getComputedStyle(this.container).height.replace("px", ""),
        autostart: false,
        pixelDepth: 0.02,
        lerpSpeed: 0.1
      }, opt);
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

      this.color = "rgb(".concat(this.hex2rgb(this.opt.color), ")");
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

      this.canvas = document.createElement("canvas");
      /**
       * 2D Context from Canvas
       */

      this.ctx = this.canvas.getContext("2d"); // Set dimensions

      this.canvas.width = this.width;
      this.canvas.height = this.height; // By covering, we ensure the canvas is in the same size of the parent

      if (this.opt.cover === true) {
        this.canvas.style.width = this.canvas.style.height = "100%";
      } else {
        this.canvas.style.width = "".concat(this.width / this.opt.ratio, "px");
        this.canvas.style.height = "".concat(this.height / this.opt.ratio, "px");
      }
      /**
       * Curves objects to animate
       */


      this.curves = []; // Instantiate all curves based on the style

      if (this.opt.style === "ios9") {
        var _iterator = _createForOfIteratorHelper(iOS9Curve.getDefinition(this.opt.waveColors || [])),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var def = _step.value;
            this.curves.push(new iOS9Curve({
              ctrl: this,
              definition: def
            }));
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        var _iterator2 = _createForOfIteratorHelper(Curve.getDefinition()),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _def = _step2.value;
            this.curves.push(new Curve({
              ctrl: this,
              definition: _def
            }));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
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
      key: "hex2rgb",
      value: function hex2rgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
          return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? "".concat(parseInt(result[1], 16).toString(), ",").concat(parseInt(result[2], 16).toString(), ",").concat(parseInt(result[3], 16).toString()) : null;
      }
      /**
       * Interpolate a property to the value found in $.interpolation
       * @param {String} propertyStr
       * @returns
       * @memberof SiriWave
       */

    }, {
      key: "lerp",
      value: function lerp(propertyStr) {
        this[propertyStr] = lerp_1(this[propertyStr], this.interpolation[propertyStr], this.opt.lerpSpeed);

        if (this[propertyStr] - this.interpolation[propertyStr] === 0) {
          this.interpolation[propertyStr] = null;
        }

        return this[propertyStr];
      }
      /**
       * Clear the canvas
       * @memberof SiriWave
       */

    }, {
      key: "_clear",
      value: function _clear() {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "source-over";
      }
      /**
       * Draw all curves
       * @memberof SiriWave
       */

    }, {
      key: "_draw",
      value: function _draw() {
        var _iterator3 = _createForOfIteratorHelper(this.curves),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var curve = _step3.value;
            curve.draw();
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
      /**
       * Clear the space, interpolate values, calculate new steps and draws
       * @returns
       * @memberof SiriWave
       */

    }, {
      key: "startDrawCycle",
      value: function startDrawCycle() {
        if (this.run === false) return;

        this._clear(); // Interpolate values


        if (this.interpolation.amplitude !== null) this.lerp("amplitude");
        if (this.interpolation.speed !== null) this.lerp("speed");

        this._draw();

        this.phase = (this.phase + Math.PI / 2 * this.speed) % (2 * Math.PI);

        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(this.startDrawCycle.bind(this));
        } else {
          setTimeout(this.startDrawCycle.bind(this), 20);
        }
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
        this.startDrawCycle();
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
        this.set("speed", v);
      }
      /**
       * Set a new value for the amplitude property (interpolated)
       * @param {Number} v
       * @memberof SiriWave
       */

    }, {
      key: "setAmplitude",
      value: function setAmplitude(v) {
        this.set("amplitude", v);
      }
    }]);

    return SiriWave;
  }();

  return SiriWave;

})));
