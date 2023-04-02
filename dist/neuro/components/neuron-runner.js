"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * A visual effect to make it seem like there is some sort of brain activity going on...
 * Concretely - It's a little particle thingy that moves along the weights, etc
 */
var NeuronRunner = /*#__PURE__*/function () {
  function NeuronRunner(network) {
    var _this = this;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, NeuronRunner);
    if (!(network instanceof FeedForwardNueralNetwork)) throw new Error("NeuronRunner must be created with a feed-forward network type");
    this.id = options.id || (Math.random() * 99999999).toString(16);
    this.vectorHandler = VectorHandler.createP5Handler();
    this.network = network;
    this.neuron = options.neuron instanceof Neuron ? options.neuron : null;
    this.drawer = options.drawer || NeuronRunner.defaultDrawer;
    this.repeat = typeof options.repeat !== "number" ? options.repeat === true ? -1 : 0 : options.repeat;

    // Visual properties
    this.color = options.color || null;
    this.borderColor = options.borderColor || null;
    this.size = {
      width: options.width || 0,
      height: options.height || 0
    };
    this.speed = typeof options.speed === "number" && options.speed >= 0 ? options.speed : 5;

    // Cursors
    this.position = null;
    this.target = null;
    this.wayPoints = Array.isArray(options.wayPoints) ? options.wayPoints : [];
    this.reverseWayPoints = [];
    this.twoWay = options.twoWay === true;
    if (this.wayPoints.length > 0) {
      this.target = this.wayPoints.shift();
    }
    if (this.twoWay) {
      this.reverseWayPoints.push(this.neuron);
      if (this.target) this.reverseWayPoints.push(this.target);
    }

    // Clean up the properties
    if (typeof this.size.width !== "number" || this.size.width <= 0) this.size.width = 4;
    if (typeof this.size.height !== "number" || this.size.height <= 0) this.size.height = 4;
    if (!this.color && !this.borderColor) this.borderColor = "#FFFFFF77";

    // Navigation Functions ---

    /** Default callback for any time the runner changes linear direction */
    this.onNavigate = function (targetNeuron) {
      var targetPos = targetNeuron.agent.position;
      if (!targetPos) throw new Error("Invalid targetNeuron during onNavigate(targetNeuron)");
      if (_this.wayPoints.length > 0) {
        //return this.setNextTarget();
      } else {
        // End
        _this.onComplete();
        _this.destroy();
      }
      return 1;
    };
    this.onReverse = function () {
      console.log("onReverse()");
    };
    this.onComplete = function () {
      console.log("onComplete()");
    };

    // state management
    this.printed = false;
    this.isReversed = false;
    this.didReverse = false;
  }
  _createClass(NeuronRunner, [{
    key: "setNextTarget",
    value: function setNextTarget() {
      if (this.wayPoints.length === 0) {
        return 0;
      }
      this.target = this.wayPoints.shift();
      if (!this.twoWay) return true;
      if (!this.isReversed) this.reverseWayPoints.push(this.target);else if (this.didReverse) {
        this.didReverse = false;
        this.onReverse();
      }
      if (this.wayPoints.length === 0) {
        // cleared.
        if (this.twoWay) {
          if (this.isReversed) {
            this.isReversed = false;
            this.reverseWayPoints = [];
            return false;
          }
          this.isReversed = true;
          this.didReverse = true;
          this.wayPoints = this.reverseWayPoints;
          this.wayPoints.reverse();
          this.reverseWayPoints = [];
          return 1;
        }
        return 0;
      }
      return 1;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      return this.network.removeRunner(this);
    }
  }, {
    key: "onArrival",
    value: function onArrival(neuron) {
      var arrival = this.onNavigate(neuron) || 0;
      //
      return arrival;
    }
  }, {
    key: "run",
    value: function run() {
      var _neuron, _neuron$layer, _neuron$agent;
      var neuron = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!neuron) neuron = this.neuron;
      if (((_neuron = neuron) === null || _neuron === void 0 ? void 0 : (_neuron$layer = _neuron.layer) === null || _neuron$layer === void 0 ? void 0 : _neuron$layer.network) !== this.network) throw new Error("NeuronRunner.run called with invalid neuron. Must be part of the network " + this.network.name);
      if (!((_neuron$agent = neuron.agent) !== null && _neuron$agent !== void 0 && _neuron$agent.position)) throw new Error("Neuron does not have a valid agent position. Be sure to add neuron.agent");
      this.neuron = neuron;
      this.position = neuron.agent.position.copy();
      if (!!options.target) {
        if (!!this.target) this.wayPoints.push(this.target);else this.target = options.target;
      }
      if (typeof options === "function") {
        this.onNavigate = options;
        options = {};
      } else if (typeof options.onNavigate === "function") {
        this.onNavigate = options.onNavigate;
      }
      this.repeat = typeof options.repeat !== "number" ? options.repeat === true ? -1 : this.repeat : options.repeat;
      this.speed = typeof options.speed === "number" && options.speed >= 0 ? options.speed : this.speed;
    }
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      if (!this.target || !this.position) {
        console.warn("NeuronRunner.updatePosition() called : No target (" + this.target + ") or position (" + this.position + ")");
        return;
      }
      var tp = this.target.agent.position;
      var diff = this.vectorHandler.sub(tp, this.position);
      var dir = diff.normalize();
      var dx = dir.x * this.speed;
      var dy = dir.y * this.speed;
      this.position.add(createVector(dx, dy));
      diff = this.vectorHandler.sub(tp, this.position); // See if we overshot it (or arrived)

      if (Math.abs(diff.x) < this.speed && Math.abs(diff.y) < this.speed) {
        this.vectorHandler.setValues(this.position, tp.x, tp.y);
        this.onArrival(this.target);
        if (this.wayPoints.length > 0) this.setNextTarget();
      }
    }

    /** Uses p5 - Be sure this is ultimately invoked from a sketch */
  }, {
    key: "draw",
    value: function draw() {
      this.drawer.draw(this.position, this);
    }

    /** Static runner waypoint maps */
  }], [{
    key: "createStrongestConnectorMap",
    value: function createStrongestConnectorMap(neuron) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var waypoints = [neuron];
      var current = neuron;
      var network = neuron.layer.network;
      if (!network) throw new Error("NeuronRunner.createStrongestConnectorMap called with invalid neuron");
      var _loop = function _loop() {
        var index = 0;
        var w = -10000;
        current.forwardConnectors.map(function (c, idx) {
          var weight = Math.abs(c.weight);
          if (weight > w) {
            w = weight;
            index = idx;
          }
        });
        var next = current.forwardConnectors[index].dest;
        waypoints.push(next);
        current = next;
      };
      while (current.forwardConnectors.length > 0) {
        _loop();
      }
      return waypoints;
    }
  }, {
    key: "createRandomConnectorMap",
    value: function createRandomConnectorMap(neuron) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var waypoints = [neuron];
      var current = neuron;
      var network = neuron.layer.network;
      if (!network) throw new Error("NeuronRunner.createStrongestConnectorMap called with invalid neuron");
      while (current.forwardConnectors.length > 0) {
        var index = Math.floor(Math.random() * current.forwardConnectors.length);
        var next = current.forwardConnectors[index].dest;
        waypoints.push(next);
        current = next;
      }
      return waypoints;
    }
  }]);
  return NeuronRunner;
}();
_defineProperty(NeuronRunner, "_nonce", 0);
_defineProperty(NeuronRunner, "defaultDrawer", {
  draw: function draw(position, sender) {
    if (NeuronRunner._nonce === 0) {
      console.error("NeuronRunner: No drawer specified. Neuron Runners will not be drawn.");
      NeuronRunner._nonce++;
    }
  }
});
if (typeof module === 'undefined') {
  console.log("Can't export. Running NeuronLayer in-browser");
} else {
  module.exports = NeuronRunner;
}