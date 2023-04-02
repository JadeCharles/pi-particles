"use strict";

/**
 * @fileoverview Particle Life Sketch - This is the main p5 sketch implementation. It basically does all the graphical stuff using the p5 library.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires app.tentacles.js
 */

var appOptions = {
  colorCount: 5
};

/**
 * Implementation of the p5.js setup() function. This is called anytime the html page updates (load, resize, etc.).
 */
function setup() {
  var _app$grid;
  var app = TentacleApp.instance;
  createCanvas(app.width, app.height); // p5.js function to create the canvas.

  console.log("Setup Good: " + app.width + " x " + app.height);
  app.mounted = true;
  (_app$grid = app.grid) === null || _app$grid === void 0 ? void 0 : _app$grid.updateSize();
}
function gravityTest(deg) {
  deg = deg % 360;
  var angle = deg * Math.PI / 180;
  var len = 10;
  var forces = createVector(0, -9.8);
  var t = createVector(len * Math.cos(angle), len * Math.sin(angle));
  var torque = p5.Vector.mult(forces, t);
  var g2 = t.y * t.y;
  var l2 = len * len;

  // g2 + x2 = l2
  // x2 = l2 - g2
  torque.x = Math.sqrt(l2 - g2);
  // a2 + b2 = c2
  // c = sqrt(a2 + b2)

  console.warn("Torque [" + deg + "]: " + torque.x + ", " + torque.y);
  setTimeout(function () {
    //gravityTest(deg + 5);
  }, 1000);
  return false;
}
function handleLeftClick(mouseX, mouseY) {
  console.log("Left Click");
  var app = TentacleApp.instance;
  var agent = app.agents.length > 0 ? app.agents[0] : null;
  if (!agent) return;
  var m = createVector(mouseX, mouseY);
  agent.tentacles[0].setTailTipPosition(m, 3);
  app.agents[0].tentacles[0].shouldUpdate = true;
}
function handleRightClick(mouseX, mouseY) {
  console.log("Right Click");
  //if (gravityTest(0)) return;
}

function mouseEvent(button, mx, my) {
  var app = TentacleApp.instance;
  app.button = button;
  switch (button) {
    case 2:
      // Right click.
      this.handleRightClick(mouseX, mouseY);
      break;
    default:
      this.handleLeftClick(mouseX, mouseY);
      break;
  }
  app.lastMouseX = mouseX;
  app.lastMouseY = mouseY;
  return false;
}

/**
 * Handles mouse events, obviously.
 * @param {PointerEvent} e - The mouse event. e.button is 0 for left click, 1 for middle click, 2 for right click.
 * @returns 
 */
function mousePressed(e) {
  var target = e === null || e === void 0 ? void 0 : e.target;

  // Only allow mouse clicks on the canvas.
  if ((target === null || target === void 0 ? void 0 : target.tagName.toString()) !== "CANVAS") {
    return;
  }
  var button = e === null || e === void 0 ? void 0 : e.button;
  e.stopPropagation();
  e.preventDefault();
  if (typeof button !== "number") {
    console.error("No button found");
    return false;
  }
  return mouseEvent(button, mouseX, mouseY);
}
function mouseDragged(e) {
  var target = e === null || e === void 0 ? void 0 : e.target;

  // Only allow mouse clicks on the canvas.
  if ((target === null || target === void 0 ? void 0 : target.tagName) !== "CANVAS") return;
  var app = TentacleApp.instance;
  if (app.lastMouseX === null) return;
  var agent = app.agents.length > 0 ? app.agents[0] : null;
  if (!agent) return;
  var selectedJoint = agent === null || agent === void 0 ? void 0 : agent.tentacles[0].selectedSegment;
  if (!!selectedJoint) {
    console.log("Drag Good.");
    debugMoveJoint(app, selectedJoint);
    return;
  }
  var m = createVector(mouseX, mouseY);
  agent.tentacles[0].setTailTipPosition(m, 3);
}
function debugMoveJoint(app, joint) {
  var my = app.height - mouseY;
  var lmy = typeof app.lastMouseY === "number" ? app.height - app.lastMouseY : my;
  var dy = my - lmy;
  joint.updateAngleBy(-dy / 100); //tent.head.position.y);

  app.lastMouseX = mouseX;
  app.lastMouseY = mouseY;
}

// Drawing Methods - Always on the bottom of the file

/**
 * Draws the visual representation of where the selectedAgent is headed to (targeting)
 * @returns 
 */
function drawTarget() {
  // Draw mouse cursor:
  if (typeof app.lastMouseX !== "number") return;
  noFill();
  stroke("#FFFFFF88");
  strokeWeight(1);
  ellipse(app.lastMouseX, app.lastMouseY, 32, 32);
  fill("white");
  ellipse(app.lastMouseX, app.lastMouseY, 4, 4);
}

/**
 * Implementation of the p5.js draw() function.
 * This is called every frame: Updates the physics of all particle interactions, then draws the particles.
 */
function draw() {
  var app = TentacleApp.instance;
  app.update();
  app.draw();

  // Set pen color to white
  fill(255);

  // Draw the top label/caption
  if (!!app.text) {
    noStroke();
    textAlign(LEFT, TOP);
    text(app.text, 10, 20);
  }
}

// Make sure draw() is the last function in the class for readability.