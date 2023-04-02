/**
 * @fileoverview Neuro Sketch - This is the main p5 sketch implementation. It basically does all the graphical stuff using the p5 library.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires app.visual-neuro.js
 */


/** Implementation of the p5.js setup() function. This is called anytime the html page updates (load, resize, etc.). */

/** Sets up the p5 rendering engine and requisite neural network properties */
function setup() {
    const app = NeuroApp.instance;
    
    createCanvas(app.width, app.height);    // p5.js function to create the canvas.

    console.log("Setup Good: " + app.width + " x " + app.height);
    app.mounted = true;
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

    const app = NeuroApp.instance;
    const button = e.button;
    
    app.button = button;

    switch (button) {
        case 2: // Right click.
            this.handleRightClick(mouseX, mouseY);
            break;
        default:
            this.handleLeftClick(mouseX, mouseY);
            break;
    }

    // Keep track of this so we can easliy get the deltas
    app.lastMouseX = mouseX;
    app.lastMouseY = mouseY;
}

/** p5 override implementation */
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

/**
 * p5 override implementation of the draw() function.
 * This is called every frame:
 *  1. Updates the physics of all particle interactions
 *  2. Then draws the neurons, connectors, etc
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

/** -- Done with p5 overrides --- */

function handleRightClick(mouseX, mouseY) {
    // Right click
    console.log("Right click. Cool, man.");
}

/** Select a neuron by clicking on it - Which fires a "runner" */
function handleLeftClick(mouseX, mouseY) {
    const app = NeuroApp.instance;
    const n = app.getNeuronAt(mouseX, mouseY);

    if (!!n) {
        const isMultipleSelection = app.selectedKeys["capslock"] || app.selectedKeys["shift"];
        
        if (!isMultipleSelection)
            app.clearSelectedNeurons();

        if (n.select()) {
            app.selectedNeurons.push(n);
            const runnerTarget = app.network.outputLayer.neurons[0];
            app.network.createRunner(n, runnerTarget, 15);
        } else {
            const idx = app.selectedNeurons.indexOf(n);
            if (idx >= 0) app.selectedNeurons.splice(idx, 1);
        }

        return;
    }

    app.clearSelectedNeurons();
}
