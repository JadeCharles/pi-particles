const NINETY_DEGREES = Math.PI / 2;
const DEGREE_RATIO = 57.2958;

class TentacleSegmentEndpoint { 
    constructor(position = null, options = {}) {
        if (!options) options = {};

        if (!position || !(position instanceof p5.Vector))
            throw new Error("TentacleSegmentEndpoint must be created with a position (p5.Vector) as its first parameter");

        this.position = position;
        this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + (new Date()).getTime().toString();
        this.mass = typeof options.mass === "number" ? options.mass : 0.5;
        this.angle = typeof options.angle === "number" ? options.angle : 0;
        this.label = options.label || "";
        this.forces = createVector(0, 0);   // Not used for now
    }

    getDescription(showLabelIfNotEmpty = true, newLine = "\n") {
        if (showLabelIfNotEmpty && !!this.label && this.length > 0) return this.label;
        return `Pos (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)})\nAngle: ${(this.angle * DEGREE_RATIO).toFixed(1)}\nMass: ${this.mass.toFixed(2)}`;
    }

    applyForce(force) { 
        this.position.add(force);
        return force.copy();
    }
}
