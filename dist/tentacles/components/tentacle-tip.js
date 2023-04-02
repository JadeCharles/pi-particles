"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var NINETY_DEGREES = Math.PI / 2;
var DEGREE_RATIO = 57.2958;
var TentacleSegmentEndpoint = /*#__PURE__*/function () {
  function TentacleSegmentEndpoint() {
    var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, TentacleSegmentEndpoint);
    if (!options) options = {};
    if (!position || !(position instanceof p5.Vector)) throw new Error("TentacleSegmentEndpoint must be created with a position (p5.Vector) as its first parameter");
    this.position = position;
    this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + new Date().getTime().toString();
    this.mass = typeof options.mass === "number" ? options.mass : 0.5;
    this.angle = typeof options.angle === "number" ? options.angle : 0;
    this.label = options.label || "";
    this.forces = createVector(0, 0); // Not used for now
  }
  _createClass(TentacleSegmentEndpoint, [{
    key: "getDescription",
    value: function getDescription() {
      var showLabelIfNotEmpty = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var newLine = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "\n";
      if (showLabelIfNotEmpty && !!this.label && this.length > 0) return this.label;
      return "Pos (".concat(this.position.x.toFixed(2), ", ").concat(this.position.y.toFixed(2), ")\nAngle: ").concat((this.angle * DEGREE_RATIO).toFixed(1), "\nMass: ").concat(this.mass.toFixed(2));
    }

    /**
        * Calculates the force vector to apply to this segment (ie, how much space to move/rotate this segment)
        * @param {p5.Vector} forceVector - The force vector to apply to this segment
        * @param {boolean} useBase - Calculate based on the base position and angle (true), or the tip position and angle (false)
        * @returns {p5.Vector} - The force vector to apply to this segment
        */
  }, {
    key: "addForce",
    value: function addForce(forceVector) {
      var angle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      // Invert the angles
      if (typeof angle !== "number") angle = this.angle;
      var force = forceVector.copy();
      force.rotate(angle);
      force.mult(this.mass);
      var my = Math.abs(angle) > HALF_PI ? -1 : 1;
      var fmag = force.mag();
      force.x *= (forceVector.x - force.y) / -fmag;
      force.y *= my * (forceVector.y - force.x) / fmag;
      this.forces.add(force);
      return force;
    }
  }, {
    key: "updatePositions",
    value: function updatePositions() {
      this.position.add(this.forces);
      this.forces.set(0, 0);
      return this.position;
    }
  }]);
  return TentacleSegmentEndpoint;
}();