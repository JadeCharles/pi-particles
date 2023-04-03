"use strict";

var _neuron = _interopRequireDefault(require("../components/neuron.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } // if (typeof require !== "undefined") { 
//     const Neuron = require("../components/neuron.js");
// }
/**
 * Logical representation of a neural network layer.
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
 */
var NeuronLayer = /*#__PURE__*/function () {
  function NeuronLayer(network, options) {
    _classCallCheck(this, NeuronLayer);
    if (!((network === null || network === void 0 ? void 0 : network.networkType) > 0)) throw new Error("Invalid network to create layer for: " + network);
    if (!options) options = {};
    this.network = network;
    this.index = network.layers.length;
    this.name = options.name || "";
    this.nerons = options.neurons;
    this.neuronSpace = 0;
    this.neuronMaxSize = 0;
    this.neuronMinSize = 9999999;
    this.biasCount = options.biasCount;
    if (!Array.isArray(this.neurons)) this.neurons = [];
    if (typeof this.biasCount !== "number" || this.biasCount < 0) {
      if (this.index === 0) this.biasCount = 0;else this.biasCount = 1;
    }
    if (options.neuronCount > 0) {
      var biasIndex = options.neuronCount - this.biasCount;
      for (var i = 0; i < options.neuronCount; i++) {
        var n = new _neuron["default"](this, {
          index: i,
          isBias: i >= biasIndex
        });
        this.neurons.push(n);

        // Stuff for UI and layout
        this.neuronSpace += n.size;
        if (n.size > this.neuronMaxSize) this.neuronMaxSize = n.size;
        if (n.size < this.neuronMinSize) this.neuronMinSize = n.size;
      }
    }
    this.neuronCount = this.neurons.length;
  }
  _createClass(NeuronLayer, [{
    key: "getNextLayer",
    value: function getNextLayer() {
      if (this.index >= this.network.layers.length - 1) return null;
      return this.network.layers[this.index + 1];
    }
  }, {
    key: "getPreviousLayer",
    value: function getPreviousLayer() {
      if (this.index <= 0) return null;
      return this.network.layers[this.index - 1];
    }
  }, {
    key: "getValues",
    value: function getValues() {
      return this.neurons.map(function (n) {
        return n.value;
      });
    }
  }, {
    key: "getErrors",
    value: function getErrors() {
      return this.neurons.map(function (n) {
        return n.error;
      });
    }

    /**
     * Connects the neurons in this layer to the neurons in the next layer
     */
  }, {
    key: "connect",
    value: function connect() {
      var initialWeightValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var nextLayer = this.getNextLayer();
      var prevLayer = this.getPreviousLayer();
      for (var i = 0; i < this.neurons.length; i++) {
        var n = this.neurons[i];
        n.connect(nextLayer, prevLayer, initialWeightValue);
      }
    }
  }, {
    key: "randomizeWeights",
    value: function randomizeWeights() {
      for (var i = 0; i < this.neuronCount; i++) this.neurons[i].randomizeWeights();
    }

    /**
     * Takes the input from the previous layer and passes it through the neurons in this layer
     */
  }, {
    key: "activate",
    value: function activate() {
      for (var i = 0; i < this.neuronCount; i++) {
        this.neurons[i].activate();
      }
    }
  }, {
    key: "reset",
    value: function reset(deltas) {
      for (var i = 0; i < this.neuronCount; i++) {
        var n = this.neurons[i];
        n.thresholdDelta = deltas;
        n.reset(deltas);
      }
    }

    /**
     * Everything below here is for UI
     */

    /**
     * Sets the positions of each neuron in the layer
     */
  }, {
    key: "setLayout",
    value: function setLayout() {
      var layerWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
      var layerHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
      var app = this.network.app;
      if (layerWidth <= 0) layerWidth = Math.floor(app.width / this.network.layers.length);
      var totalHeight = layerHeight > 0 ? layerHeight : app.height;
      var containerWidth = layerWidth; // Math.floor(app.width / this.network.layerCount);
      var containerHeight = Math.floor(totalHeight / this.neuronCount);
      for (var i = 0; i < this.neurons.length; i++) {
        var n = this.neurons[i];
        var x = this.index * containerWidth + containerWidth / 2.0;
        var y = i * containerHeight + containerHeight / 2.0;
        n.vectorHandler.setValues(n, x, y);
      }
      this.neuronCount = this.neurons.length;
    }

    /**
     * Everything below here is for visual updates
     */
  }, {
    key: "updatePositions",
    value: function updatePositions() {
      var i;
      var neuronCount = this.neurons.length;
      for (i = 0; i < neuronCount; i++) {
        this.neurons[i].updatePosition();
      }
    }

    /**
     * Draws the neurons in this layer
     */
  }, {
    key: "draw",
    value: function draw() {
      //console.log("Drawing Layer: " + this.name);
      var parentPos = this.network.position;
      for (var i = 0; i < this.neuronCount; i++) {
        this.neurons[i].draw(parentPos);
      }
    }
  }]);
  return NeuronLayer;
}();
if (typeof module === 'undefined') {
  console.log("Can't export. Running NeuronLayer in-browser");
} else {
  module.exports = NeuronLayer;
}