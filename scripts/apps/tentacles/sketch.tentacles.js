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
}

/**
 * Implementation of the p5.js draw() function.
 * This is called every frame: Updates the physics of all particle interactions, then draws the particles.
 */
function draw() {
    const app = TentacleApp.instance;

    app.updatePhysics();

    background(0);  // Blank out the background.

    const result = app.drawTentacles();

    // Set pen color to white
    fill(255);

    // Draw mouse cursor:
    if (typeof app.lastMouseX === "number") { 
        noFill();
        stroke("#FFFFFF88");
        strokeWeight(1);
        ellipse(app.lastMouseX, app.lastMouseY, 32, 32);
        fill("white");
        ellipse(app.lastMouseX, app.lastMouseY, 4, 4);
    }

    // Draw the top label/caption
}

function mouseEvent(button, mx, my) {
    const app = TentacleApp.instance;
    console.log("Mouse ClickX");

    switch (button) {
        case 2: // Right click.
            app.lastMouseX = mouseX;
            app.lastMouseY = mouseY;
            break;
        default:
            app.lastMouseX = null;
            app.lastMouseY = null;

            if (app.tentacles.length === 0)
                app.createTentacle({ x: mx, y: my }, 25, 16);
            
            break;
        }

    if (app?.selectedIndex >= 0) {
        app.tentacles[app.selectedIndex].setTargetPosition(mouseX, mouseY);
    }

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

    const app = TentacleApp.instance;
    if (app?.selectedIndex >= 0) {
        const tent = TentacleApp.instance.tentacles[0];
        let cursor = tent.head;

        while (!!cursor) {
            console.log(cursor.getTypeName() + "(" + cursor.color + "): " + (cursor.angle * 180).toFixed(1) + " (" + (cursor.angle).toFixed(4) + ")");
            cursor = cursor.nextSegment;
        }
        console.warn("---------");
    }

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

    if (app.selectedIndex >= 0) {

        if (typeof app.lastMouseX === "number") { 
            //const dx = (mouseX - app.lastMouseX) / 100;
            const tent = app.tentacles[app.selectedIndex];
            
            tent.setTargetPosition(mouseX, mouseY);  //tent.head.position.y);

            app.lastMouseX = mouseX;
            app.lastMouseY = mouseY;
        }

    }

    //return mouseEvent(0, mouseX, mouseY);
}

function mouseMove(mouseX, mouseY) { 
    console.log("Mousemove: " + mouseX + ", " + mouseY);
}