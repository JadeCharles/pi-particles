"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var GameTile = /*#__PURE__*/_createClass(function GameTile() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  _classCallCheck(this, GameTile);
  if (typeof options.row !== "number") throw new Error("Invalid tile row");
  if (typeof options.column !== "number") throw new Error("Invalid tile column");
  if (typeof options.width !== "number" || options.width <= 0) throw new Error("Invalid tile width");
  if (typeof options.height !== "number" || options.height <= 0) throw new Error("Invalid tile height");
  this.row = options.row;
  this.column = options.column;
  this.color = options.color || null;
  this.width = options.width;
  this.height = options.height;
  this.x = this.row * this.width;
  this.y = this.column * this.height;
  this.centerX = this.x + this.width / 2;
  this.centerY = this.y + this.height / 2;
  this.value = options.value || 0;
  if (typeof this.value !== "number") this.value = 0;
  if (!this.color && this.value > 0) this.color = "white";
});
var GameGrid = /*#__PURE__*/function () {
  function GameGrid(options) {
    _classCallCheck(this, GameGrid);
    if (!options) options = {
      width: -1,
      height: -1,
      tileWidth: 24,
      tileHeight: 24
    };
    this.width = options.width || -1;
    this.height = options.height || -1;
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
    if (typeof this.tileWidth !== "number" || this.tileWidth <= 0) this.tileWidth = 24;
    if (typeof this.tileHeight !== "number" || this.tileHeight <= 0) this.tileHeight = 24;
    this.tiles = [];
    this.columns = 0;
    this.rows = 0;
    this.showGrid = true; //options.showGrid === true;

    this.updateSize();
  }
  _createClass(GameGrid, [{
    key: "updateSize",
    value: function updateSize() {
      var _this = this;
      var canvas = document.querySelector("canvas");
      if (!canvas) return false;
      var canvasWidth = 0;
      var canvasHeight = 0;
      if (!!canvas) {
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
      }
      if (typeof this.width !== "number" || this.width <= 0) this.width = canvasWidth;
      if (typeof this.height !== "number" || this.height <= 0) this.height = canvasHeight;
      var colCount = Math.floor(this.width / this.tileWidth);
      var rowCount = Math.floor(this.height / this.tileHeight);
      this.columns = colCount;
      this.rows = rowCount;
      console.log("Grid Size: " + this.rows + "x" + this.columns);
      this.tiles = Array.from({
        length: rowCount
      }, function (_, i) {
        return Array.from({
          length: colCount
        }, function (_, j) {
          var options = {
            value: Math.round(Math.random() * 3) % 3 === 0 ? 1 : 0,
            row: i,
            column: j,
            width: _this.tileWidth,
            height: _this.tileHeight
          };
          return new GameTile(options);
        });
      });
    }
  }, {
    key: "getTileAtPosition",
    value: function getTileAtPosition(x, y, radius) {
      if (typeof x !== "number" || typeof y !== "number") return null;
      var units = radius / (this.tileWidth / 2.0);
      var r = 0;
      var fallbackTile = null;
      do {
        var col = Math.floor(x / this.tileWidth);
        var row = Math.floor(y / this.tileHeight);
        r += units;
        if (col < 0 || row < 0) continue;
        if (col >= this.columns || row >= this.rows) continue;
        var tile = this.tiles[row][col];
        if (tile.value > 0) return tile;else if (!fallbackTile) fallbackTile = tile;
      } while (r < radius * 2);
      return fallbackTile;
    }
  }, {
    key: "drawGrid",
    value: function drawGrid() {
      //if (!this.showGrid) return;

      var rowCount = this.rows;
      var colCount = this.columns;
      noFill();
      strokeWeight(1);
      for (var row = 0; row < rowCount; row++) {
        for (var col = 0; col < colCount; col++) {
          var tile = this.tiles[row][col];
          if (!tile) continue;
          var c = tile.color || "#FFFFFF11";
          stroke(c);
          rect(tile.x, tile.y, tile.width, tile.height);
        }
      }
    }
  }]);
  return GameGrid;
}();
p5.Vector.prototype.isWithinMidPoint = function (p1, p2) {
  if (!p1 || !p2) return false;
  var p3 = this; //this.player.position;

  var backDiff = p5.Vector.sub(p3, p1);
  var bodyDiff = p5.Vector.sub(p2, p3);
  var m = p5.Vector.mult(backDiff, bodyDiff);
  if (m.x >= 0 || m.y >= 0) {
    return true;
  }
  return false;
};
p5.Vector.prototype.isInBetween = function (p1, p2) {
  if (!p1 || !p2) return false;
  var middlePoint = this;
  var dir = p5.Vector.sub(p2, p1).normalize();
  var middlePointDir = p5.Vector.sub(middlePoint, p1).normalize();
  var m = p5.Vector.mult(dir, middlePointDir);
  if (m.x >= 0 && m.y >= 0) {
    var pastDir = p5.Vector.sub(p2, middlePoint);
    m = p5.Vector.mult(pastDir, dir);
    if (m.x >= 0 && m.y >= 0) {
      //console.log("Is Within Midpoint: " + m.x + ", " + m.y);
      return true;
    }
  }
  return false;
};