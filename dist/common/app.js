"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var App = /*#__PURE__*/function () {
  function App() {
    _classCallCheck(this, App);
    var options = (arguments.length <= 0 ? undefined : arguments[0]) || {};
    this.elementId = (options === null || options === void 0 ? void 0 : options.elementId) || "main-canvas";
    this.ui = (options === null || options === void 0 ? void 0 : options.ui) || null;
    this.text = "";
    this.globalAngle = 0;
    this.width = (options === null || options === void 0 ? void 0 : options.width) || 0;
    this.height = (options === null || options === void 0 ? void 0 : options.height) || 0;
    this.mounted = false;
    this.button = 0;
    this.needsEventListeners = 1;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.debugLevel = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
  }
  _createClass(App, [{
    key: "addEventListeners",
    value: function addEventListeners() {
      var _document;
      var suppressContextMenu = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var canvas = (_document = document) === null || _document === void 0 ? void 0 : _document.querySelector("canvas");
      if (!canvas) {
        if (this.needsEventListeners > 1) console.warn("No canvas to add event listener to (returning null)");
        this.needsEventListeners++;
        return null;
      }
      if (suppressContextMenu) {
        console.log("Canvas context menu suppressed. Right-click now available for app use");
        canvas.addEventListener("contextmenu", function (e) {
          if (typeof (e === null || e === void 0 ? void 0 : e.preventDefault) === "function") e.preventDefault();
          if (typeof (e === null || e === void 0 ? void 0 : e.stopPropagation) === "function") e.stopPropagation();
          if (typeof (e === null || e === void 0 ? void 0 : e.stopEvent) === "function") e.stopEvent();
          if (typeof (e === null || e === void 0 ? void 0 : e.stopEventPropagation) === "function") e.stopEventPropagation();
          return false;
        });
      } else console.log("Context menu is active.");
      delete this.needsEventListeners;
      return canvas;
    }
  }, {
    key: "isCanvasClick",
    value: function isCanvasClick(e) {
      var target = e === null || e === void 0 ? void 0 : e.target;
      var b = false;

      // Only allow mouse clicks on the canvas.
      if (((target === null || target === void 0 ? void 0 : target.tagName) || "").toString().toUpperCase() !== "CANVAS") {
        return false;
      } else {
        b = true;
      }
      this.button = typeof (e === null || e === void 0 ? void 0 : e.button) === "number" ? e.button : this.button;
      e.stopPropagation();
      e.preventDefault();
      return b;
    }
  }, {
    key: "update",
    value: function update() {
      //
    }
  }, {
    key: "getCanvas",
    value: function getCanvas() {
      var _canvas$tagName, _canvas$tagName2;
      var canvas = document.getElementById("defaultCanvas0"); // Default p5 canvas id
      if (!!canvas && ((_canvas$tagName = canvas.tagName) === null || _canvas$tagName === void 0 ? void 0 : _canvas$tagName.toLowerCase()) === "canvas") return canvas;
      canvas = document.getElementsByTagName("canvas");
      if (Array.isArray(canvas)) canvas = canvas[0];
      if (!!canvas && ((_canvas$tagName2 = canvas.tagName) === null || _canvas$tagName2 === void 0 ? void 0 : _canvas$tagName2.toLowerCase()) === "canvas") return canvas;
      return canvas || null;
    }
  }, {
    key: "refreshCanvas",
    value: function refreshCanvas() {
      if (!this.context) {
        var canvas = this.getCanvas();
        this.context = canvas === null || canvas === void 0 ? void 0 : canvas.getContext("2d");
      }
      if (!!this.context) this.context.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Updates the size of the drawing canvas based on its html element container.
     * Each particle references this app object to get the global property values where needed.
     * Height/width, in this case
     * @param {string} elementId - The html elementId (<main id=""></main>) of the element to use for the canvas size
     * @returns {object} - The canvas size object { width: number, height: number }
     */
  }, {
    key: "updateCanvasSize",
    value: function updateCanvasSize(elementId) {
      var _canvas, _canvas2;
      if (typeof elementId !== "string" || elementId.length === 0) elementId = this.elementId;
      var canvas = document.getElementById(elementId);
      if (!canvas) {
        var items = document.getElementsByTagName("canvas");
        if ((items === null || items === void 0 ? void 0 : items.length) > 0) canvas = items[0];else return;
      }
      if (!canvas) {
        var message = typeof elementId !== "string" ? "There was no elementId provided to the updateCanvasSize() function." : "Be sure to add a <main></main> element with id='" + elementId + "' to the html page.";
        throw new Error("No canvas found: " + message);
      }
      this.width = typeof ((_canvas = canvas) === null || _canvas === void 0 ? void 0 : _canvas.offsetWidth) === 'number' ? canvas.offsetWidth : 800;
      this.height = typeof ((_canvas2 = canvas) === null || _canvas2 === void 0 ? void 0 : _canvas2.offsetHeight) === 'number' ? canvas.offsetHeight - 1 : 500;
    }
  }], [{
    key: "initMainMenu",
    value: function initMainMenu() {
      var hide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var menu = $('#main-menu');
      if (!menu.get(0)) return;
      menu.empty();
      if (!(hide !== null && hide !== void 0 && hide.home)) menu.append('<a href="/">Home</a>');
      if (!(hide !== null && hide !== void 0 && hide.particles)) menu.append('<a href="/lib/particles">Particle Life</a>');
      if (!(hide !== null && hide !== void 0 && hide.neuro)) menu.append('<a href="/lib/neuro">Neural Networs</a>');
      if (!(hide !== null && hide !== void 0 && hide.tentacles)) menu.append('<a href="/lib/tentacles">Tentacles</a>');
    }
  }]);
  return App;
}();
_defineProperty(App, "defaultDrawer", {
  draw: function draw(position, sender) {
    throw new Error("App: No drawer specified.");
  }
});
if (typeof module === 'undefined') {
  console.log("Can't export. Running App in-browser");
} else {
  module.exports = App;
}