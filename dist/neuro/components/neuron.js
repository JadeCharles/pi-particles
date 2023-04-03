"use strict";

var _appVisualNeuro = _interopRequireDefault(require("../apps/app.visual-neuro.js"));
var _neuronLayer = _interopRequireDefault(require("./neuron-layer.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _readOnlyError(name) { throw new TypeError("\"" + name + "\" is read-only"); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } // if (typeof require !== "undefined") { 
//     const NeuroApp = require("../apps/app.visual-neuro.js");
//     const NeuronLayer = require("./neuron-layer.js");
// }
/**
 * Logical representation of a neuron in a neural network. 
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
 * 
 * @dependencies: NeuroApp, NeuroAgent, NeuroConnector
 */
var Neuron = /*#__PURE__*/function () {
  function Neuron(layer, options) {
    var _this = this;
    _classCallCheck(this, Neuron);
    if (!layer) throw new Error("Neuron must be created with a layer");
    if (!options) options = {};
    this.layer = layer;
    this.selectedColor = "yellow";
    this.vectorHandler = VectorHandler.createP5Handler();
    this.drawer = options.drawer || Neuron.defaultDrawer;
    this.speed = 1.0;
    this.squashFunction = layer.network.squashFunction;
    this.index = options.index;
    this.forwardConnectors = [];
    this.backConnectors = [];
    this.targetPos = null;
    this.error = 0.0; // The sum of all the error from the next (to the right) layer

    this.isBias = options.isBias === true;
    this.isSelected = options.isSelected === true;
    this.label = null;
    this.weightTotal = 0;

    // Neuron border color
    if (!options.color) options.color = Neuron.defaultColor;
    this.agent = new Agent(options);
    this.agent.onPositionUpdate = this.onAgentMove;
    if (this.isBias) {
      this.agent.color = options.color || "#88FFFF";
      this.agent.backgroundColor = this.agent.color;
      this.rawValue = 1.0; //typeof options.rawValue === "number" ? options.rawValue : 1.0;
      this.value = 1.0; //typeof options.value === "number" ? options.value : 1.0;
    } else {
      this.rawValue = typeof options.rawValue === "number" ? options.rawValue : 0;
      this.value = typeof options.value === "number" ? options.value : 0;
    }
    this.didDraw = false;
    this.squash = this.squashFunction.squash;
    if (typeof this.squash !== "function") {
      console.warn("this.squashFunction type: " + _typeof(this.squashFunction).toString());
      console.warn("this.squash: " + _typeof(this.squash));
      throw new Error("Invalid activation function: " + this.squash);
    }
    this.movePosition = typeof options.movePosition === "function" ? options.movePosition : function () {
      return Neuron.moveNeuronPosition(_this);
    };
    this.deSquash = this.squashFunction.getDerivative;
    this.deSquashPartial = this.squashFunction.getPartialDerivative;
    if (typeof this.index !== "number" || this.index < 0) this.index = layer.neurons.length;
  }
  _createClass(Neuron, [{
    key: "setTargetPos",
    value: function setTargetPos(x, y) {
      this.targetPos = createVector(x, y);
    }

    /**
     * Connects this neuron to the next and prev layers
     * @param {NeuronLayer|null} nextLayer - Next layer to connect to
     * @param {NeuronLayer|null} prevtLayer - Previous layer to connect from
     * @returns {Neuron} - Return this to allow for chaining
     */
  }, {
    key: "connect",
    value: function connect(nextLayer, prevLayer) {
      var _this2 = this;
      var initialWeightValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var connectors = [];
      if (!!nextLayer) {
        for (var i = 0; i < nextLayer.neurons.length; i++) {
          var n = nextLayer.neurons[i];
          if (n.isBias !== true) {
            var options = {
              weight: initialWeightValue
            };
            var c = new NeuronConnector(this, n, options);
            connectors.push(c);
          }
        }
        this.forwardConnectors = connectors;
      }
      if (!!prevLayer) {
        var backConnectors = [];
        for (var _i = 0; _i < prevLayer.neurons.length; _i++) {
          var _n = prevLayer.neurons[_i];
          var _connectors = _n.forwardConnectors.filter(function (c) {
            return c.dest === _this2;
          });
          backConnectors.push.apply(backConnectors, _toConsumableArray(_connectors));
        }
        this.backConnectors = backConnectors;
      }
      return this;
    }
  }, {
    key: "randomizeWeights",
    value: function randomizeWeights() {
      var miniMaxValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var connectorCount = this.forwardConnectors.length;
      miniMaxValue = typeof miniMaxValue !== "number" || miniMaxValue === 0 ? Neuron.maxWeightValue : miniMaxValue;
      for (var i = 0; i < connectorCount; i++) this.forwardConnectors[i].weight = Neuron.randomWeight(miniMaxValue);
    }
  }, {
    key: "activate",
    value: function activate() {
      if (this.backConnectors.length === 0) return this.value;
      var wt = 0;
      var rawValues = this.backConnectors.map(function (c) {
        wt += c.weight;
        return c.calculate();
      });
      this.weightTotal = wt;
      this.rawValue = rawValues.reduce(function (a, b) {
        return a + b;
      }, 0);
      this.value = this.squash(this.rawValue);
      return this.value;
    }
  }, {
    key: "reset",
    value: function reset() {
      var deltas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return this;
    }

    /** Everything below here is for drawing, event handling, and ui purposes */
  }, {
    key: "select",
    value: function select() {
      this.isSelected = !this.isSelected;
      console.log("Clicked: Layer Index " + this.layer.index + ", Neuron Index:" + this.index + ", Selected" + this.isSelected);
      if (this.isSelected) {
        // Do something.
      }
      return this.isSelected ? this : null;
    }
  }, {
    key: "isAt",
    value: function isAt(x, y) {
      var p = this.agent.position;
      return dist(x, y, p.x, p.y) < this.agent.size;
    }

    /** Fires any time the agent updates position */
  }, {
    key: "onAgentMove",
    value: function onAgentMove() {
      //
    }

    /**
     * Optionally updates the position of the neuron, if that's your jam.
     * Set this.movePosition in your constructor to override it.
     */
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      this.movePosition();
    }

    /**
     * Draws the neuron
     * @param {object} parentPos - Index of the drawn neuron - For drawing purposes only
     */
  }, {
    key: "draw",
    value: function draw(parentPos) {
      var pos = !!parentPos ? this.vectorHandler.add(this.agent.position, parentPos) : this.agent.position;
      this.drawer.draw(pos, this);
    }
  }], [{
    key: "randomWeight",
    value: function randomWeight() {
      var miniMaxValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      miniMaxValue = typeof miniMaxValue !== "number" || miniMaxValue === 0 ? Neuron.maxWeightValue : miniMaxValue;
      var low = -Math.abs(miniMaxValue);
      var high = Math.abs(miniMaxValue);
      return Math.random() * (high - low) + low;
    }
  }]);
  return Neuron;
}();
_defineProperty(Neuron, "maxWeightValue", 24);
_defineProperty(Neuron, "defaultBackgroundColor", "black");
_defineProperty(Neuron, "defaultDrawer", {
  draw: function draw(position, sender) {
    throw new Error("Neuron: No drawer specified.");
  }
});
_defineProperty(Neuron, "moveNeuronPosition", function (neuron) {
  if (!neuron.targetPos) return false;
  var app = _appVisualNeuro["default"].instance;
  if (!app) return false;
  if (typeof app.lastMouseX !== "number" || typeof app.lastMouseY !== "number") return;
  var pos = neuron.agent.position;
  var diff = Neuron.vectorHandler.sub(neuron.targetPos, pos);
  var dist = Neuron.vectorHandler.mag(diff);
  if (dist <= neuron.speed) {
    neuron.agent.position = Neuron.vectorHandler.setValues(neuron.agent.position, neuron.targetPos);
    neuron.targetPos = null;
    return;
  }
  Neuron.vectorHandler.normalize(diff), _readOnlyError("diff");
  Neuron.vectorHandler.mult(diff, neuron.speed, true);
  Neuron.vectorHandler.add(neuron.agent.position, diff, true);
});
_defineProperty(Neuron, "defaultColor", "#FFFFFF88");
if (typeof module === 'undefined') {
  console.log("Can't export. Running Neuron in-browser");
} else {
  module.exports = Neuron;
}