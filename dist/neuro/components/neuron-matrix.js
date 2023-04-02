"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Basically the p5.Vector paradigm applied to a Matrix.
 * It's used to perform all (ok, maybe no "ALL" per se) the cool matrix math needed in ML
 * 
 * @note: If you're using pure JavaScript, this file should be included first
 */
var NeuroMatrix = /*#__PURE__*/function () {
  function NeuroMatrix(rowCount, columnCount) {
    var _this = this;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    _classCallCheck(this, NeuroMatrix);
    this.rowCount = parseInt(rowCount);
    this.columnCount = parseInt(columnCount);
    if (typeof this.rowCount !== "number" || this.rowCount <= 0) throw new Error("rowCount must be a positive number");
    if (typeof this.columnCount !== "number" || this.columnCount <= 0) throw new Error("columnCount must be a positive number");
    var getFillValue = function getFillValue() {
      return 0.0;
    };
    if ((options === null || options === void 0 ? void 0 : options.randomize) === true || options === true) getFillValue = function getFillValue() {
      return _this.randomizeWeights(options.randomMax, options.min);
    };
    if (typeof options === "number") getFillValue = function getFillValue() {
      return options;
    };else if (typeof options === "function" && typeof options(0, 0) === "number") getFillValue = options;
    if (!(this.columnCount > 0)) throw new Error("columnCount must be a positive number: " + this.columnCount);
    if (!(this.rowCount > 0)) throw new Error("rowCount must be a positive number: " + this.rowCount);
    var rows = Array(this.rowCount).fill();
    var columns = Array(this.columnCount).fill();
    this.items = rows.map(function () {
      return columns.map(function () {
        return getFillValue();
      });
    });
  }
  _createClass(NeuroMatrix, [{
    key: "toList",
    value: function toList() {
      var items = [];
      var row, col;
      for (row = 0; row < this.rowCount; row++) for (col = 0; col < this.columnCount; col++) items.push(this.items[row][col]);
      return items;
    }
  }, {
    key: "randomizeWeights",
    value: function randomizeWeights() {
      var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
      var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var range = max - min;
      var midRange = range / 2.0;
      return this.setMatrixValues(function (_) {
        return Math.random() * range - midRange;
      });
    }
  }, {
    key: "copy",
    value: function copy() {
      var neuroMatrix = new NeuroMatrix(this.rowCount, this.columnCount);
      for (var i = 0; i < this.rowCount; i++) {
        for (var j = 0; j < this.columnCount; j++) {
          neuroMatrix.items[i][j] = this.items[i][j];
        }
      }
      return neuroMatrix;
    }
  }, {
    key: "add",
    value: function add(neuroMatrix) {
      if (neuroMatrix instanceof NeuroMatrix) {
        if (this.rowCount !== neuroMatrix.rowCount) throw new Error("Add failed: this and neuroMatrix don't seem to have matching number of rows (this.rowCount: " + this.rowCount + " vs. " + neuroMatrix.rowCount + ")");
        if (this.columnCount !== neuroMatrix.columnCount) throw new Error("Add failed: this and neuroMatrix don't seem to have matching number of columns (this.columnCount: " + this.columnCount + " vs. " + neuroMatrix.columnCount + ") although the rows do match (" + this.rowCount + ")");
        return this.setMatrixValues(function (value, row, col) {
          return value + neuroMatrix.items[row][col];
        });
      } else if (typeof neuroMatrix === "number") {
        return this.setMatrixValues(function (value) {
          return value + neuroMatrix;
        });
      }
      throw new Error("Add failed: Invalid type passed to add method (" + _typeof(neuroMatrix) + "). Must be a number or a NeuroMatrix");
    }
  }, {
    key: "sub",
    value: function sub(neuroMatrix) {
      if (this.rowCount !== neuroMatrix.rowCount) throw new Error("Sub failed: m1 and m2 don't seem to have matching number of rows");
      if (this.columnCount !== neuroMatrix.columnCount) throw new Error("Sub failed: m1 and m2 don't seem to have matching number of columns");
      return this.setMatrixValues(function (value, row, col) {
        return value - neuroMatrix.items[row][col];
      });
    }
  }, {
    key: "mult",
    value: function mult(neuroMatrix) {
      if (neuroMatrix instanceof NeuroMatrix) {
        if (this.rowCount !== neuroMatrix.rowCount) throw new Error("Multiplication failed: m1 and m2 don't seem to have matching number of rows (" + this.rowCount + " vs. " + neuroMatrix.rowCount + ")");
        if (this.columnCount !== neuroMatrix.columnCount) throw new Error("Multiplication failed: m1 and m2 don't seem to have matching number of columns (" + this.columnCount + " vs. " + neuroMatrix.columnCount + ") although the rows do match (" + this.rowCount + ")");
        // if (this.rowCount !== neuroMatrix.rowCount || this.columnCount !== neuroMatrix.columnCount)
        //     throw new Error("Multiplication failed: This matrix is not transposable to the passed matrix");

        return this.setMatrixValues(function (value, i, j) {
          return value * neuroMatrix.items[i][j];
        });
      } else {
        return this.setMatrixValues(function (value) {
          return value * neuroMatrix;
        });
      }
    }

    /**
     * Cool mapper I "inspired by" CodingTrain
     * @param {function|number} valueFunction - A function that takes the current value, row and column and returns the new value, or a number to set all values to
     * @returns {NeuroMatrix} - So we can chain methods together
     */
  }, {
    key: "setMatrixValues",
    value: function setMatrixValues(_valueFunction) {
      if (typeof _valueFunction !== "function") {
        if (typeof _valueFunction !== "number") throw new Error("setMatrixValues failed: Invalid valueFunction passed to setMatrixValues method. Must be a function");
        _valueFunction = function valueFunction() {
          return _valueFunction;
        };
      }
      for (var row = 0; row < this.rowCount; row++) {
        for (var col = 0; col < this.columnCount; col++) {
          var currentValue = this.items[row][col];
          this.items[row][col] = _valueFunction(currentValue, row, col);
        }
      }
      return this;
    }

    /* Static Constructor-ish methods */

    /**
     * Converts a list of numbers to a NeuroMatrix with list.length number of rows, and 1 column
     * @param {[number]} arr - An array of numbers
     * @returns {NeuroMatrix} - A new NeuroMatrix instance
     */
  }], [{
    key: "fromList",
    value: function fromList(list) {
      return new NeuroMatrix(list.length, 1).setMatrixValues(function (_, row) {
        return list[row];
      });
    }

    /**
     * Creates a new NeuroMatrix instance from an existing NeuroMatrix one, using a setter function to set the values or a number to set all values to
     * @param {NeuroMatrix} neuroMatrix - A NeuroMatrix instance
     * @param {function|number} setterFunction - A function that takes the current value, row and column and returns the new value, or a number to set all values to
     * @returns {NeuroMatrix} - A new NeuroMatrix instance
     */
  }, {
    key: "fromMatrix",
    value: function fromMatrix(neuroMatrix, _setterFunction) {
      if (typeof _setterFunction !== "function") {
        if (typeof _setterFunction !== "number") throw new Error("Invalid setterFunction passed to fromMatrix method. Must be a function");
        _setterFunction = function setterFunction() {
          return _setterFunction;
        };
      }
      var newMatrix = new NeuroMatrix(neuroMatrix.rowCount, neuroMatrix.columnCount);
      return newMatrix.setMatrixValues(function (_, i, j) {
        return _setterFunction(neuroMatrix.items[i][j], i, j);
      });
    }

    /**
     *  Takes a Json representation of a NeuroMatrix and returns a new NeuroMatrix instance
     * @param {string|object} json - Json (string of object) 
     * @returns {NeuroMatrix} - A new NeuroMatrix instance
     */
  }, {
    key: "fromJson",
    value: function fromJson(json) {
      if (typeof json == "string") json = JSON.parse(json);
      if (!json.items) throw new Error("Invalid JSON passed to NeuroMatrix.fromJson (no items property)");
      var neuroMatrix = new NeuroMatrix(json.rowCount, json.columnCount);
      neuroMatrix.items = json.items;
      return neuroMatrix;
    }

    /* Static Operations Methods */
  }, {
    key: "setMatrixValues",
    value: function setMatrixValues(neuroMatrix, setterFunction) {
      return new NeuroMatrix(neuroMatrix.rowCount, neuroMatrix.columnCount).setMatrixValues(function (_, i, j) {
        return setterFunction(neuroMatrix.items[i][j], i, j);
      });
    }

    /**
     * Ripped this from p5.js and converted it to a matrix implementation
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix} - The summed matrix
     */
  }, {
    key: "add",
    value: function add(m1, m2) {
      if (m1.rowCount !== m2.rowCount) throw new Error("m1 and m2 don't seem to have matching number of rows");
      if (m1.columnCount !== m2.columnCount) throw new Error("m1 and m2 don't seem to have matching number of columns");
      return new NeuroMatrix(m1.rowCount, m2.columnCount).setMatrixValues(function (_, row, col) {
        return m1.items[row][col] + m2.items[row][col];
      });
    }

    /**
     * Ripped this from p5.js and converted it to a matrix implementation
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix} - The subtracted matrix
     */
  }, {
    key: "sub",
    value: function sub(m1, m2) {
      if (m1.rowCount !== m2.rowCount) throw new Error("m1 and m2 don't seem to have matching number of rows");
      if (m1.columnCount !== m2.columnCount) throw new Error("m1 and m2 don't seem to have matching number of columns");
      return new NeuroMatrix(m1.rowCount, m2.columnCount).setMatrixValues(function (_, row, col) {
        return m1.items[row][col] - m2.items[row][col];
      });
    }

    /**
     * Some cool linear algebra stuff. Multiplies two matrices together (I.e. multiply each row of m1 by each column of m2, [aka: Matrix Multiplication])
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix}
     */
  }, {
    key: "mult",
    value: function mult(m1, m2) {
      if (m1.columnCount !== m2.rowCount) throw new Error("Failed to multiply matrices. Columns must be of the same size (m1.columnCount:" + m1.columnCount + " != m2. m2.rowCount:" + m2.rowCount + ")");
      return new NeuroMatrix(m1.rowCount, m2.columnCount).setMatrixValues(function (_, row, col) {
        var total = 0;
        for (var i = 0; i < m1.columnCount; i++) total += m1.items[row][i] * m2.items[i][col];
        return total;
      });
    }

    /**
     * Transposing a matrix is simply swaping the rows and columns.
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix} - The subtracted matrix
     */
  }, {
    key: "transpose",
    value: function transpose(neuroMatrix) {
      return new NeuroMatrix(neuroMatrix.columnCount, neuroMatrix.rowCount).setMatrixValues(function (_, i, j) {
        return neuroMatrix.items[j][i];
      });
    }
  }]);
  return NeuroMatrix;
}();
if (typeof module === 'undefined') {
  console.log("Can't export. Running NeuroMatrix in-browser");
} else {
  module.exports = NeuroMatrix;
}