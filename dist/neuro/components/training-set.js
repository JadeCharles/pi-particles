"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * XOR training object - Currently not used. I need to build this out more
 */
var TrainingSet = /*#__PURE__*/function () {
  function TrainingSet(inputList, expectedOutputList) {
    var learningRate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.03;
    var momentum = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.1;
    _classCallCheck(this, TrainingSet);
    this.expectedOutputList = expectedOutputList || TrainingSet.xorExpectedOutputs;
    this.inputList = inputList || TrainingSet.xorInputs;
    this.learningRate = learningRate || 0.03;
    this.momentum = momentum || 0.1;
    this.errors = Array.from({
      length: this.inputList.length
    }, function () {
      return null;
    });
    this.notes = Array.from({
      length: this.inputList.length
    }, function () {
      return null;
    });
    this.networkError = 0;
    this.epocs = 0;
    this.error = 0;
  }
  _createClass(TrainingSet, [{
    key: "test",
    value: function test(network, inputs, expectedOutputs) {
      var outputs = network.run(inputs, false);
      var errors = outputs.map(function (v, i) {
        return Math.abs(v - expectedOutputs[i]);
      });
      this.testResults = {
        inputs: inputs.map(function (ip) {
          return ip.toFixed(1);
        }).join(", "),
        outputs: outputs.length === 1 ? parseFloat(outputs[0].toFixed(4)) : outputs,
        errors: errors.length === 1 ? parseFloat(errors[0].toFixed(4)) : errors
      };
      return this.testResults;
    }
  }]);
  return TrainingSet;
}();
_defineProperty(TrainingSet, "xor", {
  inputs: [[1, 0], [0, 1], [0, 0], [1, 1]],
  expectedOutputs: [[1], [1], [0], [0]]
});