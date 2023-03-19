/**
 * @fileoverview Particle Life Sketch - This is the main p5 sketch implementation. It basically does all the graphical stuff using the p5 library.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires app.tentacles.js
 */

let appOptions = { colorCount: 5 };

/**
 * Implementation of the p5.js setup() function. This is called anytime the html page updates (load, resize, etc.).
 */
function setup() {
    const app = TentacleApp.instance;
    
    createCanvas(app.width, app.height);    // p5.js function to create the canvas.

    console.log("Setup Good: " + app.width + " x " + app.height);
    app.mounted = true;
    app.grid?.updateSize();
}

function gravityTest(deg) { 
    deg = deg % 360;
    let angle = deg * Math.PI / 180;
    let len = 10;
    let forces = createVector(0, -9.8);
    
    const t = createVector(len * Math.cos(angle), len * Math.sin(angle));
    const torque = p5.Vector.mult(forces, t);

    const g2 = t.y * t.y;
    const l2 = len * len;

    // g2 + x2 = l2
    // x2 = l2 - g2
    torque.x = Math.sqrt(l2 - g2);
    // a2 + b2 = c2
    // c = sqrt(a2 + b2)

    console.warn("Torque [" + deg + "]: " + torque.x + ", " + torque.y);

    setTimeout(() => {
        //gravityTest(deg + 5);
    }, 1000);

    return false;

}

function handleRightClick(mouseX, mouseY) { 
    console.log("Right Click");
    const app = TentacleApp.instance;
    const player = app.players.length > 0 ? app.players[0] : null;

    if (!player) { 
        console.warn("No Player.");
        return;
    }

    const m = createVector(mouseX, mouseY);
    player.tentacles[0].setTailTipPosition(m, 3);
}

function handleLeftClick(mouseX, mouseY) {
    console.log("Left Click");
    //if (gravityTest(0)) return;

    const app = TentacleApp.instance;

    if (app.players.length === 0) { 
        const options = { x: mouseX, y: mouseY, color: "green", name: "Jade", tentacleCount: 1, tentacleSegmentLength: 128, tentacleSegmentCount: 4};
        app.createPlayer(options);
    } else {
        const selectedPlayer = app.players[0];
        const mousePosition = createVector(mouseX, mouseY);
        
        app.players[0].tentacles[0].shouldUpdate = true;
    }
}

function mouseEvent(button, mx, my) {
    const app = TentacleApp.instance;

    app.button = button;

    switch (button) {
        case 2: // Right click.
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
    const target = e?.target;

    // Only allow mouse clicks on the canvas.
    if (target?.tagName.toString() !== "CANVAS") {
        console.log("Not Canvas: " + target?.tagName);
        return;
    }

    const button = e?.button;
    e.stopPropagation();
    e.preventDefault();

    if (typeof button !== "number") { 
        console.error("No button found");
        return false;
    }

    return mouseEvent(button, mouseX, mouseY);
}

function mouseDragged(e) { 
    const target = e?.target;

    // Only allow mouse clicks on the canvas.
    if (target?.tagName !== "CANVAS") return;

    const app = TentacleApp.instance;
    if (app.lastMouseX === null) return;

    const player = app.players.length > 0 ? app.players[0] : null;

    if (app.button === 2) { 
        const m = createVector(mouseX, mouseY);
        player.tentacles[0].setTailTipPosition(m, 3);
        return;
    }

    const selectedJoint = player?.tentacles[0].selectedSegment;

    if (!!selectedJoint) {
        console.log("Drag Good.");
        debugMoveJoint(app, selectedJoint);
    }
}

function debugMoveJoint(app, joint) {
    const my = app.height - mouseY;
    const lmy = typeof app.lastMouseY === "number" ? (app.height - app.lastMouseY) : my;

    const dy = my - lmy;
    
    joint.updateAngleBy(-dy / 100);  //tent.head.position.y);

    app.lastMouseX = mouseX;
    app.lastMouseY = mouseY;
}


// Drawing Methods - Always on the bottom of the file

/**
 * Draws the visual representation of where the selectedPlayer is headed to (targeting)
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
    const app = TentacleApp.instance;

    app.update();

    background(0);  // Blank out the background.

    if (!!app.grid) app.grid.drawGrid();

    const result = app.drawPlayers();

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
