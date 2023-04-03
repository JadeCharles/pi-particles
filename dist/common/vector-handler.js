"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var VectorHandler = /*#__PURE__*/function () {
  function VectorHandler(lib) {
    _classCallCheck(this, VectorHandler);
    if (!lib) lib = {};
  }
  _createClass(VectorHandler, [{
    key: "createVector",
    value: function createVector(x, y) {
      return {
        x: x,
        y: y,
        z: 0
      };
    }
  }, {
    key: "setValues",
    value: function setValues(vec1, vec2) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var x = (vec2 === null || vec2 === void 0 ? void 0 : vec2.x) || vec2;
      var y = (vec2 === null || vec2 === void 0 ? void 0 : vec2.y) || options;
      if (typeof x !== "number" || typeof y !== "number") throw new Error("VectorHandler.setValues() called with invalid arguments. Must be a vector or two numbers");
      vec1.x = x;
      vec1.y = y;
      return vec1;
    }
  }, {
    key: "mult",
    value: function mult(vec1, vec2) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      VectorHandler.ensureVector(vec1, "vec1.mult()");
      VectorHandler.ensureVector(vec2, "vec2.mult()");

      // Multiply two vectors
      var x = vec1.x * vec2.x;
      var y = vec1.y * vec2.y;
      if (options !== true) return this.createVector(x, y);
      vec1.x = x;
      vec1.y = y;
      return vec1;
    }
  }, {
    key: "add",
    value: function add(vec1, vec2) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      VectorHandler.ensureVector(vec1, "vec1.add()");
      VectorHandler.ensureVector(vec2, "vec2.add()");
      var x = vec1.x + vec2.x;
      var y = vec1.y + vec2.y;
      if (options !== true) return this.createVector(x, y);
      vec1.x = x;
      vec1.y = y;
      return vec1;
    }
  }, {
    key: "sub",
    value: function sub(vec1, vec2) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      VectorHandler.ensureVector(vec1, "vec1.sub()");
      VectorHandler.ensureVector(vec2, "vec2.sub()");
      var x = vec1.x - vec2.x;
      var y = vec1.y - vec2.y;
      if (options !== true) return this.createVector(x, y);
      vec1.x = x;
      vec1.y = y;
      return vec1;
    }
  }, {
    key: "getAngle",
    value: function getAngle(vec) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      VectorHandler.ensureVector(vec, "vec.getAngle()");
      return Math.atan2(vec.y, vec.x);
    }
  }, {
    key: "getMagnetude",
    value: function getMagnetude(vec) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      VectorHandler.ensureVector(vec, "vec.getMagnetude()");
      return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    }
  }], [{
    key: "createP5Handler",
    value: function createP5Handler() {
      if (typeof p5 === "undefined") throw new Error("Can't create p5 VectorHandler: p5 is not defined. Make sure the p5.js library is included in your project. Alternatively, you can create your own VectorHandler by extending the VectorHandler and including the matrix operations function");
      var handler = new VectorHandler();
      handler.createVector = function (x, y) {
        return createVector(x, y);
      };
      handler.setValues = function (vec1, vec2) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        if (typeof vec2 === "number" && typeof options === "number") return vec1.set(vec2, options);
        return vec1.set(vec2);
      };
      handler.mult = function (vec1, vec2) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        return options === true ? vec1.mult(vec2) : p5.Vector.mult(vec1, vec2);
      };
      handler.add = function (vec1, vec2) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        return options === true ? vec1.add(vec2) : p5.Vector.add(vec1, vec2);
      };
      handler.sub = function (vec1, vec2) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        return options === true ? vec1.sub(vec2) : p5.Vector.sub(vec1, vec2);
      };
      handler.getAngle = function (vec) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var angle = vec.heading();
        return options === true ? angle * 180 / Math.PI : angle;
      };
      return handler;
    }
  }, {
    key: "createDefaultHandler",
    value: function createDefaultHandler() {
      return new VectorHandler();
    }
  }, {
    key: "ensureVector",
    value: function ensureVector(vec) {
      var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (typeof (vec === null || vec === void 0 ? void 0 : vec.x) === "number" && typeof (vec === null || vec === void 0 ? void 0 : vec.y) === "number") return;
      if (typeof symbol !== "string" || symbol.length === 0) symbol = "Vector operation";
      throw new Error(symbol + " called with invalid arguments. Must be a vector or two numbers");
    }
  }]);
  return VectorHandler;
}();
if (typeof module === "undefined") {
  console.log("Can't export. Running VectorHandler in-browser");
} else {
  module.exports = VectorHandler;
}