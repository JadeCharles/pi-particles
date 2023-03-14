class Player { 
    constructor(options) { 
        if (!options) options = {};

        this.id = options.id || (Math.random() * 9999999999).toString(36);
        this.name = options.name || "Player";
        this.health = options.health || 100;
        this.color = options.color || "#000000";
        this.outlineColor = options.outlineColor || "#FFFFFF33";
        this.position = createVector(options.x || 0, options.y || 0);
        this.size = options.size;

        if (typeof this.size !== "number" || this.size <= 0)
            this.size = 20;
    }

    draw() { 
        // Draw the player
        stroke(this.color);
        strokeWeight(1);
        fill(0);

        const pos = this.position;
        ellipse(pos.x, pos.y, this.size, this.size);
    }
}