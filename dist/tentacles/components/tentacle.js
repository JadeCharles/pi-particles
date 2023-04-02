"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Tentacle = /*#__PURE__*/function () {
  function Tentacle() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      x: 0,
      y: 0
    };
    _classCallCheck(this, Tentacle);
    if (_typeof(options) !== "object" || !options) {
      options = {
        x: 0,
        y: 0
      };
    }
    if (!options.agent) throw new Error("Tentacle must be created with a agent.");
    this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + new Date().getTime().toString();
    this.color = options.color || null;
    this.name = options.name || this.color || "Tentacle";
    this.agent = options.agent;
    this.shouldUpdate = false;
    this.selectedSegment = null;
    if (typeof options.x !== "number") options.x = this.agent.position.x;
    if (typeof options.y !== "number") options.y = this.agent.position.y;

    /**
     * The position of the tip of the tentacle
     */
    this.position = createVector(options.x, options.y);
    this.segmentCount = 0;
    this.totalLength = 0;
    this.state = 0; // 0=Flimsy with gravity, 1=Moving to position
    this.notes = "";
    this.tail = null;
    this.head = null;
    this.lastMouseX = null;
    this.lastMouseY = null;

    /**
     * @type {p5.Vector} - Target position that the tentacle's tip is moving towards
     */
    this.target = null;
  }
  _createClass(Tentacle, [{
    key: "appendSegment",
    value: function appendSegment(options) {
      if (!options) options = {};
      if (!this.head) {
        this.head = new TentacleSegment(this, null, options);
        this.tail = this.head;
      } else {
        var prevAnchorType = this.tail === this.head ? ANCHOR_TYPE_HEAD : ANCHOR_TYPE_NONE;
        this.tail = this.tail.appendSegment(options);
        this.tail.prevSegment.anchorType = prevAnchorType;
      }
      this.segmentCount++;
      this.totalLength += this.tail.length;
      return this.tail;
    }
  }, {
    key: "resetState",
    value: function resetState() {
      var cursor = this.head;
      while (!!cursor) {
        cursor.resetState();
        cursor = cursor.nextSegment;
      }
    }

    /**
     * Sets the target position (this.target) that the tip of the tentacle will move towards.
     * If this.target is null, the tentacle will not be moving (could be in a different state though)
     * @param {p5.Vector} pos - The position that the tip of the tentacle will move towards
     * @returns 
     */
  }, {
    key: "setTarget",
    value: function setTarget(pos) {
      console.log("Set Tentacle Target: " + pos.x.toFixed(2) + ", " + pos.y.toFixed(2));
      this.target = pos;
      return true;
    }

    /**
     * Sets all child segments (not the head) to the same angle (default is zero degrees: "straight")
     */
  }, {
    key: "straigtenTentacleSegments",
    value: function straigtenTentacleSegments() {
      var newGlobalAngle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var cursor = this.head;
      var ax = this.head.angle;
      while (!!cursor) {
        cursor.angle = ax + newGlobalAngle;
        console.log(cursor.id + " setting to " + cursor.angle.toFixed(4));
        cursor = cursor.nextSegment;
      }
      this.state = 0;
    }

    /**
     * Attempts to set the very tip of the tentacle to the given position. If not, it will reach as far as it can and completely straighten out.
     * Uses a cursor (not recursion or for/while loop) to loop through all tentacles (starting with the head) and updates each segment accordingly (not recursive).
     * If the pos is too far, it calls straigtenTentacleSegments() to straighten out the tentacle.
     * @param {p5.Vector} pos - The position that the tip of the tentacle will move towards
     * @returns 
     */
  }, {
    key: "setTailTipPosition",
    value: function setTailTipPosition(pos) {
      this.tail.target = pos.copy();
      var cursor = this.tail;
      while (!!cursor) {
        cursor.tip.position.set(pos);
        var dir = p5.Vector.sub(cursor.tip.position, cursor.base.position);
        cursor.angle = dir.heading();
        pos = pos.sub(cursor.calculateAngle());
        cursor = cursor.prevSegment;
      }
    }
  }, {
    key: "findGrabbablePosition",
    value:
    /**
     * Sets the color of the tentacle
     * @param {p5.Vector} locationPos - The position of the target that the tentacle is trying to grab. It searches around this area for a suitable tile that has grabability :)
     * @returns {p5.Vector|null} - Null if no suitable tile was found, otherwise a p5.Vector with the position of the tile that was found (usually then set as this.target)
     */
    function findGrabbablePosition(locationPos) {
      // const tentacleSpeed = this.tail.speed;
      // const speedDifference = 1 - (tentacleSpeed / (tentacleSpeed + this.agent.speed));

      return locationPos.copy();
    }

    /**
     * Re-evaluates
     * @param {number} x - The x position of the target
     * @param {number} y - The y position of the target
     * @returns {p5.Vector} - The distance between the furthest tail and the agent's current position center
     */
  }, {
    key: "courseCorrect",
    value: function courseCorrect(newCoursePosition) {
      // TODO: Find a position that is within the reach of the furthest tentacle

      // that is also "grabbable" by the agent -- Random for now
      // x -= Math.random() * 35;
      // y -= Math.random() * 35;

      this.setTarget(newCoursePosition);
      return newCoursePosition;
    }
  }, {
    key: "targetAcquired",
    value: function targetAcquired() {
      var arrivalResult = typeof this.onTentacleGrabbed == "function" ? this.onTentacleGrabbed(this.tailTipPosition, this.target) : 0;
      this.target = null;
      this.agent.reSortTentacles();
      if (typeof arrivalResult === "number") this.state = arrivalResult;
    }
  }, {
    key: "getStretchDistance",
    value: function getStretchDistance() {
      var _this$head, _this$tail;
      if (!((_this$head = this.head) !== null && _this$head !== void 0 && _this$head.position) || !((_this$tail = this.tail) !== null && _this$tail !== void 0 && _this$tail.tipPosition)) return 0;
      return p5.Vector.dist(this.head.position, this.tail.tipPosition);
    }
  }, {
    key: "updatePhysics",
    value: function updatePhysics(index, isAuto) {
      if (!this.head) throw new Error("No tentacle to updatePhysics with");
      var movementForces = createVector(0, 0);
      this.head.updatePhysics(isAuto);
      return movementForces;
    }

    /**
     * Updates the coordinates of the tentacle head base after all forces have been acted upon and stored, now update the positions based on them
     * @param {number} index - The index of the tentacle in the agent's tentacle array
     * @returns {boolean}
     */
  }, {
    key: "updatePositions",
    value: function updatePositions(index) {
      // Prioritize the anchors (in this case, the tail)
      if (!this.head) return false;
      this.head.base.position.set(this.agent.position);
      this.head.updatePositions();
      return true;
    }
  }, {
    key: "draw",
    value: function draw(index) {
      var selectedSegmentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (!this.head) {
        console.warn("No head.");
        return;
      }
      var colorOverride = null;

      // Recursively draw all segments
      this.head.draw(selectedSegmentId, colorOverride);
      if (this.debugLevel > 0) {
        if (!!this.target) {
          TentacleSegment.UI.drawCircleAt(this.target, "#00FF0088", 12, "Target");
        }
      }
      text(this.name + ": " + (this.notes || ""), 10, 50 + index * 20);
    }
  }]);
  return Tentacle;
}();