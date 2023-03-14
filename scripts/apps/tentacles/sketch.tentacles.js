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

function mouseEvent(button, mx, my) {
    const app = TentacleApp.instance;

    switch (button) {
        case 2: // Right click.
            app.lastMouseX = mouseX;
            app.lastMouseY = mouseY;

            if (app.players.length > 0) { 
                const m = createVector(mouseX, mouseY);
                const player = app.players[0];
                const tentacle = player.tentacles[0];
                const withinPos = m.isWithinMidPoint(tentacle.tail.getEndPosition(), player.position);

                console.warn("Mouse: (" + m.x + ", " + m.y + ") is inbetween: " + withinPos.toString());
            }
            break;
        default:
            app.lastMouseX = null;
            app.lastMouseY = null;

            if (app.players.length === 0) { 
                const options = { x: mouseX, y: mouseY, color: "red", name: "Jade" };
                app.createPlayer(options);
            } else {
                const selectedPlayer = app.players[0];  // TODO: Selected player's (multiple)
                selectedPlayer.setTargetDestination(mouseX, mouseY);
            }
            
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

    if (app.selectedIndex >= 0) {

        if (typeof app.lastMouseX === "number") { 
            //const dx = (mouseX - app.lastMouseX) / 100;
            const tent = app.tentacles[app.selectedIndex];
            
            tent.setTargetPosition(mouseX, mouseY);  //tent.head.position.y);

            app.lastMouseX = mouseX;
            app.lastMouseY = mouseY;
        }
    }
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
    else console.warn("No Grid");

    const result = app.drawPlayers();

    // Set pen color to white
    fill(255);

    // Draw the top label/caption
    if (result?.player) { 
        text("Player: " + result.player.name + ": " + (result?.player.notes || ""), 10, 20);
    }
}

// Make sure draw() is the last function in the class for readability.
