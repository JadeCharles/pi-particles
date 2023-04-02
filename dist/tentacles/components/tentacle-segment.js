"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ANCHOR_TYPE_HEAD = 1;
var ANCHOR_TYPE_TAIL = 2;
var ANCHOR_TYPE_NONE = 0;
var DEFAULT_SEGMENT_LENGTH = 20;
var DEFAULT_SEGMENT_MAX_VELOCITY = 10;
var DEFAULT_SEGMENT_MASS = 1.0;
var G = 9.8 * 1;
var TentacleSegment = /*#__PURE__*/function () {
  /**
   * 
   * @param {Tentacle} tentacle - The tentacle that this segment is a part of
   * @param {TentacleSegment} prevSegment - The previous segment in the tentacle
   * @param {number} length - The length of this segment
   */
  function TentacleSegment(tentacle) {
    var prevSegment = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    _classCallCheck(this, TentacleSegment);
    // Check to see if the params were switched
    if (tentacle === null || !(tentacle instanceof Tentacle)) throw new Error("tentacle must be an instance of Tentacle: " + JSON.stringify(tentacle, null, 4));
    if (prevSegment !== null && !(prevSegment instanceof TentacleSegment)) throw new Error("prevSegment must be an instance of TentacleSegment: " + JSON.stringify(prevSegment, null, 4));
    if (options === null || _typeof(options) !== "object") options = {};

    // Identifiers
    this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + new Date().getTime().toString();
    this.anchorType = typeof options.anchorType === "number" ? options.anchorType : ANCHOR_TYPE_TAIL;

    // Visual Properties
    this.color = options.color || "yellow";

    // Physical Properties
    this.length = options.length;
    if (typeof this.length !== "number") this.length = DEFAULT_SEGMENT_LENGTH;
    this.angle = options.angle || options.localAngle || 0;
    if (typeof this.angle !== "number") this.angle = 0;
    this.localAngle = this.angle - ((prevSegment === null || prevSegment === void 0 ? void 0 : prevSegment.angle) || 0);
    this.angleVelocity = 0;
    this.angleAcceleration = 0;
    this.angleSpring = options.angleSpring;
    if (typeof this.angleSpring !== "number") this.angleSpring = 0.0;
    this.angleDamping = options.angleDamping;
    if (typeof this.angleDamping !== "number") this.angleDamping = 0.9;
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxVelocity = options.maxVelocity;
    this.mass = options.mass;
    this.forces = createVector(0, 0);
    if (typeof this.maxVelocity !== "number") this.maxVelocity = DEFAULT_SEGMENT_MAX_VELOCITY;
    if (typeof this.mass !== "number") this.mass = DEFAULT_SEGMENT_MASS;

    // Geometric Properties
    var basePos = !!prevSegment ? prevSegment.tip.position : tentacle.position;
    this.base = new TentacleSegmentEndpoint(basePos.copy());
    this.tip = new TentacleSegmentEndpoint(basePos.copy().add(createVector(this.length, 0)));

    // References
    this.tentacle = tentacle;
    this.prevSegment = prevSegment;
    this.nextSegment = null;
    this.totalLength = ((prevSegment === null || prevSegment === void 0 ? void 0 : prevSegment.totalLength) || 0) + this.length; // Length from the head of the entire tentacle to this end position

    if (!prevSegment) this.anchorType = ANCHOR_TYPE_HEAD; // Head/anchor base
    else {
      this.index = prevSegment.index + 1;
      if (!prevSegment.prevSegment) prevSegment.anchorType = ANCHOR_TYPE_HEAD;else prevSegment.anchorType = ANCHOR_TYPE_NONE;
    }
    if (typeof this.length !== "number") this.length = 20;
    if (this.length <= 0) this.length = 20;
    this.onTentacleGrabbed = function (tp, t) {
      return 1;
    };
    this.updateTipAngles(0, true);
  }
  _createClass(TentacleSegment, [{
    key: "calculateAngle",
    value: function calculateAngle() {
      var a = this.angle;
      return createVector(this.length * Math.cos(a), this.length * Math.sin(a));
    }
  }, {
    key: "resetState",
    value: function resetState() {
      this.clearForces();
    }

    /**
     * Calculates the angle of the segment from the base to the tip.
     * @returns {p5.Vector} - The vector from the base of this segment to the tip of this segment
     */
  }, {
    key: "calculateClamAngle",
    value: function calculateClamAngle() {
      var a = -this.angle;
      var len = -this.length;
      return createVector(len * Math.cos(a), len * Math.sin(a));
    }

    /**
     * Appends a segment to the end of this segment.
     * @param options {object} - Segment options
     */
  }, {
    key: "appendSegment",
    value: function appendSegment() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (!options) options = {};
      if (!!options.color) options.color = this.color;
      this.nextSegment = new TentacleSegment(this.tentacle, this, options);
      return this.nextSegment;
    }
  }, {
    key: "getLocalAngle",
    value: function getLocalAngle() {
      var _this$prevSegment;
      return this.angle - (((_this$prevSegment = this.prevSegment) === null || _this$prevSegment === void 0 ? void 0 : _this$prevSegment.angle) || 0);
    }
  }, {
    key: "clearForces",
    value: function clearForces() {
      this.tip.forces.set(0, 0);
      this.base.forces.set(0, 0);
    }
  }, {
    key: "updateAngleBy",
    value: function updateAngleBy(angleDelta) {
      var _this$nextSegment;
      if (typeof angleDelta !== "number") return;
      this.angle += angleDelta;
      (_this$nextSegment = this.nextSegment) === null || _this$nextSegment === void 0 ? void 0 : _this$nextSegment.updateAngleBy(angleDelta);
    }

    /**
     * Adds any forces to this segment, including gravity
     */
  }, {
    key: "updateForces",
    value: function updateForces() {
      var gravity = createVector(0, G / this.mass);
      if (this.prevSegment) this.base.addForce(gravity);
      if (this.nextSegment) {
        this.tip.addForce(gravity);
      }
    }

    /**
     * Do all calculations (update forces and angles) for this segment and its children. Update positions after this
     */
  }, {
    key: "updatePhysics",
    value: function updatePhysics(isAuto) {
      if (!isAuto) {
        this.forces = createVector(0, 0);
        return;
      }
      this.updateForces();
      if (!!this.nextSegment) this.nextSegment.updatePhysics(isAuto);
    }

    /**
     * Updates the angles of the two endpoints of this segment (base and tip) - this.angle MUST be set before calling this method.
     * @param {number} positionAnchor - 0 = Base: Position is updated relative to the base endpoint, 1 = Tip: Position is updated relative to the tip endpoint
     */
  }, {
    key: "updateTipAngles",
    value: function updateTipAngles() {
      var positionAnchor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var updatePositions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      this.base.angle = this.angle;
      this.tip.angle = this.angle - PI;
    }

    /**
     * This sets (recursively) the base of the current segment to the tip of the previous segment (Only position values are updated -- No angles or forces)
     * @param {number} parentAngleDiff - The difference in angle between this segment and its parent
     */
  }, {
    key: "updatePositions",
    value: function updatePositions() {
      var parentAngleDiff = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var isHeadMovable = this.anchorType !== ANCHOR_TYPE_TAIL;
      var isTipMovable = this.anchorType !== ANCHOR_TYPE_HEAD;
      this.base.updatePositions();
      this.tip.updatePositions();
      if (!!this.prevSegment) this.base.position.set(this.prevSegment.tip.position);
      this.angle = this.tip.position.sub(this.base.position).heading();
      var dir = this.calculateAngle(); //createVector(len * Math.cos(a), len * Math.sin(a));
      this.tip.position.set(this.base.position.copy().add(dir));
      this.updateTipAngles();
      if (!!this.nextSegment) this.nextSegment.updatePositions(parentAngleDiff);
    }

    /**
     * This sets (recursively, starting from tail going back down to head) the base of the current segment to the tip of the previous segment (Only position values are updated -- No angles or forces)
     * @param {number} parentAngleDiff - The difference in angle between this segment and its parent
     */
  }, {
    key: "updatePositionsBackward",
    value: function updatePositionsBackward() {
      var parentAngleDiff = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      if (!!this.nextSegment) {
        this.tip.position.set(this.nextSegment.base.position);
      }
      console.log("Updating Positions Backward with Angle: " + (this.angle * DEGREE_RATIO).toFixed(1));
      this.updateTipAngles(1, true);
      if (!!this.prevSegment) this.prevSegment.updatePositionsBackward(parentAngleDiff);
    }
  }, {
    key: "drawLabels",
    value: function drawLabels() {
      var distance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 170;
      var debugLevel = this.tentacle.agent.debugLevel || 0;
      var isSelected = this.tentacle.selectedSegment === this || debugLevel > 1;
      strokeWeight(1);
      if (debugLevel <= 0) {
        if (isSelected) TentacleSegment.UI.drawCircleAt(this.base.position, "red", 24, 1);
        return;
      }
      if (!isSelected) return;
      var tipPos = this.tip.position;
      var basePos = this.base.position;

      //const m = basePos.y < this.tentacle.agent.position.y ? -1 : 1;
      var m = basePos.y < tipPos.y ? -1 : 1;
      var baseLabelPos = basePos.copy().add(createVector(0, distance * m)); //.setHeading(a));
      var tipLabelPos = tipPos.copy().add(createVector(0, distance * -m)); //.setHeading(a + offset));

      var baseColor = "rgba(0, 255, 255, 1)";
      var baseDimColor = "rgba(0, 255, 255, 0.5)";
      var tipColor = "rgba(255, 0, 255, 1)";
      var tipDimColor = "rgba(255, 0, 255, 0.5)";
      noFill();
      stroke(baseDimColor);
      textAlign(LEFT, TOP);
      line(basePos.x, basePos.y, baseLabelPos.x, baseLabelPos.y);
      line(baseLabelPos.x + 1, baseLabelPos.y, baseLabelPos.x + 5, baseLabelPos.y);
      text(this.base.getDescription(), baseLabelPos.x, baseLabelPos.y);
      stroke(tipDimColor);
      line(tipPos.x, tipPos.y, tipLabelPos.x, tipLabelPos.y);
      line(tipLabelPos.x + 1, tipLabelPos.y, tipLabelPos.x + 5, tipLabelPos.y);
      text(this.tip.getDescription(), tipLabelPos.x, tipLabelPos.y);

      // ----- Big wheel circles

      //noStroke();

      // Draw white tip circle (large)
      //TentacleSegment.UI.drawCircleAt(tipPos, colorName, this.length);

      // Draw base circle (large)
      //TentacleSegment.UI.drawCircleAt(basePos, colorName, this.length);

      // White Horizontal Line in the base circle
      //stroke(colorName);
      //line(basePos.x, basePos.y, basePos.x + this.length/2, basePos.y)

      // White Horizontal Line in the tip circle
      //stroke(colorName);
      //line(tipPos.x, tipPos.y, tipPos.x + this.length/2, tipPos.y)

      // ------ End Big wheel circles

      if (this.tentacle.agent.debugLevel > 1) {
        // Note this: The following turns the tip into a knee, and the line drawn is the tibia
        stroke("rgba(255, 255, 255, 0.5)"); // Set color to cyan transluscent
        var tibiaPos = p5.Vector.sub(tipPos, this.calculateClamAngle()); // Get thet position for the tip of the "tibia"
        line(tipPos.x, tipPos.y, tibiaPos.x, tibiaPos.y); // Draw the line from the "knee" (this.tip) to the tip of the "tibia" (new tibiaPos)
      }

      TentacleSegment.UI.drawCircleAt(this.base.position, "#FF0000", 24, 1);
      TentacleSegment.UI.drawCircleAt(this.tip.position, this.color, 8, 2);
      strokeWeight(1);

      // const grav = createVector(0, G / this.mass);
      // const gravityForce = this.addForce(grav).mult(10);

      var gravityForce = p5.Vector.mult(this.forces, 10);
      var lineLen = this.length * 2;
      var arcLen = this.length / 2.0;
      textAlign(LEFT, CENTER);

      // Base End Horizontal Line and angle arc
      stroke(baseDimColor);
      line(basePos.x - lineLen, basePos.y, basePos.x + lineLen, basePos.y);
      text("BASE: " + this.id, basePos.x + lineLen + 10, basePos.y);
      var ae = this.getArcEndpoints(this.base.angle);
      arc(basePos.x, basePos.y, arcLen, arcLen, ae.start, ae.end, OPEN); // Base angle visual

      // Tip End Horizontal Line and angle arc
      stroke(tipDimColor);
      line(tipPos.x - lineLen, tipPos.y, tipPos.x + lineLen, tipPos.y);
      text("TIP: " + this.id, tipPos.x + lineLen + 10, tipPos.y);
      ae = this.getArcEndpoints(this.tip.angle);
      arc(tipPos.x, tipPos.y, arcLen, arcLen, ae.start, ae.end, OPEN); // Tip angle visual

      // Draw Forces/Gravity
      noFill();
      strokeWeight(1);

      // Base Forces
      var xx = gravityForce.x / 2;
      var yy = gravityForce.y / 2;
      stroke(baseDimColor);
      line(tipPos.x, tipPos.y, tipPos.x + xx, tipPos.y + yy);
      ellipse(tipPos.x + xx, tipPos.y + yy, 6, 6);

      // X/Y Gravity
      // stroke(baseDimColor);
      // line(tipPos.x, tipPos.y, tipPos.x + gravityBase.x, tipPos.y);
      // line(tipPos.x, tipPos.y, tipPos.x, tipPos.y + gravityBase.y);
      // ellipse(tipPos.x + gravityBase.x, tipPos.y, 6, 6);
      // ellipse(tipPos.x, tipPos.y + gravityBase.y, 6, 6);

      // Tip Forces
      var os = 1;
      stroke(tipDimColor);
      line(basePos.x, basePos.y, basePos.x + xx, basePos.y + yy);
      ellipse(basePos.x + xx, basePos.y + yy, 6, 6);

      // X/Y Gravity
      // stroke(tipDimColor);
      // line(basePos.x, basePos.y, basePos.x + gravityBase.x, basePos.y);
      // line(basePos.x, basePos.y, basePos.x, basePos.y + gravityBase.y);
      // ellipse(basePos.x + gravityBase.x, basePos.y, 6, 6);
      // ellipse(basePos.x, basePos.y + gravityBase.y, 6, 6);
    }
  }, {
    key: "getArcEndpoints",
    value: function getArcEndpoints(angle) {
      var arcStart = 0;
      var arcEnd = angle;
      if (arcEnd < 0) {
        var temp = arcStart;
        arcStart = arcEnd;
        arcEnd = temp;
      }
      return {
        start: arcStart,
        end: arcEnd
      };
    }
  }, {
    key: "draw",
    value: function draw(selectedId) {
      var colorOverride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var tipPosition = this.tip.position;
      if (!tipPosition) throw new Error("Failed to draw segment. No tipPosition was set.");
      var color = colorOverride || this.color || "#999999";
      var isSelected = selectedId === this.id;
      var dimColor = !!selectedId ? "#FFFFFF17" : color; //"#FFFFFFAA";

      stroke(isSelected ? color : dimColor);
      strokeWeight(3);
      var basePos = this.base.position;
      var tipPos = this.tip.position;
      line(basePos.x, basePos.y, tipPos.x, tipPos.y);

      // Dot/ball joint
      ellipse(tipPosition.x, tipPosition.y, 6, 6);
      if (!!this.nextSegment) this.nextSegment.draw(false, colorOverride);
      this.drawLabels();
    }
  }]);
  return TentacleSegment;
}();
_defineProperty(TentacleSegment, "colors", ["green"]);
// ["#00820077", "green"];
_defineProperty(TentacleSegment, "UI", P5Ui);