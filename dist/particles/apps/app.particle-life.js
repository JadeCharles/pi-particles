"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @fileoverview Particle Life App - Main engine for the particle life app.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires ParticleApp.js
 */
var ParticleApp = /*#__PURE__*/function () {
  function ParticleApp(options) {
    _classCallCheck(this, ParticleApp);
    //colorCount = 4, elementId = "main-canvas", legendElementId = "color-matrix"
    var colorCount = typeof options === "number" ? options : (options === null || options === void 0 ? void 0 : options.colorCount) || 2;
    var elementId = (options === null || options === void 0 ? void 0 : options.canvasId) || (arguments.length <= 1 ? undefined : arguments[1]) || "main-canvas";
    var legendElementId = (options === null || options === void 0 ? void 0 : options.legendId) || (arguments.length <= 2 ? undefined : arguments[2]) || "color-matrix";
    var controlsElementId = (options === null || options === void 0 ? void 0 : options.controlsId) || (arguments.length <= 3 ? undefined : arguments[3]) || "controls";
    this.ui = options.ui;
    this.name = "Particle Life v1.0.0";
    this.stateText = "";
    this.attractionMatrix = ParticleConfig.createRandomAttractionMatrix();
    this.particles = [];
    this.colorCount = colorCount;
    this.spawnMode = 0;
    this.isRunning = true;
    this.legend = null;
    this.selectedIndex = -1;
    this.colorIndexCursor = 0;
    this.elementId = elementId;

    // These are defaults, but will be explicitly set down below to ensure the UI is updated.
    this.lubrication = 0.0;
    this.speed = 1.0;
    this.burstCount = 100;
    this.lubrication = ParticleConfig.lubrication();

    // These will be set in the updateCanvasSize() function.
    this.width = 0;
    this.height = 0;
    this.onMatrixUpdate = null;
    this.onPlayToggle = null;
    this.legendElementId = legendElementId;
    this.controlsElementId = controlsElementId;
    this.controls = new AnimationControls(this, {
      elementId: controlsElementId
    });
    this.updateCanvasSize(elementId);
    this.addEventListeners();
    var me = this;
    this.updateLegend = function () {
      console.log("Updating legend: " + legendElementId);
      ParticleLegend.createUi(me, legendElementId);
    };
    this.updateControls = function () {
      console.log("Updating Controls: " + controlsElementId);
      me.controls.display = "";
      me.controls.updateUi(me);
    };
    this.updateLegend();
    this.updateControls();
    this.updateUi(this.colorCount, 'color-count');

    // Call these methods so the UI updates (even though we've already set them)
    this.setFrictionAmount(ParticleConfig.friction);
    this.setSpeed(1);
    this.setColorCount(colorCount);
    this.setBurstCount(this.burstCount);
    console.log("App constructed with colorCount: " + colorCount);
  }
  _createClass(ParticleApp, [{
    key: "getDisplay",
    value: function getDisplay() {
      var display = "Paused";
      if (this.isRunning) {
        display = "Playing";
        if (this.particles.length === 0) display = "No Particles";else if (this.selectedIndex >= 0) display = ParticleConfig.colors[this.selectedIndex].name + " " + display;
      }
      return display;
    }
  }, {
    key: "onCellClick",
    value: function onCellClick(e) {
      var _e;
      if (!e) e = {
        type: "unknown"
      };
      if (((_e = e) === null || _e === void 0 ? void 0 : _e.type) === "cell") {
        console.log("Cell clicked good: " + e.row + ", " + e.col + " = " + e.value);
        return false;
      }
      if (e.type === "color") {
        // Use the variable "app" because this method is sometimes called by a JQuery event handler
        // which seems to hijack the this variable.
        app.selectParticleColor(e.index);
        app.updateControls();
        return false;
      }
      return true;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.particles = [];
      this.updateLegend();
      this.updateControls();
    }
  }, {
    key: "selectParticleColor",
    value: function selectParticleColor(index) {
      if (typeof index === "string") index = parseInt(index);
      if (typeof index !== "number" || index >= this.colorCount) index = -1;
      if (index === this.selectedIndex) {
        console.log("Unselected: " + index);
        index = -1;
      }
      this.selectedIndex = index;
      console.log("Selected Index: " + index);
      return true;
    }
  }, {
    key: "setBurstCount",
    value: function setBurstCount(count) {
      if (typeof count === "string") count = parseInt(count);
      if (typeof count !== "number" || count < 1) return false;
      this.burstCount = count;
      this.updateUi(this.burstCount, 'burst-count');
      return true;
    }
  }, {
    key: "setColorCount",
    value: function setColorCount(count) {
      if (typeof count === "string") count = parseInt(count);
      if (typeof count !== "number" || count < 1 || count > ParticleConfig.colors.length) return false;
      this.colorCount = count;
      this.updateLegend();
      return this.updateUi(this.colorCount, 'color-count');
    }
  }, {
    key: "setSpeed",
    value: function setSpeed() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;
      var updateFormValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (typeof speed === "string") speed = parseFloat(speed);
      if (isNaN(speed) || typeof speed !== "number") {
        console.error("Speed value is invalid (" + _typeof(speed).toString() + "): " + speed);
        return false;
      }
      this.updateAllParticlesValue("speed", speed);
      this.speed = speed;
      this.updateUi(this.speed, 'speed-amount');
      if (updateFormValue) this.updateUiValue(this.speed, 'speed-amount-value');
      return true;
    }
  }, {
    key: "setFrictionAmount",
    value: function setFrictionAmount(amount) {
      if (typeof amount === "string") amount = parseFloat(amount);
      if (typeof amount !== "number" || isNaN(amount)) return false;
      var lube = 1.0 - amount;

      // Update all particle individually
      // This is because we want to be able to change the friction amount for an individual particle at some point
      this.updateAllParticlesValue("lubrication", lube);
      this.lubrication = lube;
      console.log("Lubrication: " + lube.toFixed(4));

      //this.updateUiValue(amount.toFixed(6), 'friction-amount');
      this.updateUi(amount, 'friction-amount');
      return true;
    }
  }, {
    key: "updateUiValue",
    value: function updateUiValue(value, elementId) {
      var _this$ui;
      if (typeof ((_this$ui = this.ui) === null || _this$ui === void 0 ? void 0 : _this$ui.updateValue) === "function") return this.ui.updateValue(value, elementId);
      return false;
    }
  }, {
    key: "updateUi",
    value: function updateUi(value, elementId) {
      var _this$ui2;
      if (typeof ((_this$ui2 = this.ui) === null || _this$ui2 === void 0 ? void 0 : _this$ui2.updateHtml) === "function") {
        return this.ui.updateHtml(value, elementId);
      }
      console.error("Failed to update UI (" + elementId + "): " + value);
      return false;
    }
  }, {
    key: "setSpawnMode",
    value: function setSpawnMode(mode) {
      if (typeof mode === "string") mode = parseInt(mode);
      if (typeof mode !== "number" || isNaN(mode) || mode < 0) {
        console.error("Failed to setSpawnMode because mode is invalid: " + mode);
        return;
      }
      this.spawnMode = mode;
      console.log("Spawn mode is now: " + mode);
    }
  }, {
    key: "togglePlay",
    value: function togglePlay() {
      this.isRunning = !this.isRunning;
      if (typeof this.onPlayToggle === "function") this.onPlayToggle(this.isRunning);
      this.updateControls();
    }
  }, {
    key: "updateAllParticlesValue",
    value: function updateAllParticlesValue(fieldName, value) {
      var particleCount = this.particles.length;
      if (particleCount <= 0) return 0;
      if (typeof this.particles[0][fieldName] === "undefined") return -1;
      var i;
      for (i = 0; i < particleCount; i++) {
        this.particles[i][fieldName] = value;
      }
      return i;
    }
  }, {
    key: "setAttractionValue",
    value: function setAttractionValue(i, j, value) {
      if (typeof i === "string") i = parseInt(i);
      if (typeof j === "string") j = parseInt(j);
      if (typeof value === "string") value = parseFloat(value);
      if (typeof i !== "number" || typeof j !== "number" || typeof value !== "number") return;
      if (i < 0 || i >= this.attractionMatrix.length || j < 0 || j >= this.attractionMatrix.length) return;
      this.attractionMatrix[i][j] = value;
      if (typeof this.onMatrixUpdate === "function") this.onMatrixUpdate({
        i: i,
        j: j,
        value: value
      });
    }

    /**
     * Updates the size of the drawing canvas based on its html element container.
     * Each particle references this app object to get the global property values where needed.
     * Height/width, in this case
     * @param {string} elementId - The html elementId (<main id=""></main>) of the element to use for the canvas size
     * @returns {object} - The canvas size object { width: number, height: number }
     */
  }, {
    key: "updateCanvasSize",
    value: function updateCanvasSize(elementId) {
      if (typeof elementId !== "string" || elementId.length === 0) elementId = this.elementId;
      if (typeof document === "undefined") return;
      var canvas = document.getElementById(elementId);
      if (!canvas) {
        var message = typeof elementId !== "string" ? "There was no elementId provided to the updateCanvasSize() function." : "Be sure to add a <main></main> element with id='" + elementId + "' to the html page.";
        throw new Error("No canvas found: " + message);
      }
      this.width = typeof (canvas === null || canvas === void 0 ? void 0 : canvas.offsetWidth) === 'number' ? canvas.offsetWidth : 800;
      this.height = typeof (canvas === null || canvas === void 0 ? void 0 : canvas.offsetHeight) === 'number' ? canvas.offsetHeight - 1 : 500;
    }
  }, {
    key: "addEventListeners",
    value: function addEventListeners() {
      var _this = this;
      // Suppress right click when over the canvas
      document.querySelector("canvas").addEventListener("contextmenu", function (e) {
        if (typeof (e === null || e === void 0 ? void 0 : e.preventDefault) === "function") e.preventDefault();
        if (typeof (e === null || e === void 0 ? void 0 : e.stopPropagation) === "function") e.stopPropagation();
        if (typeof (e === null || e === void 0 ? void 0 : e.stopEvent) === "function") e.stopEvent();
        if (typeof (e === null || e === void 0 ? void 0 : e.stopEventPropagation) === "function") e.stopEventPropagation();
        return false;
      });

      // Generally add keyboard event handlers
      document.addEventListener("keydown", function (e) {
        _this.setAttractionMatrix(e.code);
      });
      console.log("Added event listeners");
    }
  }, {
    key: "spawnMany",
    value: function spawnMany() {
      var _options;
      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
      var colorIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
      var pos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      if (count <= 0) count = this.burstCount;
      if (count > 1000) count = 1000;
      if (pos === null) pos = {
        x: this.width / 2,
        y: this.height / 2
      };
      if (colorIndex < 0 && this.selectedIndex >= 0) colorIndex = this.selectedIndex;
      if (!options) options = {};
      if (typeof options.updateControls !== "boolean") options.updateControls = false;
      var randomRange = ((_options = options) === null || _options === void 0 ? void 0 : _options.randomRange) || 30;
      for (var i = 0; i < count; i++) {
        var ci = colorIndex >= 0 ? colorIndex : i % app.colorCount;
        var rx = Math.random() * randomRange - randomRange / 2;
        var ry = Math.random() * randomRange - randomRange / 2;
        var p = _objectSpread(_objectSpread({}, pos), {}, {
          x: pos.x + rx,
          y: pos.y + ry
        });
        app.spawn(ci, p, options);
      }
      app.colorIndexCursor = 0;
      app.updateControls();
    }
  }, {
    key: "spawn",
    value: function spawn() {
      var _options2;
      var colorIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
      var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      if (colorIndex < 0) {
        if (this.selectedIndex >= 0) {
          colorIndex = this.selectedIndex;
        } else {
          colorIndex = this.colorIndexCursor;
          this.colorIndexCursor++;
          var maxCount = Math.min(this.colorCount, ParticleConfig.colors.length);
          if (this.colorIndexCursor >= maxCount) this.colorIndexCursor = 0;
        }
      }
      if (_typeof(options) !== "object" || options === null) options = {};
      options.color_index = colorIndex;
      if (typeof (pos === null || pos === void 0 ? void 0 : pos.x) === "number") options.x = pos.x;
      if (typeof (pos === null || pos === void 0 ? void 0 : pos.y) === "number") options.y = pos.y;
      if (typeof ((_options2 = options) === null || _options2 === void 0 ? void 0 : _options2.maxDistance) !== "number" || options.maxDistance <= 0) options.maxDistance = 400;
      if (typeof this.particles === "undefined") {
        console.error("Particles are no good.");
        return null;
      }
      var particle = new Particle(this, options);
      this.particles.push(particle);
      if (options.updateControls !== false) this.updateControls();
      return particle;
    }
  }, {
    key: "setAttractionMatrix",
    value: function setAttractionMatrix(key) {
      if (typeof key !== "string" || key.length === 0) return;
      key = key.toLowerCase();
      switch (key) {
        case "r":
        case "keyr":
          this.attractionMatrix = ParticleConfig.createRandomAttractionMatrix();
          break;
        case "i":
        case "keyi":
          this.attractionMatrix = ParticleConfig.invertAttractionMatrix(this.attractionMatrix);
          break;
        case "d":
        case "keyd":
          this.attractionMatrix = ParticleConfig.createPositiveOrNegativeAttractionMatrix();
          break;
        case "u":
        case "keyu":
          this.attractionMatrix = ParticleConfig.createUniformAttractionMatrix();
          break;
        case "z":
        case "keyz":
          this.attractionMatrix = ParticleConfig.createZeroAttractionMatrix();
          break;
        case "escape":
          if (this.ui.isMenuItemOpen()) this.ui.closeMenus();else this.reset();
          break;
        default:
          console.log("Key Press: " + key);
          key = null;
          break;
      }
      this.updateLegend();
      if (typeof this.onMatrixUpdate === "function") {
        this.onMatrixUpdate(key);
      }
    }
  }, {
    key: "updatePhysics",
    value: function updatePhysics() {
      if (!this.isRunning) return;
      var i = 0;
      var particleCount = app.particles.length;
      var particles = app.particles;
      while (i < particleCount) {
        particles[i++].updatePhysics(particles);
      }
    }
  }, {
    key: "drawParticles",
    value: function drawParticles() {
      var i = 0;
      var particleCount = app.particles.length;
      while (i < particleCount) {
        app.particles[i].drawParticle(i);
        i++;
      }

      // Return an object in case we want to add more properties later.
      return {
        count: particleCount
      };
    }
  }]);
  return ParticleApp;
}();