/**
 * @fileoverview Particle Life Sketch - This is the main p5 sketch implementation. It basically does all the graphical stuff using the p5 library.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires ParticleApp.js
 */

let app = null;
let appOptions = { colorCount: 5 };

/**
 * Implementation of the p5.js setup() function. This is called anytime the html page updates (load, resize, etc.).
 */
function setup() {
    if (app === null) {
        app = new ParticleApp(appOptions);
    } else if (typeof app.updateCanvasSize === "function") { 
        app.updateCanvasSize();
    }

    createCanvas(app.width, app.height);    // p5.js function to create the canvas.
}

/**
 * Implementation of the p5.js draw() function.
 * This is called every frame: Updates the physics of all particle interactions, then draws the particles.
 */
function draw() {
    app.updatePhysics();

    background(0);  // Blank out the background.

    const result = app.drawParticles();

    // Set pen color to white
    fill(255);

    // Draw the top label/caption
    text("Count: " + result.count, 10, 20);
    if (result.count <= 0) {
        textAlign(CENTER, CENTER);

        const mx = app.width / 2.0;
        const my = app.height / 2.0 - 200;
        text("Click somewhere on screen to spawn particles", mx, my);
        text("Left Click: 1 Particle", mx, my + 20); 
        text("Right Click: Many Particles", mx, my + 40);
        textAlign(LEFT, CENTER);
    }
}

function mouseEvent(button, mx, my) {
    if (!!app) {
        if (app.ui.isMenuItemOpen()) { 
            app.ui.closeMenus();
            return true;
        }
    }

    switch (button) { 
        case 2: // Right click.
            app.spawnMany(-1, -1, { x: mx, y: my });
            break;
        default:
            app.spawn(-1, { x: mx, y: my });
            break;
        }
    
    return false;
}

/**
 * Handles mouse events, obviously.
 * @param {PointerEvent} e - The mouse event. e.button is 0 for left click, 1 for middle click, 2 for right click.
 * @returns 
 */
function mousePressed(e) {
    if (app.spawnMode !== 0) return;

    const target = e?.target;

    // Only allow mouse clicks on the canvas.
    if (target?.tagName.toString() !== "CANVAS") return;

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
    if (app.spawnMode !== 1) return;
    const target = e?.target;

    // Only allow mouse clicks on the canvas.
    if (target?.tagName !== "CANVAS") return;

    return mouseEvent(0, mouseX, mouseY);
}
