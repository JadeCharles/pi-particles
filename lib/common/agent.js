/** 
 * Forgive the naming convention -- This should be "GameObject" or something like that. It sets all the visual properties for an
 * object that can visibly move around the screen
 */
class Agent {
    static defaultDrawer = {
        draw: (position, sender) => {
            // Draw the player
            stroke(sender.color);
            strokeWeight(1);
            fill(0);

            const pos = position;
            const x = pos.x;
            const y = pos.y;
            const w = sender.size;
            const h = sender.size;

            strokeWeight(1);

            if (!!sender.backgroundColor) fill(sender.backgroundColor);
            else noFill();

            ellipse(x, y, w, h);
        },
    };

    constructor(options) {
        if (!options) options = {};

        this.id = options.id || (Math.random() * 9999999999).toString(36);
        this.name = options.name || "Agent";
        this.color = options.color || "#000000";
        this.baseColor = this.color + "";
        this.drawer = options.drawer || Agent.defaultDrawer;

        this.colorQueue = [];
        this.backgroundColor = options.backgroundColor || null;
        this.outlineColor = options.outlineColor || "#FFFFFF33";
        this.vectorHandler = VectorHandler.createP5Handler();
        this.position = this.vectorHandler.createVector(options.x || 0, options.y || 0);
        this.size = options.size;

        this.onPositionUpdate = typeof options.onPositionUpdate === "function" ?
            options.onPositionUpdate :
            null;

        this.onStop = typeof options.onStop === "function" ?
            options.onStop :
            null;
        
        if (typeof this.size !== "number" || this.size <= 0)
            this.size = 20;
    }

    pushColor(color) {
        if (typeof color !== "string" || !color)
            throw new Error("Invalid color: " + color);
        
        this.colorQueue.push(color);
    }

    flipColor() { 
        if (this.colorQueue.length > 0) {
            this.color = this.colorQueue.shift();
            return true;
        }

        this.color = this.baseColor;
        return false;
    }

    draw(index) {
        this.defaultDrawer.draw(this.position, this);
    };
}

if (typeof module === 'undefined') {
    console.log("Can't export. Running Agent in-browser");
} else { 
    module.exports = Agent;
}
