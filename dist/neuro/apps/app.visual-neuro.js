"use strict";

var _activationFunction = _interopRequireDefault(require("../components/activation-function.js"));
var _app = _interopRequireDefault(require("../../common/app.js"));
var _appMatrixNeuro = _interopRequireDefault(require("./app.matrix-neuro.js"));
var _neuronLayer = _interopRequireDefault(require("../components/neuron-layer.js"));
var _neuron = _interopRequireDefault(require("../components/neuron.js"));
var _neuronRunner = _interopRequireDefault(require("../components/neuron-runner.js"));
var _neuronConnector = _interopRequireDefault(require("../components/neuron-connector.js"));
var _feedForward = _interopRequireDefault(require("../networks/feed-forward.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @fileoverview Neuro App
 * @version 1.0.0
 * @license MIT - Just give me some street cred
 * 
 * @description
 * This class is analogous to the Controller. It handles input (data and events) and passes data to
 * the underlying network (this.network) and view. It also handles the logic of the app.
 */
var NeuroApp = /*#__PURE__*/function (_App) {
  _inherits(NeuroApp, _App);
  var _super = _createSuper(NeuroApp);
  function NeuroApp(options) {
    var _options;
    var _this;
    _classCallCheck(this, NeuroApp);
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    _this = _super.call(this, options, args);
    if (!options) options = {
      name: "Unnamed"
    };
    _this.name = ((_options = options) === null || _options === void 0 ? void 0 : _options.name) || "Neuro App";
    var sig = new _activationFunction["default"](_activationFunction["default"].sigmoid, _activationFunction["default"].sigmoidPrime, "Sigmoid");
    ;
    _this.network = new _feedForward["default"](_assertThisInitialized(_this), {
      squashFunction: sig
    });
    _this.text = "Feed-Forward Neural Network";
    _this.isAuto = false;
    _this.isSetup = false;
    _this.selectedNeurons = [];
    _this.selectedKeys = {};
    _this.messages = [];
    _this.results = [];
    _this.vectorHandler = options.vectorHandler;
    if (typeof document === "undefined") return _possibleConstructorReturn(_this);
    if (!document.getElementById(_this.elementId)) {
      NeuroApp.retry++;
      if (NeuroApp.retry > 1) console.error("No canvas found with id: " + _this.elementId + ". Aborting setup.");
      return _possibleConstructorReturn(_this);
    }
    _this.updateCanvasSize();
    _this.getInputValues = function (sender) {
      console.warn("No input values provided because the getInputValues() method was not set. Returning empty array.");
      return [];
    };
    if (!!_this.addEventListeners()) console.log("Tentacle App mounted");else if (_this.addEventListeners > 1) console.warn("No canvas mounted");
    return _this;
  }
  _createClass(NeuroApp, [{
    key: "initWithLayerNeuronCounts",
    value: function initWithLayerNeuronCounts() {
      for (var _len2 = arguments.length, layerNeuronCounts = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        layerNeuronCounts[_key2] = arguments[_key2];
      }
      var nn = new _appMatrixNeuro["default"](layerNeuronCounts);
      this.network.initWithMatrixNetwork(nn, {
        vectorHandler: this.vectorHandler
      });
    }
  }, {
    key: "animateRunners",
    value: function animateRunners() {
      var _this2 = this;
      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
      var inputLayer = this.network.inputLayer;
      for (var i = 0; i < count; i++) {
        var index = Math.floor(Math.random() * inputLayer.neurons.length);
        var n = inputLayer.neurons[index];
        this.network.createRunner(n, null, 15);
      }
      setTimeout(function () {
        var newCount = Math.floor(Math.random() * 5) + 1;
        _this2.animateRunners(count);
      }, 750);
    }
  }, {
    key: "handleMouseMove",
    value: function handleMouseMove(e) {
      var _this3 = this;
      var x = e.offsetX;
      var y = e.offsetY;
      var n = this.getNeuronAt(x, y);
      if (!!n) {
        var count = Math.floor(Math.random() * 8) + 2;
        for (var i = 0; i < count; i++) {
          var timing = Math.floor(Math.random() * 1500);
          setTimeout(function () {
            _this3.network.createRunner(n, null, 15);
          }, timing);
        }
      }
    }
  }, {
    key: "addEventListeners",
    value: function addEventListeners() {
      var _this4 = this;
      var canvas = _get(_getPrototypeOf(NeuroApp.prototype), "addEventListeners", this).call(this, true);
      if (!canvas || !this.network) return;

      //canvas.onmousemove = (e) => this.handleMouseMove(e);

      // Handle Key Presses and other events
      document.addEventListener("keydown", function (e) {
        var k = e.key.toLowerCase();
        _this4.selectedKeys[k] = true;
        switch (k) {
          case "escape":
            _this4.clearSelectedNeurons();
            break;
          case "a":
          case "keya":
            _this4.network.execute(_this4.getInputValues(e));
            break;
          case "t":
          case "keyt":
            var epocCount = 10000;
            console.log("Training and testing XOR example x" + epocCount + "...");
            var trainedNetwork = NeuroApp.trainAndTestXor(new _appMatrixNeuro["default"](2, 8, 4, 1), epocCount, 3);
            _this4.network.initWithMatrixNetwork(trainedNetwork);
            if (typeof _this4.refreshInputFields === "function") _this4.refreshInputFields();else console.warn("No refreshInputFields() method found");
            _this4.text = "";
            break;
          case "r":
          case "keyr":
            _this4.randomizeWeights();
            _this4.network.execute(_this4.getInputValues(e));
            break;
        }
      });
      document.addEventListener("keyup", function (e) {
        var k = e.key.toLowerCase();
        delete _this4.selectedKeys[k]; // Keep track of keyup events for mult-select and other things
      });

      console.log("Added event listeners: " + (canvas !== null).toString());
      return canvas;
    }
  }, {
    key: "init",
    value: function init() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      if (this.needsEventListeners) {
        if (!this.addEventListeners()) {
          console.error("Failed to setup event listeners. Aborting setup.");
          return;
        }
      }
      var layers = [];
      if (!!args[0] && args[0] instanceof _appMatrixNeuro["default"]) {
        var nn = args[0];
        this.network.initWithMatrixNetwork(nn);
      }

      // If no layers were added, add default layers
      if (this.network.layers.length <= 1) {
        console.log("Setting up default layered network");
        layers = [new _neuronLayer["default"](this.network, {
          name: "Input Layer",
          neuronCount: 3,
          biasCount: 1
        }), new _neuronLayer["default"](this.network, {
          name: "Hidden Layer 1",
          neuronCount: 5,
          biasCount: 1
        }), new _neuronLayer["default"](this.network, {
          name: "Hidden Layer 2",
          neuronCount: 7,
          biasCount: 1
        }), new _neuronLayer["default"](this.network, {
          name: "Hidden Layer 3",
          neuronCount: 5,
          biasCount: 1
        }), new _neuronLayer["default"](this.network, {
          name: "Output Layer",
          neuronCount: 1
        })];
        this.network.appendLayers(layers);
        this.network.connect();
      }
      this.isSetup = true;

      // If the first arg is a function, use it as the getInputValues() method which is the mechanism for feeding input into the network
      if (args.length > 0 && typeof args[0] === "function") this.getInputValues = function (sender) {
        return args[0];
      };
      console.log("Neuro App setup: " + this.network.layerCount + " layers, " + this.network.neuronCount + " neurons");
    }

    /**
     * Gets all the neurons in the network and returns them in a single array
     */
  }, {
    key: "getAllNeurons",
    value: function getAllNeurons() {
      var neurons = [];
      this.network.layers.map(function (layer) {
        layer.neurons.map(function (n) {
          return neurons.push(n);
        });
      });
      return neurons;
    }
  }, {
    key: "randomizeWeights",
    value: function randomizeWeights() {
      this.network.randomizeWeights();
    }
  }, {
    key: "layerCount",
    value: function layerCount() {
      return this.network.layerCount;
    }
  }, {
    key: "getNeuronAt",
    value: function getNeuronAt(x, y) {
      var i = 0;
      var network = this.network;
      if (!network) return;
      var layerCount = network.layerCount;
      while (i < layerCount) {
        var neuron = network.layers[i].neurons.find(function (n) {
          return n.isAt(x, y);
        });
        if (neuron) return neuron;
        i++;
      }
    }
  }, {
    key: "clearSelectedNeurons",
    value: function clearSelectedNeurons() {
      this.selectedNeurons = [];
      this.network.layers.map(function (layer) {
        layer.neurons.map(function (n) {
          return n.isSelected = false;
        });
      });
    }
  }, {
    key: "draw",
    value: function draw() {
      var network = this.network;
      if (!network) return;
      this.network.updatePositions();
      _get(_getPrototypeOf(NeuroApp.prototype), "refreshCanvas", this).call(this);
      this.network.draw();
    }
  }], [{
    key: "init",
    value: function init(NeuronDrawer) {
      if (!!NeuronDrawer) {
        if (typeof NeuronDrawer.drawNeuron !== "function") throw new Error("NeuronApp.init: NeuronDrawer.drawNeuron is not a function.");
        _neuron["default"].defaultDrawer.draw = NeuronDrawer.drawNeuron;
        if (typeof NeuronDrawer.drawNeuronConnector !== "function") console.warn("NeuronApp.init: NeuronDrawer.drawNeuronConnector is not a function. Neuron connectors will not be displayed.");else _neuronConnector["default"].defaultDrawer.draw = NeuronDrawer.drawNeuronConnector;
        if (typeof NeuronDrawer.drawNeuronRunner !== "function") console.warn("NeuronApp.init: NeuronDrawer.drawNeuronRunner is not a function. Neuron runners will not be displayed.");else _neuronRunner["default"].defaultDrawer.draw = NeuronDrawer.drawNeuronRunner;
      }
    }
  }, {
    key: "trainAndTestXor",
    value: function trainAndTestXor(matrixNet) {
      var epocs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
      var testCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var learningRate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
      // Setup
      var training_data = [{
        inputs: [0, 0],
        outputs: [0]
      }, {
        inputs: [0, 1],
        outputs: [1]
      }, {
        inputs: [1, 0],
        outputs: [1]
      }, {
        inputs: [1, 1],
        outputs: [0]
      }];
      matrixNet.setLearningRate(learningRate);
      for (var tc = 0; tc < testCount; tc++) {
        // Train
        for (var i = 0; i < epocs; i++) {
          var randomIndex = Math.floor(Math.random() * training_data.length);
          var data = training_data[randomIndex];
          matrixNet.train(data.inputs, data.outputs);
        }
      }
      return matrixNet;
    }
  }]);
  return NeuroApp;
}(_app["default"]);
_defineProperty(NeuroApp, "retry", 0);
if (typeof module !== "undefined") module.exports = NeuroApp;else console.log("NeuroApp not exported. Running in browser.");