"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var TentacleAgent = /*#__PURE__*/function (_Agent) {
  _inherits(TentacleAgent, _Agent);
  var _super = _createSuper(TentacleAgent);
  function TentacleAgent(options) {
    var _this;
    _classCallCheck(this, TentacleAgent);
    _this = _super.call(this, options);
    if (!options) options = {};
    _this.selectedIndex = -1;
    _this.health = options.health || 100;
    _this.tentacles = options.tentacles || [];
    _this.backgroundColor = typeof options.backgroundColor === "string" || options.backgroundColor === null ? options.backgroundColor : "black";
    _this.name = options.name || "Tentacle Agent";
    _this.color = options.color || "white";
    _this.app = options.app || null;
    _this.notes = null;
    _this.debugLevel = 0;
    _this.speed = options.speed || options.speed || 1.5;
    _this.accelerationScalar = options.acceleration || options.accelerationValue || 0.1;
    _this.acceleration = createVector(0, 0); // Acceleration vector (x/y direction)

    _this.currentSpeed = createVector(0, 0); // Current speed vector (x/y direction)
    _this.currentScalarSpeed = 0; // Current speed as a decimal value

    _this.targetSpeed = createVector(0, 0); // Max speed vector (x/y direction)
    _this.targetScalarSpeed = 0; // Max speed as a decimal value

    _this.target = null; // The target the agent is moving towards

    var pos = _this.position;
    var tentacleSegmentLength = options.tentacleSegmentLength || 24;
    var tentacleSegmentCount = options.tentacleSegmentCount || options.tentacleSegmentCount || 10;
    var tentacleCount = options.tentacleCount || 0;
    for (var i = 0; i < tentacleCount; i++) {
      var po = {
        x: pos.x,
        y: pos.y,
        angle: 0,
        agent: _assertThisInitialized(_this),
        name: _this.name + " Tentacle " + i
      };
      var color = _this.color;
      var t = _this.createTentacle(po, tentacleSegmentCount, tentacleSegmentLength, color);
    }
    _this.tentacleCount = tentacleCount;
    _this.setRestingPose(pos.x, pos.y);
    return _this;
  }

  /**
   * 
   * @param {object} pos - Position object { x: number, y: number }
   * @param {number} segmentCount - Number of tentacle segments (the higher the number, the more fluid the tentacle)
   * @param {number} segmentLength - Length of each segment (the smaller the number, the more fluid the tentacle)
   * @returns 
   */
  _createClass(TentacleAgent, [{
    key: "createTentacle",
    value: function createTentacle(pos) {
      var segmentCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
      var segmentLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
      var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      if (this.needsEventListeners) this.addEventListeners();
      if (!pos) pos = {
        x: this.position.x,
        y: this.position.y
      };
      var tentacle = new Tentacle({
        agent: this,
        color: color
      });
      var colorCount = TentacleSegment.colors.length;
      var tailIndex = segmentCount - 1;
      var intervalRadians = Math.PI / 3;
      var cursor = null;
      for (var i = 0; i < segmentCount; i++) {
        var m = i % 2 === 0 ? -1 : 1;
        // const randomAngle = (Math.random() * (Math.PI / 2)) * m;

        var angle = (i === 0 ? Math.PI / 6 : intervalRadians) * m;
        var segmentOptions = {
          x: pos.x,
          y: pos.y,
          angle: angle,
          length: segmentLength,
          color: color,
          colorIndex: i % colorCount
        };
        cursor = tentacle.appendSegment(segmentOptions);
      }
      tentacle.head.id = "head-" + this.tentacles.length.toString();
      tentacle.tail.id = "tail-" + this.tentacles.length.toString();
      this.tentacles.push(tentacle);
      if (this.selectedIndex < 0) this.selectedIndex = 0;
      this.tentacleCount = this.tentacles.length;
      return tentacle;
    }
  }, {
    key: "setRestingPose",
    value: function setRestingPose(x, y) {
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      for (var i = 0; i < this.tentacles.length; i++) {
        var dx = typeof offset === "number" ? offset : this.tentacles[i].totalLength;
        var dy = dx;
        var mod = i % 4;
        switch (mod) {
          case 0:
            dx = -dx;
            break;
          case 2:
            dx = -dx;
            dy = -dy;
            break;
          case 3:
            dy = -dy;
            break;
        }
        var xx = Math.max(x + dx * 0.7, -1);
        var yy = Math.max(y + dy * 0.7, -1);
        this.tentacles[i].setTarget(createVector(xx, yy));
      }
    }
  }, {
    key: "resetState",
    value: function resetState() {
      for (var i = 0; i < this.tentacleCount; i++) {
        this.tentacles[i].resetState();
      }
    }
  }, {
    key: "setTargetDestination",
    value: function setTargetDestination(targetPos) {
      this.target = targetPos;
      console.log("Set Target: " + this.target);
      this.targetScalarSpeed = this.speed;
      this.targetSpeed = p5.Vector.sub(this.target, this.position);
      this.acceleration = this.targetSpeed.copy().setMag(this.accelerationScalar); // Set to max acceleration

      this.targetSpeed.setMag(this.targetScalarSpeed); // Set to max speed
      this.accelerate();

      //this.updateSpeed(Math.max(this.currentScalarSpeed, 0.00001)); // Set to current speed (if it currently has a speed), or 0.00001 (if it's stopped, which is basically zero)

      this.reSortTentacles();
      return this.target;
    }

    /**
     * Gets the tentacle that has a tip that is the closest to the last calculated agent target position,
     * which is the last tentacle in the array after reSortTentacles() is called.
     * @returns {Tentacle} The tentacle that is closest to the target, which is to say: the tentacle that is sorted last in the array after reSortTentacles() is called
     */
  }, {
    key: "getClosestTentatleToTarget",
    value: function getClosestTentatleToTarget() {
      return this.tentacles[this.tentacleCount - 1];
    }

    /**
     * Gets the tentacle that has a tip that is the farthest from the last calculated agent target position,
     * which is the first tentacle in the array after reSortTentacles() is called.
     * @returns {Tentacle} The tentacle that is farthest from the target, which is to say: the tentacle that is sorted last in the array after reSortTentacles() is called
     */
  }, {
    key: "getFarthestTentatleToTarget",
    value: function getFarthestTentatleToTarget() {
      return this.tentacles[0];
    }
  }, {
    key: "reSortTentacles",
    value: function reSortTentacles() {
      var _this2 = this;
      if (!this.target) return this.tentacles;
      this.tentacles.sort(function (a, b) {
        var aDist = (a.tail.tip || a.tail.getEndPosition()).dist(_this2.target);
        var bDist = (b.tail.tip || b.tail.getEndPosition()).dist(_this2.target);
        return bDist - aDist;
      });
      return this.tentacles;
    }
  }, {
    key: "getSelectedTentacle",
    value: function getSelectedTentacle() {
      return this.tentacles[this.selectedIndex];
    }
  }, {
    key: "onArrival",
    value: function onArrival() {
      var _this3 = this;
      var clearTarget = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      if (clearTarget === true) {
        this.targetSpeed = createVector(0, 0);
        this.targetScalarSpeed = 0;
        this.target = null;
        this.acceleration = createVector(0, 0);
        this.currentSpeed = createVector(0, 0);
        this.currentScalarSpeed = 0;
        setTimeout(function () {
          if (!_this3.target) _this3.setRestingPose(_this3.position.x, _this3.position.y);
        }, 800);
      }

      // Current speed
      this.updateSpeed(Math.max(this.currentScalarSpeed, 0.00001));
      if (typeof this.onStop === "function") this.onStop();
    }
  }, {
    key: "update",
    value: function update(index) {
      var isAuto = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var i = 0;
      var tentacleCount = this.tentacles.length;
      var tentacleForces = createVector(0, 0);
      while (i < tentacleCount) {
        var forces = this.tentacles[i].updatePhysics(i, isAuto);
        tentacleForces.add(forces);
        i++;
      }
      return this.updatePositions(tentacleForces);
    }
  }, {
    key: "updatePositions",
    value: function updatePositions(tentacleForces) {
      var tentacleCount = this.tentacles.length;
      if (this.currentScalarSpeed < this.targetScalarSpeed) {
        this.accelerate();
      }

      // TODO: Some Newtonian physics here with tentacleForces
      var posUpdate = false;
      var hasArrived = false;
      if (!!this.target) {
        this.position.add(this.currentSpeed);
        var diff = p5.Vector.sub(this.target, this.position);
        var distance = diff.mag();
        var minDist = Math.max(1, this.currentScalarSpeed);
        posUpdate = true;
        hasArrived = distance <= minDist;
      }
      var i = 0;

      // Set the head position of each tentacle to the position of the agent' position
      // The rest of the segments will auto configure themselves
      while (i < tentacleCount) {
        this.tentacles[i].updatePositions(i);
        i++;
      }
      if (posUpdate && typeof this.onPositionUpdate === "function") this.onPositionUpdate();
      if (hasArrived) {
        console.error("Agent Arrived");
        this.onArrival();
      }
      return tentacleCount;
    }
  }, {
    key: "accelerate",
    value: function accelerate() {
      if (typeof this.currentScalarSpeed !== "number") throw new Error("Can't accelerate. CurrentScalarSpeed is no good: " + this.currentScalarSpeed);
      if (typeof this.accelerationScalar !== "number" || this.accelerationScalar <= 0) throw new Error("Can't accelerate. AccelerationScalar is no good: " + this.accelerationScalar);
      return this.updateSpeed(this.currentScalarSpeed + this.accelerationScalar);
    }
  }, {
    key: "updateSpeed",
    value: function updateSpeed(speedScalar) {
      if (!this.target) return;
      if (typeof speedScalar !== "number") throw new Error("Can't set speed scalar: " + speedScalar);
      if (speedScalar <= 0) {
        if (!this.target) {
          this.currentSpeed = createVector(0, 0);
          this.currentScalarSpeed = 0;
          return this.currentSpeed;
        }
      }
      this.currentSpeed = p5.Vector.sub(this.target, this.position);
      this.currentSpeed.setMag(speedScalar);
      this.currentScalarSpeed = speedScalar;
      return this.currentSpeed;
    }
  }, {
    key: "drawTarget",
    value: function drawTarget() {
      if (!this.target) return false;
      stroke("#FFFFCC08");
      strokeWeight(16);
      line(this.position.x, this.position.y, this.target.x, this.target.y);
      noFill();
      stroke("#FFFFFF");
      strokeWeight(1);
      ellipse(this.target.x, this.target.y, 24, 24);
      ellipse(this.target.x, this.target.y, 2, 2);
      return true;
    }
  }, {
    key: "draw",
    value: function draw(index) {
      var selectedSegmentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var tentacles = this.tentacles;
      var tentacleCount = tentacles.length;
      var i = 0;
      while (i < tentacleCount) {
        tentacles[i].draw(i);
        i++;
      }
      _get(_getPrototypeOf(TentacleAgent.prototype), "draw", this).call(this, index);
      this.drawTarget();
    }
  }]);
  return TentacleAgent;
}(Agent);