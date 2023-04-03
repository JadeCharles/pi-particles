"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var TentacleApp = /*#__PURE__*/function (_App) {
  _inherits(TentacleApp, _App);
  var _super = _createSuper(TentacleApp);
  function TentacleApp() {
    var _this;
    _classCallCheck(this, TentacleApp);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call(this, args);
    _this.name = "Tentacle App";
    _this.grid = null; // options.grid || null;
    _this.showGrid = true;
    _this.isAuto = false;
    _this.autoState = 0;
    _this.selectedIndex = -1;
    _this.agents = [];
    _this.markers = [];
    if (typeof document === "undefined") return _possibleConstructorReturn(_this, null);
    if (!document.getElementById(_this.elementId)) {
      return _possibleConstructorReturn(_this);
    }
    _this.updateCanvasSize();
    if (!!_this.addEventListeners()) console.log("Tentacle App mounted");else if (_this.addEventListeners > 1) console.warn("No canvas mounted");
    return _this;
  }
  _createClass(TentacleApp, [{
    key: "createAgent",
    value: function createAgent(options) {
      if (!this.mounted) {
        if (this.needsEventListeners > 1) console.warn("App not mounted yet: " + this.needsEventListeners);
        return null;
      }
      if (this.needsEventListeners) this.addEventListeners();
      if (!options) options = {};
      options.app = this;
      this.agents.push(new TentacleAgent(options));
    }
  }, {
    key: "addEventListeners",
    value: function addEventListeners() {
      var _this2 = this;
      var canvas = _get(_getPrototypeOf(TentacleApp.prototype), "addEventListeners", this).call(this, true);
      if (!canvas) return;
      if (typeof document === "undefined") return null;

      // Handle Key Press

      // Generally add keyboard event handlers
      document.addEventListener("keydown", function (e) {
        var agent = _this2.agents.length > 0 ? _this2.agents[0] : null;
        var tent = agent === null || agent === void 0 ? void 0 : agent.tentacles[0];
        var k = e.key.toLowerCase();
        switch (k) {
          case "escape":
            break;
          case "t":
          case "keyt":
            _this2.autoState = 1;
            break;
          case "a":
          case "keya":
            _this2.isAuto = !_this2.isAuto;
            break;
          case "h":
            break;
          case "s":
          case "keys":
            if (!!tent) {
              var _tent$selectedSegment, _tent$selectedSegment2;
              tent.selectedSegment = !!tent.selectedSegment ? (_tent$selectedSegment = tent.selectedSegment) === null || _tent$selectedSegment === void 0 ? void 0 : _tent$selectedSegment.nextSegment : tent.head;
              console.log("Selected segment: " + (((_tent$selectedSegment2 = tent.selectedSegment) === null || _tent$selectedSegment2 === void 0 ? void 0 : _tent$selectedSegment2.id) || "(None)"));
            }
            break;
          case "d":
          case "keyd":
            var _agent = _this2.agents[0];
            if (!!_agent) {
              _agent.debugLevel++;
              if (_agent.debugLevel > 2) _agent.debugLevel = 0;
            }
            break;
        }
      });
      console.log("Added event listeners? " + (canvas !== null).toString());
      return canvas;
    }
  }, {
    key: "resetState",
    value: function resetState() {
      for (var i = 0; i < this.agents.length; i++) {
        this.agents[i].resetState();
      }
      this.isAuto = false;
      this.autoState = 0;
    }
  }, {
    key: "update",
    value: function update() {
      var i = 0;
      var agents = TentacleApp.instance.agents;
      var agentCount = agents.length;
      while (i < agentCount) {
        agents[i].update(i, this.isAuto);
        i++;
      }

      // Return an object in case we want to add more properties later.
      return {
        count: agentCount
      };
    }
  }, {
    key: "draw",
    value: function draw() {
      this.refreshCanvas();
      if (!!this.grid) this.grid.drawGrid();
      var i = 0;
      var agents = TentacleApp.instance.agents;
      var agentCount = agents.length;
      while (i < agentCount) {
        var _this$selectedSegment;
        agents[i].draw(i, (_this$selectedSegment = this.selectedSegment) === null || _this$selectedSegment === void 0 ? void 0 : _this$selectedSegment.id);
        i++;
      }
      i = 0;
      var len = this.markers.length;
      stroke(0, 255, 255);
      strokeWeight(1);
      noFill();
      while (i < len) {
        var m = this.markers[i];
        if (!m.text) continue;
        fill(0, 255, 255, 80);
        ellipse(m.x, m.y, 16, 16);
        noFill();
        text(m.text, m.x + 16, m.y);
        i++;
      }
      noFill();

      // Return an object in case we want to add more properties later.
      return {
        count: agentCount,
        agent: agentCount > 0 ? agents[0] : null
      };
    }
  }], [{
    key: "init",
    value: function init() {
      var grid = new GameGrid({
        showGrid: true
      });
      TentacleApp.instance = new TentacleApp({
        grid: grid
      });
    }
  }]);
  return TentacleApp;
}(App);
_defineProperty(TentacleApp, "instance", new TentacleApp());