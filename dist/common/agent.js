"use strict";

var _vectorHandler = _interopRequireDefault(require("./vector-handler"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/** 
 * Forgive the naming convention -- This should be "GameObject" or something like that. It sets all the visual properties for an
 * object that can visibly move around the screen
 */
var Agent = /*#__PURE__*/function () {
  function Agent(options) {
    _classCallCheck(this, Agent);
    if (!options) options = {};
    this.id = options.id || (Math.random() * 9999999999).toString(36);
    this.name = options.name || "Agent";
    this.color = options.color || "#000000";
    this.baseColor = this.color + "";
    this.drawer = options.drawer || Agent.defaultDrawer;
    this.colorQueue = [];
    this.backgroundColor = options.backgroundColor || null;
    this.outlineColor = options.outlineColor || "#FFFFFF33";
    this.vectorHandler = typeof p5 !== "undefined" ? _vectorHandler["default"].createP5Handler() : new _vectorHandler["default"]();
    this.position = this.vectorHandler.createVector(options.x || 0, options.y || 0);
    this.size = options.size;
    this.onPositionUpdate = typeof options.onPositionUpdate === "function" ? options.onPositionUpdate : null;
    this.onStop = typeof options.onStop === "function" ? options.onStop : null;
    if (typeof this.size !== "number" || this.size <= 0) this.size = 20;
  }
  _createClass(Agent, [{
    key: "pushColor",
    value: function pushColor(color) {
      if (typeof color !== "string" || !color) throw new Error("Invalid color: " + color);
      this.colorQueue.push(color);
    }
  }, {
    key: "flipColor",
    value: function flipColor() {
      if (this.colorQueue.length > 0) {
        this.color = this.colorQueue.shift();
        return true;
      }
      this.color = this.baseColor;
      return false;
    }
  }, {
    key: "draw",
    value: function draw(index) {
      this.defaultDrawer.draw(this.position, this);
    }
  }]);
  return Agent;
}();
_defineProperty(Agent, "defaultDrawer", {
  draw: function draw(position, sender) {
    // Draw the player
    stroke(sender.color);
    strokeWeight(1);
    fill(0);
    var pos = position;
    var x = pos.x;
    var y = pos.y;
    var w = sender.size;
    var h = sender.size;
    strokeWeight(1);
    if (!!sender.backgroundColor) fill(sender.backgroundColor);else noFill();
    ellipse(x, y, w, h);
  }
});
if (typeof module === 'undefined') {
  console.log("Can't export. Running Agent in-browser");
} else {
  module.exports = Agent;
}