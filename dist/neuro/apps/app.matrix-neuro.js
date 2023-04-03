"use strict";

var _activationFunction = _interopRequireDefault(require("../components/activation-function.js"));
var _neuronMatrix = _interopRequireDefault(require("../components/neuron-matrix.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
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
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @fileoverview MatrixNeuroApp
 * @version 1.0.0
 * @description
 * Fairly lightweight feed forward neural network using matrices
 * Implementation using matrices (the most common and efficient way it's done) to make training faster and more understandable from a math perspective.
 * The trained weights can be exported to a JSON file and/or used in app.neuro.js for visuals.
 * This can be used for classification or regression problems.
 * Most of the error checking in the training can (should?) probably be removed for performance reasons,
 * but we care more about the educational component of this project than the performance
 * 
 * @requires activation-function.js
 * @requires neuron-matrix.js
 * @note: If you're using pure JavaScript, the NeuroMatrix (neuron-matrix.js) file and the ActivationFunction file (activation-functions.js) in that order, should be included before this file
 */
var MatrixNeuroApp = /*#__PURE__*/function () {
  function MatrixNeuroApp() {
    var _args;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _classCallCheck(this, MatrixNeuroApp);
    if (((_args = args) === null || _args === void 0 ? void 0 : _args.length) === 1 && Array.isArray(args[0])) args = args[0];
    if (!args || args.length < 3) throw new Error("MatrixNeuroApp constructor requires at least 3 arguments (" + args.length + ")");
    this.neuronCounts = [];

    // Loop through all args and create layers with respective number of neurons
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (typeof arg !== "number") throw new Error("MatrixNeuroApp constructor arguments must be numbers. They reporesent the number of neurons per layer (excluding bias)");
      this.neuronCounts.push(arg);
    }
    this.squashFunction = new _activationFunction["default"](_activationFunction["default"].sigmoid, _activationFunction["default"].sigmoidPrime, "Sigmoid");

    // Try different ones, based on the problem. 0.075 feels like a decent default
    this.learningRate = MatrixNeuroApp.defaultLearningRate;
    this.biases = [];
    this.messages = []; // Keep some logs
    this.weightMatrices = [];
    this.activationValues = [];
    this.layerCount = this.neuronCounts.length;

    // Attach biases to all layers except input layer
    for (var _i = 1; _i < this.layerCount; _i++) {
      var rowCount = this.neuronCounts[_i];
      var columnCount = this.neuronCounts[_i - 1];
      this.weightMatrices.push(new _neuronMatrix["default"](rowCount, columnCount).randomizeWeights());
      this.biases.push(new _neuronMatrix["default"](this.neuronCounts[_i], 1).randomizeWeights());
    }
  }
  _createClass(MatrixNeuroApp, [{
    key: "toJson",
    value: function toJson() {
      return {
        learningRate: this.learningRate,
        squashFunction: this.squashFunction.name,
        neuronCounts: this.neuronCounts,
        biases: this.biases.map(function (bias) {
          return bias.toList();
        }),
        weights: this.weightMatrices.map(function (weightMatrix) {
          return weightMatrix.toList();
        })
      };
    }
  }, {
    key: "test",
    value: function test(inputValues) {
      var print = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      return this.execute(inputValues, print).outputs.toList();
    }

    /**
     * Executes the network with the given input values
     * @param {[number]} - The input values
     * @returns {object} - The inputs (echoed), activations, and outputs (results)
     */
  }, {
    key: "execute",
    value: function execute(inputValues) {
      var print = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var inputs = _neuronMatrix["default"].fromList(inputValues);
      var iterator = inputs;
      var layerIndex;
      var activationValues = [];
      if (print === true) {
        console.log("Inputs: ");
        console.table(inputValues);
      }
      for (layerIndex = 0; layerIndex < this.layerCount - 2; layerIndex++) {
        var layerBias = this.biases[layerIndex];
        var weights = this.weightMatrices[layerIndex];
        var hiddenActivations = _neuronMatrix["default"].mult(weights, iterator.copy());
        hiddenActivations.add(layerBias); // Sum up
        hiddenActivations.setMatrixValues(this.squashFunction.squash); // Activate

        activationValues.push(hiddenActivations);
        iterator = hiddenActivations;
      }
      var output = _neuronMatrix["default"].mult(this.weightMatrices[layerIndex], iterator.copy());
      output.add(this.biases[layerIndex]); // Sum up
      output.setMatrixValues(this.squashFunction.squash); // Activate

      activationValues.push(output);
      this.activationValues = activationValues;
      if (print) {
        console.log("Outputs:");
        console.table(output.items);
      }
      return {
        inputs: inputs,
        outputs: output,
        activations: iterator
      };
    }

    /*** Training and testing */

    /**
     * Sets the learning rate of the network. I.e., the "steps" it takes during back propagation
     * @param {number} learningRate - The learning rate of the network. Defaults to 0.1
     * @returns {MatrixNeuroApp} - So we can chain methods together
     */
  }, {
    key: "setLearningRate",
    value: function setLearningRate() {
      var learningRate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.1;
      this.learningRate = learningRate;
      return this;
    }

    /**
     * Takes the summed up weight x input + bias and squashes it between 0 and 1 (or some other small range)
     * @param {ActivationFunction} squashFunction - The squashing function to use. Defaults to sigmoid
     * @returns {MatrixNeuroApp} - So we can chain methods together
     */
  }, {
    key: "setActivationFunction",
    value: function setActivationFunction() {
      var squashFunction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.squashFunction = squashFunction || this.squashFunction;
      return this;
    }

    /**
     * Trains a single round of the network. This method should be run a crap-load of times, with different inputs/outputs to train the network.
     * Basically the magic of machine learning.
     * @param {[number]} inputs - Input values of the training round
     * @param {[number]} expectedOutputs - Expected output values of the training round
     */
  }, {
    key: "train",
    value: function train(inputs, expectedOutputs) {
      // Step 1. Feed Forward

      // Generating the output's output
      var result = this.execute(inputs);
      var outputs = result.outputs;

      // Convert list of numbers to Matrix
      var targets = _neuronMatrix["default"].fromList(expectedOutputs);

      // 1. Calc errors
      // 2. Calc gradients
      // 3. Calc deltas
      // 4. Update weights

      // Basic cost function: (target - output)
      // We usually use the mean squared error function, which is the average of the squared errors, but we can use this for now
      var errors = _neuronMatrix["default"].sub(targets, outputs);

      // Calculate gradient
      var gradients = _neuronMatrix["default"].setMatrixValues(outputs, this.squashFunction.getPartialDerivative);
      gradients.mult(errors);
      gradients.mult(this.learningRate);

      // We handle the last layer separately
      var activations = this.activationValues[this.activationValues.length - 2]; // 2nd to last layer of neurons. We use this as a cursor/hold-over
      var weightsIndex = this.weightMatrices.length - 1;
      while (weightsIndex > 0) {
        // Calculate deltas and adjust accordingly
        var weights = this.weightMatrices[weightsIndex];
        var weightDeltas = _neuronMatrix["default"].mult(gradients, _neuronMatrix["default"].transpose(activations));
        var weightErrors = _neuronMatrix["default"].mult(_neuronMatrix["default"].transpose(weights), errors);
        weights.add(weightDeltas); // Update weights - Glorious.

        // Adjust the bias by its deltas (which is just the gradients because bias is always 1.0 [for now])
        this.biases[weightsIndex].add(gradients);

        // Calculate next (backward) gradient and rinse/repeat
        gradients = _neuronMatrix["default"].setMatrixValues(activations, this.squashFunction.getPartialDerivative);
        gradients.mult(weightErrors);
        gradients.mult(this.learningRate);
        errors = weightErrors; // Cursor (value is used in the next loop)
        weightsIndex--;
        activations = this.activationValues[weightsIndex - 1]; // Cursor.
      }

      // Final updates
      var lastDeltas = _neuronMatrix["default"].mult(gradients, _neuronMatrix["default"].transpose(result.inputs));
      this.weightMatrices[0].add(lastDeltas);
      this.biases[0].add(gradients);
    }
  }], [{
    key: "fromJson",
    value: function fromJson(json) {
      if (typeof json === "string") json = JSON.parse(json);
      if (_typeof(json) !== "object") throw new Error("Invalid json of type '" + _typeof(json).toString() + "' passed to MatrixNeuroApp.fromJson");
      var learningRate = json.learningRate;
      var squashFunction = _activationFunction["default"].fromName(json.squashFunction);
      var neuronCounts = json.neuronCounts;
      var biases = json.biases.map(function (bias) {
        return _neuronMatrix["default"].fromList(bias);
      });
      var weights = json.weights.map(function (weight) {
        return _neuronMatrix["default"].fromList(weight);
      });
      var app = _construct(MatrixNeuroApp, _toConsumableArray(neuronCounts));
      app.learningRate = learningRate;
      app.squashFunction = squashFunction;
      app.biases = biases;
      app.weightMatrices = weights;
      return app;
    }
  }]);
  return MatrixNeuroApp;
}();
_defineProperty(MatrixNeuroApp, "defaultLearningRate", 0.075);
if (typeof module === 'undefined') {
  console.log("Can't export. Running MatrixNeuroApp in-browser");
} else {
  module.exports = MatrixNeuroApp;
}