"use strict";

function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
/**
 * Defines the structure of a person object.
 * @typedef {object} Position
 * @property {number} x
 * @property {number} y
 */
var ParticleColor = /*#__PURE__*/_createClass(function ParticleColor(name, color, range, material) {
  _classCallCheck(this, ParticleColor);
  if (_typeof(name) === "object") {
    if (typeof color !== "string") color = name.color || "#FFFFFF";
    if (typeof range !== "number") range = name.range || ParticleConfig.defaultRange;
    if (_typeof(material) !== "object") material = name.material || null;
    name = name.name || "Unknown";
  }
  this.name = name;
  this.color = color;
  this.range = range;
  this.material = material;
});
/**
 * 
 */
var ParticleConfig = /*#__PURE__*/function () {
  function ParticleConfig() {
    _classCallCheck(this, ParticleConfig);
  }
  _createClass(ParticleConfig, null, [{
    key: "dispose",
    value: function dispose() {
      ParticleConfig.colors.forEach(function (c) {
        var _c$material;
        return typeof ((_c$material = c.material) === null || _c$material === void 0 ? void 0 : _c$material.dispose) === "function" && c.material.dispose();
      });
    }
  }, {
    key: "isValidMatrix",
    value: function isValidMatrix(matrix) {
      var maxVal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
      var minVal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1.0;
      var isMatrix = Array.isArray(matrix);
      if (!isMatrix) return false;
      var isLength = matrix.length === 8;
      if (!isLength) console.error("Matrix is not 8x8 (" + (matrix === null || matrix === void 0 ? void 0 : matrix.length) + ")");
      return isMatrix && isLength && matrix.every(function (row, rowIndex) {
        var isRowArray = Array.isArray(row);
        if (!isRowArray) {
          console.error("Row " + rowIndex + " is not an array.");
          return false;
        }
        return row.length === 8 && row.every(function (val, colIndex) {
          var isNumber = typeof val === "number";
          if (!isNumber) console.error("Value in row:" + rowIndex + ", col:" + colIndex + " is not a number (" + _typeof(val).toString() + "): " + val);
          var isInRange = val >= minVal && val <= maxVal;
          if (!isInRange) console.error("Value in row:" + rowIndex + ", col:" + colIndex + " is not in range (" + minVal + " to " + maxVal + "): " + val);
          return isNumber && isInRange;
        });
      });
    }

    /**
     * Creates an attraction matrix that has only 1 and -1 values, nothing in between
     * @param {numbner} maxForce - The default force value
     * @param {number} maxSelfForce - The self force value
     * @returns 
     */
  }, {
    key: "createPositiveOrNegativeAttractionMatrix",
    value: function createPositiveOrNegativeAttractionMatrix() {
      var maxForce = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;
      var maxSelfForce = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
      var matrix = [];
      var size = ParticleConfig.colors.length;
      for (var i = 0; i < size; i++) {
        var cols = [];
        for (var j = 0; j < size; j++) {
          var m = Math.random() > 0.5 ? 1 : -1;
          var val = (i === j ? maxSelfForce : maxForce) * m;
          cols.push(val || m);
        }
        matrix.push(cols);
      }
      return matrix;
    }

    /**
     * Creates a [colorCount x colorCount] matrix with the same value in each cell. This results in a "gravitational" effect where all particles are attracted to each other.
     * @param {number} value - The default force value for all color pairs
     * @returns {[number[number]] - The attraction matrix
     */
  }, {
    key: "createUniformAttractionMatrix",
    value: function createUniformAttractionMatrix() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;
      var matrix = [];
      var size = ParticleConfig.colors.length;
      console.warn("Uniforming: " + size);
      for (var i = 0; i < size; i++) {
        var cols = [];
        for (var j = 0; j < size; j++) {
          cols.push(value);
        }
        matrix.push(cols);
      }
      return matrix;
    }

    /**
     * Creates a [colorCount x colorCount] matrix with the same value in each cell. This results in a "gravitational" effect where all particles are attracted to each other.
     * @param {number} value - The default force value for all color pairs
     * @returns {[number[number]] - The attraction matrix
     */
  }, {
    key: "createZeroAttractionMatrix",
    value: function createZeroAttractionMatrix() {
      var matrix = [];
      var size = ParticleConfig.colors.length;
      console.warn("Zero-ing: " + size);
      for (var i = 0; i < size; i++) {
        var cols = [];
        for (var j = 0; j < size; j++) {
          cols.push(0);
        }
        matrix.push(cols);
      }
      return matrix;
    }
  }, {
    key: "createRandomAttractionMatrix",
    value: function createRandomAttractionMatrix() {
      var maxForce = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;
      var maxSelfForce = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var minValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.25;
      var matrix = [];
      var size = ParticleConfig.colors.length;
      //maxForce /= 2;

      for (var i = 0; i < size; i++) {
        var cols = [];
        for (var j = 0; j < size; j++) {
          var m = Math.random() > 0.5 ? 1 : -1;
          var val = i === j && typeof maxSelfForce === "number" ? maxSelfForce : Math.random() * (maxForce - minValue) + minValue;
          cols.push(val * m || m);
        }
        matrix.push(cols);
      }
      return matrix;
    }
  }, {
    key: "invertAttractionMatrix",
    value: function invertAttractionMatrix(matrix) {
      return matrix.map(function (row) {
        return row.map(function (val) {
          return val * -1;
        });
      });
    }
  }]);
  return ParticleConfig;
}();
/**
 * The shortest distance between two masses. Used when we are calculating the force of gravity. 
 * If this goes to zero, the particles will do some black-hole type shit. Basically explode.
 */
_defineProperty(ParticleConfig, "planckLength", 0.0000001);
_defineProperty(ParticleConfig, "gravityAcceleration", 9.8);
/**
 * Percent value. This will slow the particles down by 3% per second, so they don't fly all over the place. 
 * Set this to zero to see some funky stuff.
 */
_defineProperty(ParticleConfig, "friction", 0.0075);
// 0.03;
_defineProperty(ParticleConfig, "lubrication", function () {
  return 1 - ParticleConfig.friction;
});
/**
 * If a particle is within this distance of another particle, it will multiply its repulsive force by this value.
 */
_defineProperty(ParticleConfig, "personalSpaceMultiplier", 4.0);
/**
 * Default size of the particles.
 */
_defineProperty(ParticleConfig, "defaultDiameter", 4.0);
/**
 * The color of the range indicator. If ranges are visible, they are drawn with this color.
 */
_defineProperty(ParticleConfig, "bubbleColor", "#FFFFFF55");
_defineProperty(ParticleConfig, "defaultRange", 500);
_defineProperty(ParticleConfig, "colors", [new ParticleColor({
  name: "Yellow",
  color: "#ffCC00",
  range: ParticleConfig.defaultRange,
  material: null
}), new ParticleColor({
  name: "Green",
  color: "#00AA00",
  range: ParticleConfig.defaultRange,
  material: null
}), new ParticleColor({
  name: "Blue",
  color: "#0000FF",
  range: ParticleConfig.defaultRange,
  material: null
}), new ParticleColor({
  name: "Red",
  color: "#990000",
  range: ParticleConfig.defaultRange,
  material: null
}), new ParticleColor({
  name: "Grey",
  color: "#888888",
  range: ParticleConfig.defaultRange,
  material: null
}), new ParticleColor({
  name: "Pink",
  color: "#aa00aa",
  range: ParticleConfig.defaultRange,
  material: null
}), new ParticleColor({
  name: "Cyan",
  color: "#00aaaa",
  range: ParticleConfig.defaultRange,
  material: null
}), new ParticleColor({
  name: "White",
  color: "#ffffff",
  range: ParticleConfig.defaultRange,
  material: null
})]);
_defineProperty(ParticleConfig, "emptyForce", {
  force: 0,
  forceX: 0,
  forceY: 0,
  velocityX: 0,
  velocityY: 0,
  attractionValue: 0,
  fuse: false
});