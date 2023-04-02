"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Utility/Helper class to draw stuff with the p5.js library
 */
var P5Ui = /*#__PURE__*/function () {
  function P5Ui() {
    _classCallCheck(this, P5Ui);
  }
  _createClass(P5Ui, null, [{
    key: "drawCircleAt",
    value: function drawCircleAt(pos) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;
      var thickness = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      if (!(pos !== null && pos !== void 0 && pos.x) || !(pos !== null && pos !== void 0 && pos.y)) return;
      stroke(color || "#CCCCCC");
      strokeWeight(thickness);
      noFill();
      ellipse(pos.x, pos.y, size, size);
    }
  }]);
  return P5Ui;
}();