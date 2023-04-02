"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var P5NeuroDrawer = /*#__PURE__*/function () {
  function P5NeuroDrawer() {
    _classCallCheck(this, P5NeuroDrawer);
  }
  _createClass(P5NeuroDrawer, null, [{
    key: "drawNeuron",
    value: function drawNeuron(position, sender) {
      var agent = sender.agent;
      var pos = position;
      var size = agent.size;
      var agentColor = agent.color;
      var backgroundColor = agent.backgroundColor || Neuron.defaultBackgroundColor;
      var colorOverride = sender.isSelected ? sender.selectedColor : agentColor;

      // Draw Connectors First
      for (var i = 0; i < sender.forwardConnectors.length; i++) {
        var color = sender.isSelected ? colorOverride : null;
        sender.forwardConnectors[i].draw(color);
      }

      // Draw the neuron
      noFill();
      textAlign(CENTER, CENTER);
      if (sender.layer.index > 0) {
        stroke(Math.abs(sender.error) > 0.1 ? "pink" : "#FFFFFF33");
        var lbl = sender.error.toFixed(3);
        if (!!sender.label) lbl += ": " + sender.label;
        text(lbl, pos.x, pos.y + 64);
      }
      stroke(colorOverride);
      text(sender.value.toFixed(3), pos.x, pos.y + 24);

      // Raw value always dimmed
      // stroke(this.isSelected ? "#FFFF0066" : "#FFFFFF33");
      // text("R:" + this.rawValue.toFixed(3), pos.x, pos.y + 44);

      if (!!backgroundColor) fill(backgroundColor);else noFill();
      strokeWeight(1);
      ellipse(pos.x, pos.y, size, size);
    }
  }, {
    key: "drawNeuronConnector",
    value: function drawNeuronConnector(position, sender) {
      var _sender$weight;
      var p1 = sender.source.agent.position;
      var p2 = sender.dest.agent.position;
      strokeWeight(1);
      var isSelected = sender.source.isSelected || sender.dest.isSelected;
      var alpha = (sender.weight + Neuron.maxWeightValue) / (Neuron.maxWeightValue * 2);
      var weightedColor = "rgba(255, 255, 255, " + alpha.toFixed(2) + ")";
      var connectorColor = isSelected ? "rgba(255, 255, 0, " + alpha.toFixed(2) + ")" : weightedColor;
      stroke(connectorColor);
      line(p1.x, p1.y, p2.x, p2.y);
      var m = p5.Vector.sub(p2, p1).mult(0.2);
      var p3 = p5.Vector.add(p1, m.mult(sender.source.index % 4 + 1));
      noFill();
      textAlign(CENTER, CENTER);
      text(((_sender$weight = sender.weight) === null || _sender$weight === void 0 ? void 0 : _sender$weight.toFixed(3)) || "Null", p3.x, p3.y);
      if (!!sender.label) {
        text(thsenderis.label, p3.x, p3.y + 20);
      }
    }
  }, {
    key: "drawNeuronRunner",
    value: function drawNeuronRunner(position, sender) {
      var _sender$size, _sender$size2;
      if (!!(sender !== null && sender !== void 0 && sender.borderColor)) {
        strokeWeight(3);
        stroke(sender.borderColor);
      } else noStroke();
      if (!!sender.color) fill(sender.color);else noFill();
      ellipse(position.x, position.y, (sender === null || sender === void 0 ? void 0 : (_sender$size = sender.size) === null || _sender$size === void 0 ? void 0 : _sender$size.width) || 20, (sender === null || sender === void 0 ? void 0 : (_sender$size2 = sender.size) === null || _sender$size2 === void 0 ? void 0 : _sender$size2.height) || 20);
    }
  }]);
  return P5NeuroDrawer;
}();
if (typeof module === 'undefined') {
  console.log("Can't export. Running P5NeuroDrawer in-browser");
} else {
  module.exports = P5NeuroDrawer;
}