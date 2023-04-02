"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Convenient way to encapsulate activation functions and their derivatives.
 */
var ActivationFunction = /*#__PURE__*/function () {
  function ActivationFunction(squashingFunction, derivativeFunction) {
    var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "No Name";
    _classCallCheck(this, ActivationFunction);
    this.name = name;
    this.squash = squashingFunction;
    this.getPartialDerivative = derivativeFunction;
  }
  _createClass(ActivationFunction, null, [{
    key: "fromName",
    value: function fromName(name) {
      if (typeof name !== "string" || !name) throw new Error("Invalid name passed to ActivationFunction.fromName: " + name);
      switch (name) {
        case "Sigmoid":
          return ActivationFunction.sigmoidActivationFunction;
        case "ReLU":
          return ActivationFunction.reLUActivationFunction;
        case "HyperTan":
          return ActivationFunction.hyperTanActivationFunction;
        default:
          console.error("Unknown activation function name: " + name);
          return null;
      }
    }
  }, {
    key: "sigmoid",
    value: function sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }
  }, {
    key: "sigmoidPrime",
    value: function sigmoidPrime(y) {
      return y * (1 - y);
    }
  }, {
    key: "hyperTan",
    value: function hyperTan(x) {
      return Math.tanh(x);
    }
  }, {
    key: "hyperTanPrime",
    value: function hyperTanPrime(y) {
      return 1 - y * y;
    }
  }, {
    key: "rectifyLinear",
    value: function rectifyLinear(x) {
      return Math.max(0, x);
    }
  }, {
    key: "rectifyLinearPrime",
    value: function rectifyLinearPrime(y) {
      return y > 0 ? 1 : 0;
    }
  }]);
  return ActivationFunction;
}();
_defineProperty(ActivationFunction, "sigmoidActivationFunction", new ActivationFunction(ActivationFunction.sigmoid, ActivationFunction.sigmoidPrime, "Sigmoid"));
_defineProperty(ActivationFunction, "reLUActivationFunction", new ActivationFunction(ActivationFunction.rectifyLinear, ActivationFunction.rectifyLinearPrime, "ReLU"));
_defineProperty(ActivationFunction, "hyperTanActivationFunction", new ActivationFunction(ActivationFunction.hyperTan, ActivationFunction.hyperTanPrime, "HyperTan"));
if (typeof module === 'undefined') {
  console.log("Can't export. Running ActivationFunction in-browser");
} else {
  module.exports = ActivationFunction;
}