class TentacleSegment { 
    static colors = ["red", "white", "blue", "yellow", "green"];
    
    constructor(prevSegment, options = { x: 0, y: 0, angle: 0, length: 20 }) { 
        if (prevSegment !== null && !(prevSegment instanceof TentacleSegment))
            if (typeof prevSegment.x === "number" && typeof prevSegment.y === "number") {
                options = prevSegment;
                prevSegment = null;
            } else throw new Error("prevSegment must be an instance of TentacleSegment: " + JSON.stringify(prevSegment, null, 4));

        if (typeof options !== "object" || !options) { 
            options = { x: 0, y: 0 };
        }

        if (typeof options.x !== "number") options.x = 0;
        if (typeof options.y !== "number") options.y = 0;

        let colorIndex = options.colorIndex;
        if (typeof colorIndex !== "number" || colorIndex < 0 || colorIndex >= TentacleSegment.colors.length)
            colorIndex = 0;
        
        this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + (new Date()).getTime().toString();
        this.name = options.name || "Segment";
        this.prevSegment = prevSegment;
        this.nextSegment = null;
        this.anchorType = 0;    // 0=None/flimsy, 1=Tail, 2=Head, 3=Fixed (same as head)
        
        if (!prevSegment) {
            this.anchorType = 1;
        } else if (!prevSegment.prevSegment) {
            prevSegment.anchorType = 2; // Head
        } else if (prevSegment.anchorType !== 3) { 
            prevSegment.anchorType = 0; // Prev becomes a normal segment
        }

        this.position = createVector(options.x, options.y);
        this.angle = options.angle || 0;
        this.angleVelocity = 0;
        this.color = TentacleSegment.colors[colorIndex];

        this.angleSpring = options.angleSpring || 1.0;
        this.angleDamping = options.angleDamping || 0.9;
        
        this.length = options.length || 20;

        if (typeof this.length !== "number") this.length = 20;
        if (this.length <= 0) this.length = 20;
        if (typeof this.angle !== "number") this.angle = 0;

        this.target = null;
    }
    
    /**
     * Appends a segment to the end of this segment.
     * @param options {object} - Segment options
     */
    appendSegment(options) {
        if (!options) options = {};

        if (options.contiguous !== false) { 
            const endPos = this.getEndPosition();
            options.x = endPos.x;
            options.y = endPos.y;
        }

        this.nextSegment = new TentacleSegment(this, options);

        console.log("Added segment with angle: " + this.angle);

        return this.nextSegment;
    }

    setAngles(angle, prevAngle = 0) { 
        if (typeof angle !== "number") throw new Error("Angle is invalid: " + angle);

        this.setAngle(angle + prevAngle);

        const endPos = this.getEndPosition();

        console.log("Set angles");

        if (!!this.nextSegment) { 
            this.nextSegment.position = endPos;
            return this.nextSegment.setAngles(angle, this.angle);
        }

        return endPos;
    }

    setAngle(angle = 0) { 
        if (typeof angle !== "number") throw new Error("Invalid angle on segment.setAngle()");
        this.angle = angle;

        return this.getEndPosition();
    }

    updateAngleBy(angleChange) { 
        this.angle += angleChange;

        if (!!this.nextSegment) return this.nextSegment.updateAngleBy(angleChange);
        return true;
    }

    getEndPosition() { 
        const pos = createVector(this.position.x, this.position.y); 
        pos.x += cos(this.angle) * this.length;
        pos.y += sin(this.angle) * this.length;

        return pos;
    }

    setTargetPosition(pos, prevAngle) {
        if (typeof pos?.x !== "number" || typeof pos?.y !== "number")
            throw new Error("Can't set segment target position. Pos is not a valid vector: " + pos);

        const diff = p5.Vector.sub(pos, this.position);
        this.angle = diff.heading();

        diff.setMag(this.length);

        this.position = p5.Vector.add(pos, diff.mult(-1));

        // Go backwards recursively
        const hasPrev = !!this.prevSegment;
        
        if (!hasPrev) { 
            return this.position;
        }

        return this.prevSegment.setTargetPosition(this.position, this.angle);
    }

    updatePhysics(index) { 
        // Do something first...

        if (!!this.nextSegment)
            this.nextSegment.updatePhysics();
        
        // Do something after...
    }

    updatePositions() { 
        if (!this.nextSegment) return;
        this.nextSegment.updatePositions();
    }

    drawSegment(index, isTail = false) {
        // Default mode is CENTER, which means it draws from the center of the circle based on diameter (not radius)
        // Switching the ellipseMode(RADIUS) will draw from the center, but use the radius for sizing
        const pos = this.getEndPosition();

        stroke(this.color);

        strokeWeight(1);
        line(this.position.x, this.position.y, pos.x, pos.y);

        noStroke();
        fill(this.color);
        ellipse(pos.x, pos.y, 5, 5);
        ellipse(this.position.x, this.position.y, 5, 5);

        if (!!this.nextSegment)
            this.nextSegment.drawSegment();
    }
}

class Tentacle { 
    constructor(options = {x: 0, y: 0}) {
        if (typeof options !== "object" || !options) {
            options = {x: 0, y: 0};
        }

        if (typeof options.x !== "number") options.x = 0;
        if (typeof options.y !== "number") options.y = 0;

        this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + (new Date()).getTime().toString();
        this.name = options.name || "Tentacle";
        this.position = createVector(options.x, options.y);
        this.segmentCount = 0;
        this.totalAngleDiff = 0;
        this.totalLength = 0;
        this.tail = null;
        this.head = null;

        this.lastMouseX = null;
        this.lastMouseY = null;
    }

    /**
     * Sets the root/head position of the entire tentacle, and updates all segments accordingly.
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {p5.Vector}
     */
    setPosition(x, y) { 
        this.position.x = x;
        this.position.y = y;

        // TODO: Update segments, fixed or otherwise

        return this.position;
    }

    /**
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {TentacleSegment} anchorSegment - Segment to anchor to. If null, it assumes the tail
     * @returns the root/head position of the entire tentacle after it recurses from the tail back up to the head/root
     */
    setTargetPosition(x, y, targeterSegment = null) { 
        if (targeterSegment === null) targeterSegment = this.tail;
        if (targeterSegment === null) { 
            console.warn("No Anchor Segment");
            return;
        }

        const mousePos = createVector(x, y);
        const anchorPos = this.head.position;
        const mouseDistance = mousePos.dist(anchorPos);
        const outOfRange = mouseDistance >= this.totalLength;

        const headAngle = outOfRange ?
            mousePos.sub(anchorPos).heading() :
            null;
        
        if (outOfRange) {
            this.tail.angle = 0;
            return this.head.setAngles(0, headAngle);
        }

        return targeterSegment.setTargetPosition(mousePos, 0);
    }

    appendSegment(options) {
        if (!this.head) {
            this.head = new TentacleSegment(null, options);
            this.tail = this.head;
        } else {
            this.tail = this.tail.appendSegment(options);
        }

        this.segmentCount++;
        this.totalLength += this.tail.length;
        this.totalAngleDiff = this.head.angle - this.tail.angle;

        return this.tail;
    }
    
    updatePhysics(index) {
        if (!!this.head) this.head.updatePhysics();
    }

    updatePositions(index) { 
        // Prioritize the anchors (in this case, the tail)
        if (!this.head) return false;
        
        // Do we go from head to tail? Or tail to head? (head to tail for now)
        this.head.updatePositions();

        return true;
    }

    drawTentacle(index) { 
        if (!this.head) return { count: 0 }; 

        stroke("#CCCCFF09");
        strokeWeight(16);

        const endPos = this.tail.getEndPosition();
        line(this.head.position.x, this.head.position.y, endPos.x, endPos.y);

        this.head.drawSegment();

        return {
            count: 0
        };
    }
}