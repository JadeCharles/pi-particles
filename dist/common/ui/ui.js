"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/** Utility/Helper class to handle some DOM UX activities. Uses JQuery */
var Ui = /*#__PURE__*/function () {
  function Ui() {
    var _this = this;
    var elementId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ui-container";
    _classCallCheck(this, Ui);
    this.menuStates = {};
    var menuItems = $('.menu-item > span.title');
    menuItems.off();
    menuItems.click(function (ev) {
      return _this.toggleMenuItem(ev, _this);
    });
  }
  _createClass(Ui, [{
    key: "closeMenus",
    value: function closeMenus() {
      $('.menu-item').removeClass('show');
    }
  }, {
    key: "toggleMenuItem",
    value: function toggleMenuItem(ev, app) {
      ev.preventDefault();
      ev.stopPropagation();
      var menuItem = $(ev.target);
      var i = 0;
      while (!!menuItem.get(0) && !menuItem.attr("id") && i < 10) {
        menuItem = menuItem.parent();
        i++;
      }
      menuItem = menuItem.parent();
      var isOpen = menuItem.hasClass('show');
      app.closeMenus();
      if (isOpen) menuItem.removeClass('show');else menuItem.addClass('show');
      return true;
    }
  }, {
    key: "isMenuItemOpen",
    value: function isMenuItemOpen() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var menuItems = typeof id === "string" && !!id ? $('#' + id) : $('.menu-item');
      return menuItems.hasClass('show');
    }
  }, {
    key: "updateValue",
    value: function updateValue(value, elementId) {
      if (typeof value !== "string" && typeof value !== "number") return false;
      $('#' + elementId).val(value);
      return true;
    }
  }, {
    key: "updateHtml",
    value: function updateHtml(value, elementId) {
      if (typeof value !== "string" && typeof value !== "number") {
        console.error("Failed to update Html with value: " + value);
        return false;
      }
      value = value.toString();
      $('#' + elementId).html(value);
      return true;
    }
  }, {
    key: "getElement",
    value: function getElement(id) {
      var elements = this.container.querySelector("#".concat(id));
      return Array.isArray(elements) && elements.length > 0 ? elements[0] : elements;
    }
  }]);
  return Ui;
}();
if (typeof module === 'undefined') {
  console.log("Can't export. Running Ui in-browser");
} else {
  module.exports = Ui;
}
var ui = new Ui(); // Make this available to (yet updatable by) the global scope, yet still export it for use in other modules