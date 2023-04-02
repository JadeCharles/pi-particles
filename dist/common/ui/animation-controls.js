"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/** UI that renders the play/pause, fast-forward, and reset buttons. Uses JQuery */
var AnimationControls = /*#__PURE__*/function () {
  function AnimationControls() {
    _classCallCheck(this, AnimationControls);
  }
  _createClass(AnimationControls, [{
    key: "controller",
    value: function controller(app, options) {
      if (_typeof(options) !== "object" || options === null) options = {};
      this.app = app;
      this.elementId = options.elementId || "controls";
      this.updateUi();
    }
  }, {
    key: "updateUi",
    value: function updateUi() {
      var app = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (!app) app = this.app;
      if (!app) throw new Error("No app provided for AnimationControls");
      var display = (typeof app.getDisplay === "function" ? app.getDisplay() : null) || "";
      if (!display) {
        display = "Paused";
        if (app.isRunning) {
          if (app.particles.length === 0) display = "No Particles";else display = "Playing";
        }
      }
      var options = {
        display: display
      };
      AnimationControls.createUi(app, options);
    }
  }], [{
    key: "createUi",
    value: function createUi(app) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (_typeof(app) !== "object" || app === null) throw new Error("Invalid app.");
      if (!options) options = {};
      var controlsId = app.controlsElementId || "controls";
      var controller = $('#' + controlsId);
      var needsToAppend = false;
      if (!controller.get(0)) {
        needsToAppend = true;
        controller = $('<span id="' + controlsId + '"></span>');
      }
      var playIcon = app.isRunning ? 'fa-pause' : 'fa-play';
      var display = options.display || (typeof app.getDisplay === "function" ? app.getDisplay() : null) || "";
      controller.html('');
      controller.append("\n            <span class=\"control-display\">" + display + "</span>\n            \n            <span class=\"control\" id=\"play-pause\">\n                <i class=\"fa-solid " + playIcon + "\"></i>\n            </span>\n            <span class=\"control\" id=\"speed-up\">\n                <i class=\"fa-regular fa-forward-fast\"></i>\n            </span>\n            \n            <span class=\"control\" id=\"reset\">\n                <i class=\"fa-solid fa-power-off\"></i>\n            </span>\n        ");
      var playButton = controller.find('#play-pause');
      var speedUpButton = controller.find('#speed-up');
      var resetButton = controller.find('#reset');
      playButton.off();
      playButton.click(function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        app.togglePlay();
      });
      speedUpButton.off();
      speedUpButton.click(function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof app.setSpeed !== "function") {
          console.error("Failed to set speed because the app does not have a setSpeed(number) function");
          return;
        }
        var speed = (app.speed || 0) + 0.25;
        if (speed > 3.0) speed = 0.25;
        app.setSpeed(speed);
      });
      resetButton.off();
      resetButton.click(function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof app.reset !== "function") console.error("The app does not have a reset function");else app.reset();
      });
      if (needsToAppend === true) {
        var containerId = options.containerId || "main-header";
        $('h1#' + containerId).append(controller);
      }
    }
  }]);
  return AnimationControls;
}();
if (typeof module === 'undefined') {
  console.log("Can't export. Running AnimationControls in-browser");
} else {
  module.exports = AnimationControls;
}