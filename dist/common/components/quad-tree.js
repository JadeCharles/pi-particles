"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.QuadRectangle = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var QuadTree = /*#__PURE__*/function () {
  /**
   * 
   * @param {{x:number, y:number, width:number, height: number}} rectangle - The standard rectangle to use for all quad trees. It will be converted to QuadRectangle which is behaves more like a circle, with a center point and a radius-x and radius-y.
   * @param {number} maxCapacity - Max number of elements before we subdivide
   * @param {number} depth - Current recursion depth of the quad tree
   */
  function QuadTree() {
    var rectangle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var maxCapacity = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
    var maxWidth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var maxHeight = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    _classCallCheck(this, QuadTree);
    if (depth === 0) {
      maxWidth = rectangle.width;
      maxHeight = rectangle.height;
    } else if (!rectangle && maxCapacity > 0) throw new Error("Rectangle is required for depth > 0 quad tree (current depth: " + depth + ")");
    this.depth = depth;
    this.maxHeight = maxHeight;
    this.maxWidth = maxWidth;
    if (!!rectangle && (this.maxHeight <= 0 || this.maxWidth <= 0)) {
      throw new Error("QuadTree maxWidth and maxHeight must be greater than 0 for level " + this.depth + " quad tree");
    }
    if (!rectangle) rectangle = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.offscreen = depth === 0 ? new QuadTree(null, 1, "Offscreen", -1) : null;
    this.boundary = QuadRectangle.fromObject(rectangle);
    this.maxCapacity = typeof maxCapacity === "number" && maxCapacity >= 2 ? maxCapacity : !rectangle ? -1 : 8;
    this.name = name || "QuadTree" + this.depth;
    this.isDivided = false;
    this.points = [];
    this.counter = 0;
  }

  /**
   * Creates a sub-quad tree for each quadrant of the current quad tree
   */
  _createClass(QuadTree, [{
    key: "spawnQuadTrees",
    value: function spawnQuadTrees() {
      if (this.isDivided) throw new Error("Already divided.");
      var b = this.boundary;
      var newDepth = this.depth + 1;
      var newWidth = b.width / 2;
      var newHeight = b.height / 2;
      var rectangle = {
        x: b.x,
        y: b.y,
        width: newWidth,
        height: newHeight
      };

      //rect, depth = 0, name = null, maxCapacity = 4, maxWidth = 0, maxHeight = 0
      this.topLeft = new QuadTree(_objectSpread({}, rectangle), newDepth, this.name + "-TL", this.maxCapacity, this.maxWidth, this.maxHeight);
      this.topRight = new QuadTree(_objectSpread(_objectSpread({}, rectangle), {}, {
        x: b.x + newWidth
      }), newDepth, this.name + "-TR", this.maxCapacity, this.maxWidth, this.maxHeight);
      this.bottomLeft = new QuadTree(_objectSpread(_objectSpread({}, rectangle), {}, {
        y: b.y + newHeight
      }), newDepth, this.name + "-BL", this.maxCapacity, this.maxWidth, this.maxHeight);
      this.bottomRight = new QuadTree(_objectSpread(_objectSpread({}, rectangle), {}, {
        x: b.x + newWidth,
        y: b.y + newHeight
      }), newDepth, this.name + "-BR", this.maxCapacity, this.maxWidth, this.maxHeight);
    }
  }, {
    key: "insertParticle",
    value: function insertParticle(particle) {
      if (particle.isOffscreen()) {
        if (this.depth > 0) throw new Error("Offscreen particle found on a non-root quad tree. This should not have happened.");
        this.offscreen.particles.push(particle);
        return 3;
      }
      if (this.isDivided) {
        return this.pushBelow(particle);
      }
      if (!this.boundary.containsParticlePosition(particle.position)) {
        //const pos = particle.position;
        // console.error("Point(" + pos.x + ", " + pos.y + ") in depth " + this.depth + " is not in the boundary of this quad tree (" + this.boundary.x + ", " + this.boundary.y + ") : " + this.boundary.width + " x " + this.boundary.height);
        // console.error("This should not have happened. It means it followed a bad recursive path to get here");
        return 0;
      }

      // Add it here. We will move them all down to the sub-quad trees later if this tree needs to be divided
      this.points.push(particle);
      if (this.maxCapacity < 0 || this.points.length < this.maxCapacity || this.depth >= QuadTree.maxDepth) {
        return 1;
      }

      // This tree is full and needs to be divided
      this.subdivide();
      return 2;
    }
  }, {
    key: "subdivide",
    value: function subdivide() {
      //console.log("Subdividing from level " + this.depth + ": " + this.particles.length);
      this.spawnQuadTrees();
      var i = 0;
      while (i < this.points.length) {
        this.pushBelow(this.points[i]);
        i++;
      }
      this.points = [];
      this.isDivided = true;
    }
  }, {
    key: "pushBelow",
    value: function pushBelow(particle) {
      var pos = particle.position;
      var d = ", depth: " + this.topLeft.depth;
      if (this.offscreen && this.offscreen.boundary.containsParticlePosition(pos, 0, 0, particle.isOffscreen())) {
        return this.offscreen.insertParticle(particle);
      } else if (this.topLeft.boundary.containsParticlePosition(pos)) {
        //console.log("Pushing to top left" + d);
        return this.topLeft.insertParticle(particle);
      } else if (this.topRight.boundary.containsParticlePosition(pos)) {
        //console.log("Pushing to top right" + d);
        return this.topRight.insertParticle(particle);
      } else if (this.bottomLeft.boundary.containsParticlePosition(pos)) {
        //console.log("Pushing to bottom left" + d);
        return this.bottomLeft.insertParticle(particle);
      } else if (this.bottomRight.boundary.containsParticlePosition(pos)) {
        //console.log("Pushing to bottom right" + d);
        return this.bottomRight.insertParticle(particle);
      }
      var errorMessage = "Point(" + pos.x + ", " + pos.y + ") is not in any of the sub-quadrants on level " + this.depth + "";
      console.error(errorMessage);
      //throw new Error(errorMessage);
    }
  }, {
    key: "draw",
    value: function draw(sketch) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var label = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      sketch.stroke(color || "white");
      sketch.noFill();
      var x = this.boundary.x;
      var y = this.boundary.y;
      var width = this.boundary.width;
      var height = this.boundary.height;
      var offset = (this.depth + 1) * 10;
      if (!label) label = "Top";
      sketch.rect(x, y, width, height);
      if (!label) label = "";else label = " (" + label + ")";
      var text = "Depth " + this.depth + " is divided: " + this.isDivided; //: " + this.name + ", Count: " + this.particles.length;
      sketch.text(text, x + offset, y + offset);
      if (!this.isDivided) {
        return;
      }
      var alpha = (255 - this.depth * 75) / 255;
      this.topLeft.draw(sketch, "rgba(255, 0, 0, " + alpha + ")", "topLeft");
      this.topRight.draw(sketch, "rgba(255, 255, 0, " + alpha + ")", "topRight"); //"yellow");
      this.bottomLeft.draw(sketch, "rgba(0, 255, 0, " + alpha + ")", "bottomLeft"); //"green");
      this.bottomRight.draw(sketch, "rgba(90, 150, 255, " + alpha + ")", "bottomRight"); //"cyan");
    }

    /**
     * Get's all the other particles within the range of the active/target particle using the quad tree.
     * @param {P5AttractionParticle} particle - The active/target particle to find other particles around.
     * @returns 
     */
  }, {
    key: "filterWithinRangeOf",
    value: function filterWithinRangeOf(particle) {
      // Check if the area of influence (particle.maxDistance) is within the boundary of this quad tree
      // Technically, we are checking to see if the particle's maxDistance influence intersects the boundary of the quad tree in any way
      if (!this.boundary.intersects(particle.rectangle, this.maxWidth, this.maxHeight)) {
        if (this.depth === 0 && !particle.isOffscreen()) {
          console.log("Quad Boundary");
          console.warn(JSON.stringify(this.boundary, null, 4));
          console.log("Particle Rectangle");
          console.warn(JSON.stringify(particle.rectangle, null, 4));
          console.log("Particle Position");
          console.warn(JSON.stringify(particle.position, null, 4));
          console.log("Max Size: (" + this.maxWidth + " x " + this.maxHeight + ")");
          throw new Error("Nothing found on top level with " + this.points.length + " particles (" + this.maxWidth + " x " + this.maxHeight + ")");
        }
        return [];
      }
      var found = [];
      if (this.isDivided) {
        found = found.concat(this.topLeft.filterWithinRangeOf(particle));
        found = found.concat(this.topRight.filterWithinRangeOf(particle));
        found = found.concat(this.bottomLeft.filterWithinRangeOf(particle));
        found = found.concat(this.bottomRight.filterWithinRangeOf(particle));
        return found;
      }
      var i = 0;
      var particleCount = this.points.length;

      // Here's where you find something, if at all
      while (i < particleCount) {
        var otherParticle = this.points[i]; // Search particles on this level. Should be no more than maxCapacity
        i++;

        // If this otherParticle is within the particle.maxDistance (aka areaRange.distance) then add it to the found array
        // we can set the width/height of the particle to zero since the particle is a circle, and is positioned at the center
        var match = this.boundary.containsParticlePosition(otherParticle.position);
        if (match) found.push(otherParticle);
      }
      return found;
    }
  }, {
    key: "getParticleAtPoint",
    value: function getParticleAtPoint(_ref) {
      var x = _ref.x,
        y = _ref.y;
      var cursor = this;
      var pos = {
        x: x,
        y: y
      };
      if (cursor.boundary.containsParticlePosition(pos)) {
        if (cursor.isDivided) {
          if (cursor.topLeft.boundary.containsParticlePosition(pos)) cursor = cursor.topLeft;else if (cursor.topRight.boundary.containsParticlePosition(pos)) cursor = cursor.topRight;else if (cursor.bottomLeft.boundary.containsParticlePosition(pos)) cursor = cursor.bottomLeft;else if (cursor.bottomRight.boundary.containsParticlePosition(pos)) cursor = cursor.bottomRight;else return null;
          return cursor.getParticleAtPoint({
            x: x,
            y: y
          });
        } else {
          if (cursor.points.length === 0) return null;

          // Get the particle that has the closest position to the x, y point
          var closestParticle = cursor.points.sort(function (a, b) {
            var aDistance = Math.sqrt(Math.pow(a.position.x - x, 2) + Math.pow(a.position.y - y, 2));
            var bDistance = Math.sqrt(Math.pow(b.position.x - x, 2) + Math.pow(b.position.y - y, 2));
            return aDistance - bDistance;
          })[0];
          return closestParticle;
        }
      }
      return null;
    }
  }]);
  return QuadTree;
}();
_defineProperty(QuadTree, "maxDepth", 2);
var QuadRectangle = /*#__PURE__*/function () {
  /**
   * 
   * @param {number} x - The x center coordinate
   * @param {number} y - The y center coordinate
   * @param {number} width - The width of half the entire rectangle, since we are centering it on the x,y coordinate
   * @param {number} height - The width of half the entire rectangle, since we are centering it on the x,y coordinate
   */
  function QuadRectangle(x, y, width, height) {
    _classCallCheck(this, QuadRectangle);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  _createClass(QuadRectangle, [{
    key: "containsParticlePosition",
    value: function containsParticlePosition(position) {
      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var isOffscreen = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      if (isOffscreen && this.width <= 0) return true;
      return position.x >= this.x && position.x + width < this.x + this.width && position.y >= this.y && position.y + height < this.y + this.height;
    }
  }, {
    key: "intersects",
    value: function intersects(particleRangeRect) {
      var maxWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var maxHeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      if (this.width <= 0) {
        // offscreen quadrant.
        throw new Error("Offscreen");
        // return rect.x < 0 || rect.y < 0
        //     || rect.x > maxWidth || rect.y > maxHeight;
      }

      var leftQuadBorder = this.x;
      var rightQuadBorder = this.x + this.width;
      var topQuadBorder = this.y;
      var bottomQuadBorder = this.y + this.height;
      var rangeLeft = particleRangeRect.x;
      var rangeRight = particleRangeRect.x + particleRangeRect.width;
      var rangeTop = particleRangeRect.y;
      var rangeBottom = particleRangeRect.y + particleRangeRect.height;
      return !(rightQuadBorder < rangeLeft || rangeRight < leftQuadBorder || bottomQuadBorder < rangeTop || rangeBottom < topQuadBorder);
      // return leftQuadBorder < particleRangeRect.x &&
      //     rightQuadBorder > particleRangeRect.x + particleRangeRect.width &&
      //     topQuadBorder < particleRangeRect.y &&
      //     bottomQuadBorder > particleRangeRect.y + particleRangeRect.height;
    }

    /**
     * Creates a QuadRectangle from a standard rectangle
     * @param {number} x - The top left x coordinate of the rectangle. An offset will be added to center the rectangle on the x,y coordinate
     * @param {number} y - The top left y coordinate of the rectangle. An offset will be added to center the rectangle on the x,y coordinate
     * @param {number} width - The entire width of the rectangle. It will be cut in half to get the half-width and centered on the x,y coordinate
     * @param {num} height - The entire height of the rectangle. It will be cut in half to get the half-height and centered on the x,y coordinate
     */
  }], [{
    key: "fromObject",
    value: function fromObject(rect) {
      if (_typeof(rect) !== "object" || rect === null) throw new Error("Invalid rect object passed to QuadRectangle.fromStandardRectangle: "(_typeof(rect)).toString());
      var width = rect.width;
      var height = rect.height;
      var x = rect.x >= 0 ? rect.x : 0;
      var y = rect.y >= 0 ? rect.y : 0;
      if (width >= 0 && height >= 0) return new QuadRectangle(x, y, width, height);
      throw new Error("Invalid rectangle fromObject: " + JSON.stringify(rect) + "");
    }
  }]);
  return QuadRectangle;
}();
exports.QuadRectangle = QuadRectangle;
var _default = QuadTree;
exports["default"] = _default;