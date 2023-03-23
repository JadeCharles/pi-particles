class Agent { 
    constructor(options) { 
        if (!options) options = {};

        this.id = options.id || (Math.random() * 9999999999).toString(36);
        this.name = options.name || "Agent";
        this.color = options.color || "#000000";
        this.backgroundColor = options.backgroundColor || null;
        this.outlineColor = options.outlineColor || "#FFFFFF33";
        this.position = createVector(options.x || 0, options.y || 0);
        this.size = options.size;

        this.onPositionUpdate = typeof options.onPositionUpdate === "function" ?
            options.onPositionUpdate :
            null;

        this.onStop = typeof options.onStop === "function" ?
            options.onStop :
            null;
        
        if (typeof this.size !== "number" || this.size <= 0)
            this.size = 20;
        
        this._sketchDraw = (x, y, w, h) => {
            strokeWeight(1);

            if (!!this.backgroundColor) fill(this.backgroundColor);
            else noFill();

            ellipse(x, y, w, h);
        };
    }

    draw(index) {
        // Draw the player
        stroke(this.color);
        strokeWeight(1);
        fill(0);

        const pos = this.position;
        this._sketchDraw(pos.x, pos.y, this.size, this.size);
    }
}