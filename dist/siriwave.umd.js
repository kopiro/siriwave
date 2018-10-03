
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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

      this.controller = opt.controller;
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
        return this.controller.$.width / 2 + i * (this.controller.$.width / 4);
      }
    }, {
      key: "_ypos",
      value: function _ypos(i) {
        var att = this.controller.$.heightMax * this.controller.amplitude / this.definition.attenuation;
        return this.controller.$.height / 2 + this._globAttenuationEquation(i) * att * Math.sin(this.controller.frequency * i - this.controller.phase);
      }
    }, {
      key: "draw",
      value: function draw() {
        var ctx = this.controller.ctx;
        ctx.moveTo(0, 0);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(' + this.controller.color + ',' + this.definition.opacity + ')';
        ctx.lineWidth = this.definition.lineWidth;

        for (var i = -2; i <= 2; i += 0.01) {
          var y = this._ypos(i);

          if (Math.abs(i) >= 1.90) y = this.controller.$.height / 2;
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
    function iOS9Curve(opt) {
      _classCallCheck(this, iOS9Curve);

      this.controller = opt.controller;
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
        var y = -1 * Math.abs(Math.sin(this.tick)) * this.controller.amplitude * this.amplitude * this.controller.$.heightMax * Math.pow(1 / (1 + Math.pow(this.openClass * i, 2)), 2);

        if (Math.abs(y) < 0.001) {
          this._respawn();
        }

        return y;
      }
    }, {
      key: "_draw",
      value: function _draw(sign) {
        var ctx = this.controller.ctx;
        this.tick += this.controller.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI));
        ctx.beginPath();
        var xBase = this.controller.$.width / 2 + (-(this.controller.$.width / 4) + this.seed * (this.controller.$.width / 2));
        var yBase = this.controller.$.height / 2;
        var x, y;
        var xInit = null;

        for (var i = -3; i <= 3; i += 0.01) {
          x = xBase + i * (this.controller.$.width / 4);
          y = yBase + (sign || 1) * this._ypos(i);
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

  var SiriWave =
  /*#__PURE__*/
  function () {
    function SiriWave() {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, SiriWave);

      this.phase = 0;
      this.run = false;
      this.$ = {};

      if (opt.container == null) {
        console.warn("No container defined, using body");
        opt.container = document.body;
      }

      this.style = opt.style || 'ios';
      this.container = opt.container;
      this.width = opt.width || window.getComputedStyle(this.container).width.replace('px', '');
      this.height = opt.height || window.getComputedStyle(this.container).height.replace('px', '');
      this.ratio = opt.ratio || window.devicePixelRatio || 1;
      this.$.width = this.ratio * this.width;
      this.$.height = this.ratio * this.height;
      this.$.heightMax = this.$.height / 2 - 4; // Constructor opt

      this.amplitude = opt.amplitude == undefined ? 1 : opt.amplitude;
      this.speed = opt.speed == undefined ? 0.2 : opt.speed;
      this.frequency = opt.frequency == undefined ? 6 : opt.frequency;
      this.color = this._hex2rgb(opt.color || '#fff'); // Interpolation

      this.speedInterpolationSpeed = opt.speedInterpolationSpeed || 0.005;
      this.amplitudeInterpolationSpeed = opt.amplitudeInterpolationSpeed || 0.05;
      this.$.interpolation = {
        speed: this.speed,
        amplitude: this.amplitude
      }; // Canvas

      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = this.$.width;
      this.canvas.height = this.$.height;

      if (opt.cover) {
        this.canvas.style.width = this.canvas.style.height = '100%';
      } else {
        this.canvas.style.width = this.$.width / this.ratio + 'px';
        this.canvas.style.height = this.$.height / this.ratio + 'px';
      }

      this.curves = [];

      if (this.style === 'ios9') {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = iOS9Curve.getDefinition()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var def = _step.value;

            for (var j = 0; j < 3 * Math.random() | 0; j++) {
              this.curves.push(new iOS9Curve({
                controller: this,
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
              controller: this,
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
      } // Start


      this.container.appendChild(this.canvas);

      if (opt.autostart) {
        this.start();
      }
    }

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
    }, {
      key: "_interpolate",
      value: function _interpolate(propertyStr) {
        var increment = this[propertyStr + 'InterpolationSpeed'];

        if (Math.abs(this.$.interpolation[propertyStr] - this[propertyStr]) <= increment) {
          this[propertyStr] = this.$.interpolation[propertyStr];
        } else {
          if (this.$.interpolation[propertyStr] > this[propertyStr]) {
            this[propertyStr] += increment;
          } else {
            this[propertyStr] -= increment;
          }
        }
      }
    }, {
      key: "_clear",
      value: function _clear() {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillRect(0, 0, this.$.width, this.$.height);
        this.ctx.globalCompositeOperation = 'source-over';
      }
    }, {
      key: "_draw",
      value: function _draw() {
        for (var i = 0, len = this.curves.length; i < len; i++) {
          this.curves[i].draw();
        }
      }
    }, {
      key: "_startDrawCycle",
      value: function _startDrawCycle() {
        if (this.run === false) return;

        this._clear(); // Interpolate values


        this._interpolate('amplitude');

        this._interpolate('speed');

        this._draw();

        this.phase = (this.phase + Math.PI * this.speed) % (2 * Math.PI);

        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(this._startDrawCycle.bind(this));
        } else {
          setTimeout(this._startDrawCycle.bind(this), 20);
        }
      }
      /* API */

    }, {
      key: "start",
      value: function start() {
        this.phase = 0;
        this.run = true;

        this._startDrawCycle();
      }
    }, {
      key: "stop",
      value: function stop() {
        this.phase = 0;
        this.run = false;
      }
    }, {
      key: "setSpeed",
      value: function setSpeed(v) {
        this.$.interpolation.speed = v;
      }
    }, {
      key: "setAmplitude",
      value: function setAmplitude(v) {
        this.$.interpolation.amplitude = Math.max(Math.min(v, 1), 0);
      }
    }]);

    return SiriWave;
  }();

  return SiriWave;

})));
