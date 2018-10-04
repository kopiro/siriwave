var SiriWave = (function () {
  'use strict';

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
    }

    _createClass(Curve, [{
      key: "_globAttenuationEquation",
      value: function _globAttenuationEquation(x) {
        return Math.pow(4 / (4 + Math.pow(x, 4)), 4);
      }
    }, {
      key: "_xpos",
      value: function _xpos(i) {
        return this.ctrl.width / 2 + i * (this.ctrl.width / 4);
      }
    }, {
      key: "_ypos",
      value: function _ypos(i) {
        var att = this.ctrl.heightMax * this.ctrl.amplitude / this.definition.attenuation;
        return this.ctrl.height / 2 + this._globAttenuationEquation(i) * att * Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase);
      }
    }, {
      key: "draw",
      value: function draw() {
        var ctx = this.ctrl.ctx;
        ctx.moveTo(0, 0);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(' + this.ctrl.color + ',' + this.definition.opacity + ')';
        ctx.lineWidth = this.definition.lineWidth;

        for (var i = -this.ctrl.MAX_X; i <= this.ctrl.MAX_X; i += this.ctrl.opt.pixelDepth) {
          var y = this._ypos(i);

          if (Math.abs(i) >= 1.90) y = this.ctrl.height / 2;
          ctx.lineTo(this._xpos(i), y);
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
      this.tick = 0;

      this._respawn();
    }

    _createClass(iOS9Curve, [{
      key: "_respawn",
      value: function _respawn() {
        this.amplitude = 0.3 + Math.random() * 0.7;
        this.seed = Math.random();
        this.openClass = 2 + Math.random() * 3 | 0;
      }
    }, {
      key: "_ypos",
      value: function _ypos(i) {
        var y = -1 * // Actual real Y in the SIN function
        Math.abs(Math.sin(this.tick)) * // Amplitude of the original controller
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
      key: "_draw",
      value: function _draw(sign) {
        var ctx = this.ctrl.ctx;
        this.tick += this.ctrl.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI));
        ctx.beginPath();
        var xBase = this.ctrl.width / 2 + (-(this.ctrl.width / 4) + this.seed * (this.ctrl.width / 2));
        var yBase = this.ctrl.height / 2;
        var x, y, xInit;

        for (var i = -this.ctrl.MAX_X; i <= this.ctrl.MAX_X; i += this.ctrl.opt.pixelDepth) {
          x = xBase + i * (this.ctrl.width / 4);
          y = yBase + sign * this._ypos(i);
          if (xInit == null) xInit = x;
          ctx.lineTo(x, y);
        }

        var height = Math.abs(this._ypos(0));
        var gradient = ctx.createRadialGradient(xBase, yBase, height * 1.15, xBase, yBase, height * 0.3);
        gradient.addColorStop(0, 'rgba(' + this.definition.color + ', 0.4)');
        gradient.addColorStop(1, 'rgba(' + this.definition.color + ', 0.2)');
        ctx.fillStyle = gradient;
        ctx.lineTo(xInit, yBase);
        ctx.closePath();
        ctx.fill();
      }
    }, {
      key: "draw",
      value: function draw() {
        this._draw(-1);

        this._draw(1);
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
     * @param {Number} [opt.speedInterpolationSpeed=0.005] The increment to add when interpolating the speed property.
     * @param {Number} [opt.speedInterpolationSpeed=0.005] The increment to add when interpolating the amplitude property.
     * @param {Boolean} [opt.cover=false] The `canvas` covers the entire width or height of the container.
     * @param {Number} [opt.width=null] Width of the canvas. Calculated by default.
     * @param {Number} [opt.height=null] Height of the canvas. Calculated by default.
     * @param {Boolean} [opt.autostart=false] Decide wether start the animation on boot.
     * @param {Number} [opt.pixelDepth=0.01] Number of step (in pixels) used when drawed on canvas.
     */
    function SiriWave() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, SiriWave);

      this.container = opt.container || document.body; // In this.opt you could find definitive opt with defaults values

      this.opt = Object.assign({
        style: 'ios',
        ratio: window.devicePixelRatio || 1,
        speed: 0.2,
        amplitude: 1,
        frequency: 6,
        color: '#fff',
        speedInterpolationSpeed: 0.005,
        amplitudeInterpolationSpeed: 0.005,
        cover: false,
        width: window.getComputedStyle(this.container).width.replace('px', ''),
        height: window.getComputedStyle(this.container).height.replace('px', ''),
        autostart: false,
        pixelDepth: 0.01
      }, opt);
      /**
       * Max X coordinate to draw the graph
       */

      this.MAX_X = 2;
      /**
       * A really small value to consider a wave "dead" (used in iOS9)
       */

      this.DEAD_THRESHOLD = 0.001;
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

      this.heightMax = Number(this.height / 2) - 4;
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
        var numberOfCurvesPerDef = 3 * Math.random() | 0;
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
      key: "_interpolate",
      value: function _interpolate(propertyStr) {
        // This is how much we have to add in every iteration
        var increment = this.opt[propertyStr + 'InterpolationSpeed'];

        if (increment == null) {
          throw new Error('Unable to retrieve increment for: ' + propertyStr);
        } // We reached the end


        if (Math.abs(this.interpolation[propertyStr] - this[propertyStr]) <= increment) {
          this[propertyStr] = this.interpolation[propertyStr];
          return;
        } // Add or subtract the property for the increment


        if (this.interpolation[propertyStr] > this[propertyStr]) {
          this[propertyStr] += increment;
        } else {
          this[propertyStr] -= increment;
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


        this._interpolate('amplitude');

        this._interpolate('speed');

        this._draw();

        this.phase = (this.phase + Math.PI * this.opt.speed) % (2 * Math.PI);
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
       * Set a new value for the speed property (interpolated)
       * @param {Number} v
       * @memberof SiriWave
       */

    }, {
      key: "setSpeed",
      value: function setSpeed(v) {
        this.interpolation.speed = v;
      }
      /**
       * Set a new value for the amplitude property (interpolated)
       * @param {Number} v
       * @memberof SiriWave
       */

    }, {
      key: "setAmplitude",
      value: function setAmplitude(v) {
        this.interpolation.amplitude = Math.max(Math.min(v, 1), 0);
      }
    }]);

    return SiriWave;
  }();

  return SiriWave;

}());
