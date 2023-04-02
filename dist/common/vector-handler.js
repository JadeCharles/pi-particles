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
      return vec1;
    }
  }, {
    key: "mult",
    value: function mult(vec1, vec2) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return vec1;
    }
  }, {
    key: "add",
    value: function add(vec1, vec2) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return vec1;
    }
  }, {
    key: "sub",
    value: function sub(vec1, vec2) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return vec1;
    }
  }, {
    key: "getAngle",
    value: function getAngle(vec) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return vec;
    }
  }, {
    key: "getMagnetude",
    value: function getMagnetude(vec) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return vec;
    }
  }], [{
    key: "createP5Handler",
    value: function createP5Handler() {
      if (typeof p5 === "undefined") throw new Error("Can't create p5 VectorHandler: p5 is not defined. Make sure the p5.js library is included in your project");
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
  }]);
  return VectorHandler;
}();
if (typeof module === "undefined") {
  console.log("Can't export. Running VectorHandler in-browser");
} else {
  module.exports = VectorHandler;
}