/**
 * @fileoverview Particle Life Sketch - This is the main p5 sketch implementation. It basically does all the graphical stuff using the p5 library.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires app.neuro.js
 */

let appOptions = { colorCount: 5 };

/**
 * Implementation of the p5.js setup() function. This is called anytime the html page updates (load, resize, etc.).
 */
function setup() {
    const app = NeuroApp.instance;
    
    createCanvas(app.width, app.height);    // p5.js function to create the canvas.

    console.log("Setup Good: " + app.width + " x " + app.height);
    app.mounted = true;
}

function handleRightClick(mouseX, mouseY) {
    const app = NeuroApp.instance;

    if (!app.isSetup) app.setup();
    //
}

function handleLeftClick(mouseX, mouseY) {
    const app = NeuroApp.instance;
    const n = app.getNeuronAt(mouseX, mouseY);

    if (!!n) {
        if (!(app.selectedKeys["capslock"] || app.selectedKeys["shift"]))
            app.clearSelectedNeurons();

        if (n.select()) {
            app.selectedNeurons.push(n);
        } else {
            const idx = app.selectedNeurons.indexOf(n);
            if (idx >= 0) app.selectedNeurons.splice(idx, 1);
        }

        return;
    }

    app.clearSelectedNeurons();

}

function mouseEvent(button, mx, my) {
    const app = NeuroApp.instance;

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
    if (!NeuroApp.instance.isCanvasClick(e)) {
        return true;
    }

    return mouseEvent(NeuroApp.instance.button, mouseX, mouseY);
}

function mouseDragged(e) { 
    const app = NeuroApp.instance;

    // Only allow mouse clicks on the canvas.
    if (!app.isCanvasClick(e))
        return;

    if (app.lastMouseX === null) return;

    if (app.button === 2) { 
        // Right drag
        return;
    }

    // Left drag
    const ns = app.selectedNeurons;
    if (ns.length > 0) {
        for (let i = 0; i < ns.length; i++) { 
            const n = ns[i];
            n.agent.position.x += mouseX - app.lastMouseX;
            n.agent.position.y += mouseY - app.lastMouseY;
        }
    }

    app.lastMouseX = mouseX;
    app.lastMouseY = mouseY;

}

// Drawing Methods - Always on the bottom of the file

/**
 * Implementation of the p5.js draw() function.
 * This is called every frame: Updates the physics of all particle interactions, then draws the particles.
 */
function draw() {
    const app = NeuroApp.instance;

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
