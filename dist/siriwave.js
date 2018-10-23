(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.SiriWave = factory());
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

  function lerp(v0, v1, t) {
      return v0*(1-t)+v1*t
  }
  var lerp_1 = lerp;

  var iOS9Curve =
  /*#__PURE__*/
  function () {
    function iOS9Curve() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, iOS9Curve);

      this.ctrl = opt.ctrl;
      this.definition = opt.definition;
      this.GRAPH_X = 4;
      this.AMPLITUDE_FACTOR = 2;
      this.SPEED_FACTOR = 2;
      this.DEAD_PX = 1;
      this.NOOFCURVES_RANGES = [3, 6];
      this.AMPLITUDE_RANGES = [0.1, 0.6];
      this.SPEED_RANGES = [0.6, 1];
      this.OFFSET_RANGES = [-this.GRAPH_X / 2, this.GRAPH_X / 2];
      this.PARAMS_RANGES = [1, 2]; // The padding (left and right) to use when drawing waves

      this.PADDING_PX = 0.1 * this.ctrl.width;
      this.MAX_WIDTH_PX = this.ctrl.width - this.PADDING_PX * 2;
      this.MAX_WIDTH_EACH_CURVE_PX = this.MAX_WIDTH_PX * 0.7;
      this.xBasePoint = this.ctrl.width / 2 + ((Math.random() * 2 | 0) === 1 ? 1 : -1) * (Math.random() * this.PADDING_PX);

      this._respawn();
    }

    _createClass(iOS9Curve, [{
      key: "_getRandomRange",
      value: function _getRandomRange(e) {
        return e[0] + Math.random() * (e[1] - e[0]);
      }
    }, {
      key: "_respawnSingle",
      value: function _respawnSingle(ci) {
        this.phases[ci] = 0;
        this.offsets[ci] = this._getRandomRange(this.OFFSET_RANGES);
        this.speeds[ci] = this._getRandomRange(this.SPEED_RANGES);
        this.amplitudes[ci] = this._getRandomRange(this.AMPLITUDE_RANGES);
        this.params[ci] = this._getRandomRange(this.PARAMS_RANGES);
      }
    }, {
      key: "_respawn",
      value: function _respawn() {
        this.spawnAt = Date.now();
        this.noOfCurves = this.NOOFCURVES_RANGES[Math.random() * this.NOOFCURVES_RANGES | 0];
        this.phases = new Array(this.noOfCurves);
        this.offsets = new Array(this.noOfCurves);
        this.speeds = new Array(this.noOfCurves);
        this.amplitudes = new Array(this.noOfCurves);
        this.params = new Array(this.noOfCurves);

        for (var ci = 0; ci < this.noOfCurves; ci++) {
          this._respawnSingle(ci);
        }
      }
    }, {
      key: "_ypos",
      value: function _ypos(i) {
        var y = 0;

        for (var ci = 0; ci < this.noOfCurves; ci++) {
          var x = i + this.offsets[ci];
          y += Math.abs( // Actual real Y in the SIN function
          Math.sin(this.phases[ci]) * // Amplitude of current wave
          this.amplitudes[ci] * // Class of the wave
          Math.pow(1 / (1 + Math.pow(this.params[ci] * x, 2)), 2));
        } // Divide for NoOfCurves so that y <= 1


        y = y / this.noOfCurves;
        return this.AMPLITUDE_FACTOR * this.ctrl.heightMax * this.ctrl.amplitude * y;
      }
    }, {
      key: "_xpos",
      value: function _xpos(i) {
        return i / this.GRAPH_X * this.MAX_WIDTH_EACH_CURVE_PX;
      }
    }, {
      key: "draw",
      value: function draw() {
        var ctx = this.ctrl.ctx;
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = "lighter";

        if (this.definition.supportLine) {
          var coo = [0, this.ctrl.heightMax, this.ctrl.width, 1];
          var gradient = ctx.createLinearGradient.apply(ctx, coo);
          gradient.addColorStop(0, "transparent");
          gradient.addColorStop(0.1, "rgba(255,255,255,.5)");
          gradient.addColorStop(1 - 0.1 - 0.1, "rgba(255,255,255,.5)");
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fillRect.apply(ctx, coo);
          return;
        }

        for (var ci = 0; ci < this.noOfCurves; ci++) {
          this.phases[ci] += this.SPEED_FACTOR * this.ctrl.speed * this.speeds[ci] * Math.random();
        }

        var maxY = this._ypos(0);

        if (maxY < this.DEAD_PX && this.prevMaxY > maxY) {
          this.prevMaxY = maxY;

          this._respawn();

          return;
        }

        this.prevMaxY = maxY; // Write two opposite waves

        var _arr = [1, -1];

        for (var _i = 0; _i < _arr.length; _i++) {
          var sign = _arr[_i];
          ctx.beginPath(); // Cycle the graph from -X to +X every PX_DEPTH and draw the line

          for (var i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
            var x = this._xpos(i);

            var y = sign * this._ypos(i);

            ctx.lineTo(this.xBasePoint + x, this.ctrl.heightMax + y);
          } // Ensure path is fully closed


          ctx.lineTo(this.xBasePoint - this.MAX_WIDTH_EACH_CURVE_PX, this.ctrl.heightMax + 0);
          ctx.closePath();
          var grad = ctx.createLinearGradient(this.xBasePoint - this.MAX_WIDTH_EACH_CURVE_PX, 0, this.xBasePoint + this.MAX_WIDTH_EACH_CURVE_PX, this.ctrl.heightMax);
          ctx.fillStyle = "rgba(" + this.definition.color + ", 1)";
          ctx.fill();
        }
      }
    }], [{
      key: "getDefinition",
      value: function getDefinition() {
        return [{
          color: "255,255,255",
          supportLine: true
        }, {
          // blue
          color: "12, 107, 192"
        }, {
          // red
          color: "135, 46, 76"
        }, {
          // green
          color: "73, 226, 158"
        }];
      }
    }]);

    return iOS9Curve;
  }();

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var performanceNow = createCommonjsModule(function (module) {
  // Generated by CoffeeScript 1.12.2
  (function() {
    var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

    if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
      module.exports = function() {
        return performance.now();
      };
    } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
      module.exports = function() {
        return (getNanoSeconds() - nodeLoadTime) / 1e6;
      };
      hrtime = process.hrtime;
      getNanoSeconds = function() {
        var hr;
        hr = hrtime();
        return hr[0] * 1e9 + hr[1];
      };
      moduleLoadTime = getNanoSeconds();
      upTime = process.uptime() * 1e9;
      nodeLoadTime = moduleLoadTime - upTime;
    } else if (Date.now) {
      module.exports = function() {
        return Date.now() - loadTime;
      };
      loadTime = Date.now();
    } else {
      module.exports = function() {
        return new Date().getTime() - loadTime;
      };
      loadTime = new Date().getTime();
    }

  }).call(commonjsGlobal);


  });

  var root = typeof window === 'undefined' ? commonjsGlobal : window
    , vendors = ['moz', 'webkit']
    , suffix = 'AnimationFrame'
    , raf = root['request' + suffix]
    , caf = root['cancel' + suffix] || root['cancelRequest' + suffix];

  for(var i = 0; !raf && i < vendors.length; i++) {
    raf = root[vendors[i] + 'Request' + suffix];
    caf = root[vendors[i] + 'Cancel' + suffix]
        || root[vendors[i] + 'CancelRequest' + suffix];
  }

  // Some versions of FF have rAF but not cAF
  if(!raf || !caf) {
    var last = 0
      , id$1 = 0
      , queue = []
      , frameDuration = 1000 / 60;

    raf = function(callback) {
      if(queue.length === 0) {
        var _now = performanceNow()
          , next = Math.max(0, frameDuration - (_now - last));
        last = next + _now;
        setTimeout(function() {
          var cp = queue.slice(0);
          // Clear queue here to prevent
          // callbacks from appending listeners
          // to the current frame's queue
          queue.length = 0;
          for(var i = 0; i < cp.length; i++) {
            if(!cp[i].cancelled) {
              try{
                cp[i].callback(last);
              } catch(e) {
                setTimeout(function() { throw e }, 0);
              }
            }
          }
        }, Math.round(next));
      }
      queue.push({
        handle: ++id$1,
        callback: callback,
        cancelled: false
      });
      return id$1
    };

    caf = function(handle) {
      for(var i = 0; i < queue.length; i++) {
        if(queue[i].handle === handle) {
          queue[i].cancelled = true;
        }
      }
    };
  }

  var raf_1 = function(fn) {
    // Wrap in a new function to prevent
    // `cancel` potentially being assigned
    // to the native rAF function
    return raf.call(root, fn)
  };
  var cancel = function() {
    caf.apply(root, arguments);
  };
  var polyfill = function(object) {
    if (!object) {
      object = root;
    }
    object.requestAnimationFrame = raf;
    object.cancelAnimationFrame = caf;
  };
  raf_1.cancel = cancel;
  raf_1.polyfill = polyfill;

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
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = iOS9Curve.getDefinition()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var def = _step.value;
            this.curves.push(new iOS9Curve({
              ctrl: this,
              definition: def
            }));
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
        this[propertyStr] = lerp_1(this[propertyStr], this.interpolation[propertyStr], this.opt.lerpSpeed);
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
        raf_1(this._startDrawCycle.bind(this), 20);
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

  return SiriWave;

})));
