"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Particle = /*#__PURE__*/function () {
  function Particle(app, options) {
    _classCallCheck(this, Particle);
    if (!options || _typeof(options) !== "object") options = {};
    this.id = options.id || (Math.random() * 100000000).toString(36);
    this.label = null;
    this.isDead = false;
    this.epoc = 0;
    this.tick = 0;
    this.app = app;
    this.speed = app.speed || 1.0;
    this.debugText = this.id;
    this.colorIndex = options.color_index >= 0 ? options.color_index % ParticleConfig.colors.length : Math.floor(Math.random() * ParticleConfig.colors.length);
    this.diameter = options.diameter || ParticleConfig.defaultDiameter;
    this.isSelected = options.isSelected === true;
    var particleColor = ParticleConfig.colors[this.colorIndex];
    this.position = createVector(options.x || 0, options.y || 0);
    this.force = !!options.force && options.force instanceof p5.Vector ? options.force : createVector(options.force_x || 0, options.force_y || 0);
    this.velocity = !!options.velocity && options.velocity instanceof p5.Vector ? options.velocity : createVector(options.velocity_x || 0, options.velocity_y || 0);
    this.angle = options.angle || 0;
    this.color = color(particleColor.color || "white");
    this.maxVelocity = (typeof options.maxVelocity === "number" ? options.maxVelocity : 0) || 3;
    this.bubbleColor = options.bubbleColor || ParticleConfig.bubbleColor;
    this.attachments = [];
    this.maxDistance = options.maxDistance || particleColor.maxDistance || ParticleConfig.range;
    this.rectangle = {
      x: this.position.x - this.maxDistance / 2,
      y: this.position.y - this.maxDistance / 2,
      width: this.maxDistance,
      height: this.maxDistance
    };
    this.mass = options.mass || 1;
    this.energy = options.energy || 1;
    this.eventHorizon = this.diameter * ParticleConfig.personalSpaceMultiplier;
    this.peakDistance = (this.maxDistance - 0) / 2.0;
    //console.log("PeakDistance: " + this.peakDistance + " MaxDistance: " + this.maxDistance + " Event Horizon: " + this.eventHorizon + "");

    this.onInteraction = typeof options.onInteraction === "function" ? options.onInteraction : Particle.doNothing;
    this.lubrication = app.lubrication;
    if (typeof this.lubrication !== "number") this.lubrication = options.lubrication >= 0 && options.lubrication <= 1 ? options.lubrication : ParticleConfig.lubrication();
    this.gravityLubrication = options.gravityLubrication || options.gravity_lubrication || 1;
    this.bounciness = options.bounciness || ParticleConfig.bounciness || Math.random();
  }
  _createClass(Particle, [{
    key: "isOffscreen",
    value: function isOffscreen() {
      var pos = this.position;
      return pos.x < 0 || pos.x > this.app.width || pos.y < 0 || pos.y > this.app.height;
    }
  }, {
    key: "setAngle",
    value: function setAngle(degrees) {
      this.angle = degrees * 0.0174532925;
    }
  }, {
    key: "setEnergy",
    value: function setEnergy(energy) {
      this.energy = energy;
      if (this.energy <= 0) this.die();
    }
  }, {
    key: "setColorIndex",
    value: function setColorIndex(index) {
      this.colorIndex = index % ParticleConfig.colors.length;
      var c = ParticleConfig.colors[this.colorIndex];
      this.color = c.color;
      this.maxDistance = c.maxDistance || this.maxDistance;
      return c;
    }

    /**
     * 
     * @param {Particle} otherParticle 
     * @param {numb} distance
     * @returns {number} The attraction value
     */
  }, {
    key: "calculateAttractionValue",
    value: function calculateAttractionValue(otherParticle, distance) {
      var d = distance - this.eventHorizon;
      var f = 0;
      if (d < 0) {
        f = -1 + distance / this.eventHorizon;
      } else {
        var p = d / this.peakDistance;
        if (p > 1) p = 2 - p;
        f = p * this.app.attractionMatrix[this.colorIndex][otherParticle.colorIndex];
      }
      return {
        attractionValue: f,
        distance: d
      };
    }

    /**
     * Calculates the force vector between this particle and another particle.
     * The velocity will be updated after this.
     */
  }, {
    key: "getForceVector",
    value: function getForceVector(otherParticle, distanceVector) {
      var distance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
      if (distance < 0) distance = distanceVector.mag();
      if (distance - this.eventHorizon > this.maxDistance) {
        // Too far away
        return {
          attractionValue: 0,
          force: createVector(0, 0)
        };
      }
      var _this$calculateAttrac = this.calculateAttractionValue(otherParticle, distance),
        attractionValue = _this$calculateAttrac.attractionValue;
      return {
        attractionValue: attractionValue,
        force: distanceVector.normalize().mult(attractionValue * 1.5)
      };
    }

    /**
     * 
     * @param {Particle} otherParticle 
     * @param {number} history 
     * @returns {number}
     */
  }, {
    key: "interactWith",
    value: function interactWith(otherParticle) {
      var history = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var distanceVector = p5.Vector.sub(otherParticle.position, this.position);
      var distance = distanceVector.mag();
      var _this$getForceVector = this.getForceVector(otherParticle, distanceVector, distance),
        force = _this$getForceVector.force;
      if (typeof this.constrain !== "function") this.constrain = this.enforceBoundaryField;
      this.constrain(force, 128);
      this.force = force;
      this.velocity.add(force).limit(this.maxVelocity * 5.0 * this.speed).mult(this.lubrication);
      return 0;
    }
  }, {
    key: "getGravityForce",
    value: function getGravityForce(otherMass, distanceVector) {
      var distance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
      if (distance < 0) distance = distanceVector.mag();
      var G = 1.1;
      var masses = this.mass * otherMass * G;
      if (distance < this.eventHorizon) {
        distanceVector.setMag(this.diameter);
        distance = this.diameter;
      }
      var gravityForceVector = distanceVector.normalize().mult(masses / (distance * distance));
      return {
        attractionValue: 1.0,
        force: gravityForceVector
        //velocity: velocityVector,
      };
    }
  }, {
    key: "enforceBoundaryField",
    value: function enforceBoundaryField(forceVector) {
      var boundaryMargin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 128;
      var _this$position = this.position,
        x = _this$position.x,
        y = _this$position.y;
      var _this$app = this.app,
        width = _this$app.width,
        height = _this$app.height;
      var farX = width - boundaryMargin;
      var farY = height - boundaryMargin;

      // This is so the particles softly slingshot back into the active area, instead of bouncing off the walls.
      // The higher the number, the more "stretchy" the boundary is.
      var reducer = 5;
      if (x < boundaryMargin) forceVector.x += (boundaryMargin - x) / (boundaryMargin * reducer);else if (x > farX) forceVector.x += (farX - x) / (boundaryMargin * reducer);
      if (y < boundaryMargin) forceVector.y += (boundaryMargin - y) / (boundaryMargin * reducer);else if (y > farY) forceVector.y += (farY - y) / (boundaryMargin * reducer);
    }

    /**
     * 
     * @param {Particle} otherParticle 
     * @param {number} history 
     * @returns {number}
     */
  }, {
    key: "gravitate",
    value: function gravitate(otherParticle) {
      var history = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var distanceVector = p5.Vector.sub(otherParticle.position, this.position);
      var distance = distanceVector.mag();
      var _this$getGravityForce = this.getGravityForce(otherParticle.mass || 1, distanceVector, distance),
        force = _this$getGravityForce.force;
      if (typeof this.constrain !== "function") this.constrain = this.enforceBoundaryField;
      this.constrain(force, 128);
      this.velocity.add(force).limit(this.maxVelocity).mult(this.gravityLubrication);
      return 0;
    }
  }, {
    key: "updateFallingPhysics",
    value: function updateFallingPhysics() {
      var force = createVector(0, 0.1);
      var repel = 2 * this.bounciness;
      if (this.position.y > this.app.height - this.diameter) {
        force.y = -this.velocity.y * repel;
      }
      if (this.position.x < this.diameter) {
        force.x = Math.abs(this.velocity.x) * repel;
      } else if (this.position.x > this.app.width - this.diameter) {
        force.x = -Math.abs(this.velocity.x) * repel;
      }
      this.velocity.add(force).mult(0.999);
      this.updatePosition();
    }
  }, {
    key: "updateGravityPhysics",
    value: function updateGravityPhysics(otherParticles) {
      var particle = this;
      var particleCount = otherParticles.length;
      var history = null;
      var i = 0;
      while (i < particleCount) {
        var otherParticle = otherParticles[i];
        i++;
        if (otherParticle.id === particle.id) continue; // No need to interact with itself
        history = this.gravitate(otherParticle, history);
      }
      this.updatePosition();
      this.updateTimers();
    }
  }, {
    key: "updatePhysics",
    value: function updatePhysics(otherParticles) {
      var particle = this;
      var particleCount = otherParticles.length;
      var history = null;
      var i = 0;
      while (i < particleCount) {
        var otherParticle = otherParticles[i++];
        if (otherParticle.id === particle.id) continue; // No need to interact with itself
        history = this.interactWith(otherParticle, history);
      }
      this.updatePosition(particleCount);
      this.updateTimers();
    }
  }, {
    key: "updateTimers",
    value: function updateTimers() {
      this.tick++;
      if (this.tick > 100000) {
        if (this.poc === 100000) {
          console.error("EPOC: " + this.epoc.toString());
        }
        this.epoc++;
        this.tick = 0;
      }
    }
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      this.position.add(this.velocity);
      var offset = this.maxDistance / 2;
      this.rectangle.x = (this.position.x - offset) * this.speed;
      this.rectangle.y = (this.position.y - offset) * this.speed;
    }
  }, {
    key: "drawParticle",
    value: function drawParticle(index) {
      var isPaused = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var pos = this.position;
      noStroke();
      fill(this.color, 0, 0);

      // Default mode is CENTER, which means it draws from the center of the circle based on diameter (not radius)
      // Switching the ellipseMode(RADIUS) will draw from the center, but use the radius for sizing
      ellipse(pos.x, pos.y, this.diameter, this.diameter);
    }
  }, {
    key: "drawLabel",
    value: function drawLabel() {
      var pos = this.position;
      var offset = this.diameter * 2.5;
      noStroke();
      fill("white");
      var label = this.label || JSON.stringify(this.position, null, 4);
      text(label, pos.x + offset, pos.y + offset);
    }
  }, {
    key: "drawRanges",
    value: function drawRanges(index) {
      var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.position;
      //const offset = this.diameter / 2.0;
      var cx = pos.x;
      var cy = pos.y;
      noFill();
      stroke("white");
      ellipse(cx, cy, this.eventHorizon, this.eventHorizon);

      //sketch.stroke("#00ff0088");
      //sketch.ellipse(cx, cy, this.peakDistance, this.peakDistance);

      stroke("#ffffff22");
      ellipse(cx, cy, this.maxDistance * 2, this.maxDistance * 2);

      // sketch.noStroke();rr
      // sketch.fill("#ffffff88");
      // sketch.text(this.maxDistance.toFixed(2), cx, cy + this.maxDistance + 5);        
    }
  }, {
    key: "drawForces",
    value: function drawForces() {
      var pos = this.position;
      stroke("white");
      strokeWeight(1);
      var vx = this.force.x * 100;
      var vy = this.force.y * 100;
      line(pos.x, pos.y, pos.x + vx, pos.y + vy);
    }
  }, {
    key: "zap",
    value: function zap() {
      this.velocity.set(0, 0, 0);
    }
  }, {
    key: "copulateWith",
    value: function copulateWith(otherParticle) {}
  }, {
    key: "eat",
    value: function eat(otherParticle) {
      if (otherParticle.diameter > this.diameter * 1.5) {
        return;
      }
      this.diameter += otherParticle.diameter * 0.4;
      //console.warn(ParticleOptions.colors[this.colorIndex].name + " ate " + ParticleOptions.colors[otherParticle.colorIndex].name);
      otherParticle.die();
    }
  }, {
    key: "die",
    value: function die() {
      this.isDead = true;
      //console.warn(ParticleOptions.colors[this.colorIndex].name + " died");
    }
    // Static and Interaction methods
  }], [{
    key: "doNothing",
    value: function doNothing(params) {
      // Do nothing
    }
  }, {
    key: "cloneMe",
    value: function cloneMe(me, otherParticle, force, dist) {
      return null;
    }
  }]);
  return Particle;
}();