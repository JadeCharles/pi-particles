"use strict";

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
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ActivationFunction = require("../components/activation-function.js");
var NeuronRunner = require("../components/neuron-runner.js");
var MatrixNeuroApp = require("../apps/app.matrix-neuro.js");
var NeuronLayer = require("../components/neuron-layer.js");

/**
 * Logical and visual (Visualogical) representation of a standard FeedForward network.
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
 */
var FeedForwardNueralNetwork = /*#__PURE__*/function () {
  function FeedForwardNueralNetwork(app, options) {
    _classCallCheck(this, FeedForwardNueralNetwork);
    if (!app || typeof app.mounted !== "boolean") throw new Error("FeedForwardNueralNetwork must be created with an app (" + _typeof(app) + ")");
    if (!options) options = {};
    this.app = app;
    this.networkType = 1;
    this.layers = options.layers;
    if (!Array.isArray(this.layers)) this.layers = [];
    this.activationFunction = options.activationFunction;
    if (!(options.activationFunction instanceof ActivationFunction)) {
      this.activationFunction = ActivationFunction.sigmoidActivationFunction; // Sigmoid by default
    }

    this.matrixNetwork = null; // The matrix/math guts for training
    this.squash = this.activationFunction.squash;
    this.layerCount = this.layers.length;
    this.neuronCount = 0;
    this.inputLayer = null;
    this.outputLayer = null;

    // UI - Need to separate this
    this.position = null;
    this.runners = [];
  }
  _createClass(FeedForwardNueralNetwork, [{
    key: "initWithMatrixNetwork",
    value: function initWithMatrixNetwork(matrixNeuroApp) {
      if (this.layers.length > 0) {
        console.log("Skipping init of FeedForwardNueralNetwork because it already has layers");
        return;
      }
      if (!(matrixNeuroApp instanceof MatrixNeuroApp)) throw new Error("Cannot setup from matrix when matrix is not a MatrixNeuroApp");
      var i = 0;
      var layers = [];
      for (i = 0; i < matrixNeuroApp.neuronCounts.length - 1; i++) {
        var neuronCount = matrixNeuroApp.neuronCounts[i] + 1; // +1 for bias. The visual feed forward network holds biases as neurons in the feeding layer
        var name = i === 0 ? "Input Layer" : "Hidden Layer " + i;
        var options = {
          name: name,
          neuronCount: neuronCount,
          biasCount: 1
        };
        var hiddenLayer = new NeuronLayer(this, options);
        layers.push(hiddenLayer);
      }
      var outputsCount = matrixNeuroApp.neuronCounts[matrixNeuroApp.neuronCounts.length - 1];
      var outputLayer = new NeuronLayer(this, {
        name: "Output Layer",
        neuronCount: outputsCount,
        biasCount: 0
      });
      layers.push(outputLayer);
      this.appendLayers(layers);
      this.connect(0);
      for (var layerIndex = 1; layerIndex < this.layerCount; layerIndex++) {
        var prevIndex = layerIndex - 1;
        var currentLayer = this.layers[layerIndex];
        var weightMatrix = matrixNeuroApp.weightMatrices[prevIndex]; // row,col => hidden0, input

        // Loop through the next layer's neurons
        for (var n = 0; n < currentLayer.neuronCount; n++) {
          var neuron = currentLayer.neurons[n];
          if (neuron.backConnectors.length === 0) break; // Probably the bias neuron if it has no back connectors

          var matrixWeights = weightMatrix.items[n]; // <-- These should mirror the back connectors at this point

          // Loop through the current neuron's back connectors
          var ci = void 0;
          for (ci = 0; ci < neuron.backConnectors.length - 1; ci++) {
            var connector = neuron.backConnectors[ci];
            connector.weight = matrixWeights[ci];
          }

          // This back connector should be connecting to the bias neuron
          var biasWeights = matrixNeuroApp.biases[prevIndex].items[n];
          var biasWeight = biasWeights[0];
          neuron.backConnectors[ci].weight = biasWeight;
        }
      }
      this.runners = [];
      this.matrixNetwork = matrixNeuroApp;
    }
  }, {
    key: "createRunner",
    value: function createRunner(neuron) {
      var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
      var wayPoints = NeuronRunner.createRandomConnectorMap(neuron);
      console.warn("Waypoints: " + wayPoints.length);
      var options = {
        wayPoints: wayPoints,
        neuron: neuron,
        speed: speed,
        twoWay: true
      };
      var runner = new NeuronRunner(this, options);
      this.runners.push(runner);
      runner.run();
      console.log("Runner Created: " + runner.id);
      return runner;
    }
  }, {
    key: "removeRunner",
    value: function removeRunner(runner) {
      var index = this.runners.indexOf(runner);
      if (index < 0) return false;
      this.runners.splice(index, 1);
      return true;
    }
  }, {
    key: "setupFromOld",
    value: function setupFromOld(matrixNeuroApp) {
      if (this.layers.length > 0) throw new Error("Cannot setup from matrix when layers already exist");
      if (!(matrixNeuroApp instanceof MatrixNeuroApp)) throw new Error("Cannot setup from matrix when matrix is not a MatrixNeuroApp");
      var i = 0;
      var j = 0;
      var rowIndex, columnIndex;

      // Create the first layer (input layer)
      var layers = [new NeuronLayer(this, {
        name: "Input Layer",
        neuronCount: matrixNeuroApp.input_nodes + 1,
        biasCount: 1
      })];

      // Create the hidden layers
      for (i = 0; i < matrixNeuroApp.hidden_nodes.length; i++) {
        var hiddenLayerNeuronCount = matrixNeuroApp.hidden_nodes[i] + 1; // +1 for bias
        var hiddenLayer = new NeuronLayer(this, {
          name: "Hidden Layer " + i,
          neuronCount: hiddenLayerNeuronCount,
          biasCount: 1
        });
        layers.push(hiddenLayer);
      }

      // Create the output layers
      var outputLayer = new NeuronLayer(this, {
        name: "Output Layer",
        neuronCount: matrixNeuroApp.output_nodes
      });
      layers.push(outputLayer);

      // Add the layers and connect
      this.appendLayers(layers);
      this.connect(0);
      console.log("Connected with " + this.layers.length + " layers [" + _typeof(matrixNeuroApp.hidden_nodes[0]) + "]");

      // ** Set the weights for inputs => hidden0

      var firstHiddenLayerNeuronCount = matrixNeuroApp.hidden_nodes[0];
      for (rowIndex = 0; rowIndex < firstHiddenLayerNeuronCount; rowIndex++) {
        var hiddenNeuron = this.layers[1].neurons[rowIndex];
        for (columnIndex = 0; columnIndex < hiddenNeuron.backConnectors.length - 1; columnIndex++) {
          var inputToHidden0Row = matrixNeuroApp.weights_ih.items[rowIndex]; // row,col => hidden0, input
          var weight = inputToHidden0Row[columnIndex];
          if (typeof weight !== "number") throw new Error("Invalid weight: " + weight + " (" + _typeof(weight) + ")");
          hiddenNeuron.backConnectors[columnIndex].weight = weight;
        }
      }

      // Add the bias weight to the input => hidden0 layer
      var hidden0BiasMatrix = matrixNeuroApp.bias_h[0];
      var inputBiasNeuron = this.layers[0].neurons[this.layers[0].neurons.length - 1];
      for (i = 0; i < firstHiddenLayerNeuronCount; i++) {
        inputBiasNeuron.forwardConnectors[i].weight = hidden0BiasMatrix.items[i][0];
      }

      // ** Set weights for inner hidden layers.
      // ** Technically, there may not be any, but not sure how useful a 3-layer nn would be (input => one hidden => output) but I've seen stranger things ** /

      console.log("Converting inner hidden layer (" + matrixNeuroApp.weights_hh.length + ")");
      for (i = 1; i < matrixNeuroApp.hidden_nodes.length; i++) {
        var idx = i - 1;
        var hiddenNeuronCount = matrixNeuroApp.hidden_nodes[i];
        for (rowIndex = 0; rowIndex < hiddenNeuronCount; rowIndex++) {
          var _hiddenNeuron = this.layers[i + 1].neurons[rowIndex]; // row

          for (columnIndex = 0; columnIndex < _hiddenNeuron.backConnectors.length - 1; columnIndex++) {
            var prevToCurrentRow = matrixNeuroApp.weights_hh[idx].items[rowIndex]; // row,col => hidden0, input
            var _weight = prevToCurrentRow[columnIndex];
            if (typeof _weight !== "number") throw new Error("Invalid weight: " + _weight + " (" + _typeof(_weight) + ")");
            _hiddenNeuron.backConnectors[columnIndex].weight = _weight;
          }
        }

        // Add the biases weight to the hidden[n - 1] => hidden[n] layer
        var _hidden0BiasMatrix = matrixNeuroApp.bias_h[idx];
        var _biasNeuron = this.layers[i].neurons[this.layers[i].neurons.length - 1]; // Last neuron in the layer

        for (i = 0; i < hiddenNeuronCount; i++) {
          _biasNeuron.forwardConnectors[i].weight = _hidden0BiasMatrix.items[i][0];
        }
      }

      // ** Final hidden layer => output layer conversion ---------------------- ** /

      // Set the weights for hidden0 => output
      var lastHiddenLayer = this.layers[this.layers.length - 2];
      var nnLastHiddenLayerNeuronCount = matrixNeuroApp.hidden_nodes.length > 0 ? matrixNeuroApp.hidden_nodes[matrixNeuroApp.hidden_nodes.length - 1] : matrixNeuroApp.input_nodes;
      console.log("Converting hidden.last[" + nnLastHiddenLayerNeuronCount + "] => output layer");
      for (i = 0; i < matrixNeuroApp.output_nodes; i++) {
        var matrixRow = matrixNeuroApp.weights_ho.items[i];
        var outputNeuron = this.outputLayer.neurons[j];
        for (j = 0; j < nnLastHiddenLayerNeuronCount; j++) {
          var weightMatrix = matrixRow[j];
          outputNeuron.backConnectors[j].weight = weightMatrix;
        }
      }

      // Add the bias weight to the hidden0 => output layer
      var biasNeuron = lastHiddenLayer.neurons[lastHiddenLayer.neurons.length - 1];
      for (i = 0; i < this.outputLayer.neuronCount; i++) {
        for (var n = 0; n < matrixNeuroApp.output_nodes; n++) {
          var baisWeightMatrix = matrixNeuroApp.bias_o.items[i][n];
          biasNeuron.forwardConnectors[n].weight = baisWeightMatrix;
        }
      }
      this.matrixNetwork = matrixNeuroApp;
    }
  }, {
    key: "appendLayer",
    value: function appendLayer(layer) {
      if (!layer) throw new Error("Invalid layer to append");
      this.appendLayers([layer]);
      return layer;
    }
  }, {
    key: "appendLayers",
    value: function appendLayers(layers) {
      var _this$layers;
      if (!Array.isArray(layers)) throw new Error("Invalid layers to append. Try appendLayer(layer) for non-array layers");
      (_this$layers = this.layers).push.apply(_this$layers, _toConsumableArray(layers));
      this.refreshLayout();
      return layers;
    }
  }, {
    key: "insertLayer",
    value: function insertLayer(layer, atIndex) {
      if (!layer) throw new Error("Invalid layer to insert");
      return this.insertLayers([layer], atIndex);
    }
  }, {
    key: "insertLayers",
    value: function insertLayers(layers, atIndex) {
      var _this$layers2;
      if (atIndex < 0 || atIndex >= this.layerCount === 0) return this.appendLayers(layers);
      if (!Array.isArray(layers)) throw new Error("Invalid layers to insert. Try insertLayer(layer) for non-array layers");
      (_this$layers2 = this.layers).splice.apply(_this$layers2, [atIndex, 0].concat(_toConsumableArray(layers)));
      this.refreshLayout();
      return layers;
    }

    /**
     * Connects all of the layers with connectors
     */
  }, {
    key: "connect",
    value: function connect() {
      var initialWeightValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      for (var i = 0; i < this.layerCount; i++) this.layers[i].connect(initialWeightValue);
    }
  }, {
    key: "setWeightMatrix",
    value: function setWeightMatrix(matrix) {
      //
    }
  }, {
    key: "randomizeWeights",
    value: function randomizeWeights() {
      for (var i = 0; i < this.layerCount; i++) this.layers[i].randomizeWeights();
    }
  }, {
    key: "execute",
    value: function execute(inputs) {
      if (!Array.isArray(inputs)) throw new Error("Invalid inputs to submit");
      if (inputs.length !== this.inputLayer.neuronCount) {
        if (this.inputLayer.neuronCount - inputs.length === 1) inputs.push(1.0);else throw new Error("Invalid input count. Expected " + this.inputLayer.neuronCount + " but got " + inputs.length);
      }

      // Copy to input layer
      for (var i = 0; i < inputs.length; i++) {
        var n = this.inputLayer.neurons[i];
        n.value = inputs[i];
        n.rawValue = n.value;
      }
      for (var _i = 1; _i < this.layerCount; _i++) {
        this.layers[_i].activate();
      }
      return this.outputLayer.getValues();
    }
  }, {
    key: "executeMatrix",
    value: function executeMatrix(inputs) {
      if (!this.matrixNetwork) throw new Error("No neural network to execute");
      return this.matrixNetwork.test(inputs, true);
    }
  }, {
    key: "trainXor",
    value: function trainXor() {
      var epocs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      var maxErrorValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.05;
      return 0;
    }
  }, {
    key: "reset",
    value: function reset() {
      for (var i = 0; i < this.layerCount; i++) {
        this.layers[i].reset();
      }
    }
  }, {
    key: "refreshLayout",
    value: function refreshLayout() {
      this.layerCount = this.layers.length;
      this.inputLayer = this.layers[0];
      this.outputLayer = this.layers[this.layerCount - 1];
      var nc = 0;
      var i = 0;
      for (i = 0; i < this.layerCount; i++) {
        var layer = this.layers[i];
        layer.index = i;
        layer.setLayout();
        nc += layer.neurons.length;
      }
      this.neuronCount = nc;
    }
  }, {
    key: "updatePositions",
    value: function updatePositions() {
      // Update the positions of the layers
      var i;
      var layerCount = this.layerCount;
      for (i = 0; i < layerCount; i++) {
        this.layers[i].updatePositions();
      }
      for (i = 0; i < this.runners.length; i++) {
        var runner = this.runners[i];
        runner.updatePosition();
      }
      return layerCount;
    }
  }, {
    key: "draw",
    value: function draw() {
      var i = 0;
      for (i = 0; i < this.layers.length; i++) {
        // Draw the layer
        this.layers[i].draw();
      }
      for (i = 0; i < this.runners.length; i++) {
        var runner = this.runners[i];
        runner.draw();
      }
    }
  }]);
  return FeedForwardNueralNetwork;
}();
if (typeof module === 'undefined') {
  console.log("Can't export. Running FeedForwardNueralNetwork in-browser");
} else {
  module.exports = FeedForwardNueralNetwork;
}