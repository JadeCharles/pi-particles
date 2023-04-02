"use strict";

function _readOnlyError(name) { throw new TypeError("\"" + name + "\" is read-only"); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ParticleLegend = /*#__PURE__*/_createClass(function ParticleLegend() {
  _classCallCheck(this, ParticleLegend);
});
_defineProperty(ParticleLegend, "createUi", function (app) {
  var containerElementId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "color-matrix";
  if (!app || !app.attractionMatrix) {
    console.error("Failed to create particle legend. App or attraction matrix is null.");
    return null;
  }
  var table = $('<table class="matrix"></table>');
  var colors = ParticleConfig.colors;
  var colorCount = Math.min(app.colorCount, app.attractionMatrix.length);
  if (!Array.isArray(colors)) {
    console.error("Failed to create particle legend. No colors available.");
    return null;
  }
  var header = $('<tr></tr>');
  header.append($('<td></td>'));
  var _loop = function _loop(i) {
    var color = colors[i].color;
    var colorCell = $('<span x-data="' + i + '" style="background-color:' + color + ';" class="legend-color"></span>');
    colorCell.click(function (e) {
      var result = typeof app.onCellClick === "function" ? app.onCellClick({
        type: "color",
        index: i,
        color: colors[i],
        colorName: colors[i].name,
        location: "top"
      }) : undefined;
      console.log("Color Clicked with result: " + result);
    });
    header.append($('<td></td>').append(colorCell));
  };
  for (var i = 0; i < colorCount; i++) {
    _loop(i);
  }
  table.append(header);
  var _loop2 = function _loop2(_i) {
    // [<td key={"color-matrix-row" + i}><span style={style} className="legend-color"></span></td>];
    var tr = $('<tr></tr>');
    var td = $('<td></td>');
    var colorCell = $('<span x-data="' + _i + '" style="background-color:' + colors[_i].color + '" class="legend-color"></span>');
    colorCell.click(function (e) {
      var result = typeof app.onCellClick === "function" ? app.onCellClick({
        type: "color",
        index: _i,
        color: colors[_i],
        colorName: colors[_i].name,
        location: "left"
      }) : undefined;
      console.log("Color Clicked: " + result);
    });
    td.append(colorCell);
    tr.append(td);
    var _loop3 = function _loop3(j) {
      var value = app.attractionMatrix[_i][j];
      var cell = $('<td>' + value.toFixed(2) + '</td>');
      cell.click(function (e) {
        var result = typeof app.onCellClick === "function" ? app.onCellClick({
          type: "cell",
          row: _i,
          col: j,
          value: value
        }) : undefined;
        if (typeof result === "undefined") console.warn("Cell Clicked: (" + _i + ", " + j + "): " + value.toFixed(2) + " - No app.onCellClick handler method found.");
        if (result === false) return;
        if (result === true) {
          //
          if (!!app.ui && typeof app.ui.closeMenus === "function") app.ui.closeMenus();
        }
        // Do something with the value
      });

      tr.append(cell);
    };
    for (var j = 0; j < colorCount; j++) {
      _loop3(j);
    }
    table.append(tr);
    //table.push(<tr key={"color-matrix-row-" + i}>{row}</tr>);
  };
  for (var _i = 0; _i < colorCount; _i++) {
    _loop2(_i);
  }
  var container = $('#' + containerElementId);
  if (!container.get(0)) {
    $('<span id="' + containerElementId + '"></span>'), _readOnlyError("container");
  }
  container.html('');
  container.append(table);
  return container;
});