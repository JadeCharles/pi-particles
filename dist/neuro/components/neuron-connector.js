"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Logical representation of a neural network's neuron weight connection.
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
 */
var NeuronConnector = /*#__PURE__*/function () {
  function NeuronConnector(source, dest) {
    _classCallCheck(this, NeuronConnector);
    if (!source) throw new Error("NeuronConnector must have a source neuron");
    if (!dest) throw new Error("NeuronConnector must have a destination neuron");
    this.id = (Math.random() * 9999999999).toString(36) + "-" + new Date().getTime().toString();
    this.source = source;
    this.dest = dest;
    this.drawer = NeuronConnector.defaultDrawer;
    this.didDraw = false;
    this.label = null;
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    var options = (args === null || args === void 0 ? void 0 : args.length) > 0 ? args[0] : {};
    this.weight = typeof options === "number" ? options : options.weight;
    this.weightDelta = 0.0;
    this.rawValue = 0.0;
    this.contributionPercent = 0.0;
    this.color = (args === null || args === void 0 ? void 0 : args.length) > 1 ? args[1] : options.color || "#FFFFFF55";
    this.colorWeight = 0;
    if (typeof this.weight !== "number") this.weight = Neuron.randomWeight();
  }

  /**
   * Calculates the source neuron's activated value * weight
   * @param {string|null} label - Label to draw on the connector (optional)
   * @returns {number} - The activated value of the neuron
   */
  _createClass(NeuronConnector, [{
    key: "calculate",
    value: function calculate() {
      var _this$source;
      var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (typeof ((_this$source = this.source) === null || _this$source === void 0 ? void 0 : _this$source.value) !== "number") throw new Error("NeuronConnector must have a source neuron");
      if (typeof this.weight !== "number") throw new Error("NeuronConnector must have a value");
      this.label = label;
      var v = this.source.value * this.weight;
      this.rawValue = v;
      this.colorWeight = v;
      return v;
    }

    /**
     * Draws the neuron
     * @param {number} layerIndex - Index of the drawn neuron - For drawing purposes only
     */
  }, {
    key: "draw",
    value: function draw() {
      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.drawer.draw(null, this);
    }
  }]);
  return NeuronConnector;
}();
_defineProperty(NeuronConnector, "_nonce", 0);
/** Uses p5.js - Make sure it's included */
_defineProperty(NeuronConnector, "defaultDrawer", {
  draw: function draw(position, sender) {
    if (NeuronConnector._nonce === 0) {
      console.error("NeuronRunner: No drawer specified. Neuron Connectors will not be drawn.");
      NeuronConnector._nonce++;
    }
  }
});
if (typeof module === 'undefined') {
  console.log("Can't export. Running NeuronConnector in-browser");
} else {
  module.exports = NeuronConnector;
}