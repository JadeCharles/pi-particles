const ANCHOR_TYPE_HEAD = 1;
const ANCHOR_TYPE_TAIL = 2;
const ANCHOR_TYPE_NONE = 0;

class TentacleSegment { 
    static colors = ["#00820077", "green"];
    
    constructor(prevSegment, options = { x: 0, y: 0, angle: 0, length: 20, tentacle: null }) { 
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
        this.prevSegment = prevSegment;
        this.tentacle = options.tentacle || (prevSegment?.tentacle || null);
        this.nextSegment = null;
        this.anchorType = ANCHOR_TYPE_TAIL;    // 0=None/flimsy, 1=Fixed at this.position, 2=Fixed at this.getEndPosition()
        this.flag = 0;
        this.index = 0;

        const mass = 1.0;
        
        this.av = 0;
        this.aa = -9.8 * mass;

        if (!prevSegment) this.anchorType = ANCHOR_TYPE_HEAD;    // Head/anchor base
        else { 
            this.index = prevSegment.index + 1;
            if (!prevSegment.prevSegment) prevSegment.anchorType = ANCHOR_TYPE_HEAD;
            else prevSegment.anchorType = ANCHOR_TYPE_NONE;
        }

        this.position = createVector(options.x, options.y);
        this.angle = options.angle || 0;
        this.angleVelocity = 0;
        this.color = TentacleSegment.colors[colorIndex];

        this.angleSpring = options.angleSpring || 1.0;
        this.angleDamping = options.angleDamping || 0.9;
        
        this.length = options.length || 20;
        this.totalLength = (prevSegment?.totalLength || 0) + this.length;   // Length from the head to this end position

        if (typeof this.length !== "number") this.length = 20;
        if (this.length <= 0) this.length = 20;
        if (typeof this.angle !== "number") this.angle = 0;

        this.name = options.name || ("Segment-" + this.index);

        this.tip = null;
        this.target = null;
    }
    
    getTypeName() { 
        if (this.anchorType === 2) return "Tail";
        if (this.anchorType === 1) return "Head";
        return this.name;
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
        const pos = this.position.copy(); 
        pos.x += cos(this.angle) * this.length;
        pos.y += sin(this.angle) * this.length;

        return pos;
    }

    setTargetPosition(pos, gravityPercent = 0.25) {
        if (typeof pos?.x !== "number" || typeof pos?.y !== "number")
            throw new Error("Can't set segment target position. Pos is not a valid vector: " + pos);

        const diff = p5.Vector.sub(pos, this.position);
        this.angle = diff.heading();

        if (this.anchorType !== 1) {
            diff.mult(-1);
            diff.setMag(this.length);

            if (this.anchorType === 2) {
                this.tip = pos.copy();
            }
            else { 
                const gravityAccelerationX = 0;
                const gravityAccelerationY = this.tentacle.head.anchorType === 0 ? 5 : 0.15;  //9.8 * gravityPercent;
                diff.add(gravityAccelerationX, gravityAccelerationY);
            }

            this.position = p5.Vector.add(pos, diff);
        } else {
            this.tip = null;
        }

        // Go backwards recursively (tail => head)
        const hasPrev = !!this.prevSegment;
        if (!hasPrev) return this.position;

        return this.prevSegment.setTargetPosition(this.position, gravityPercent);
    }

    frontPropagate() {
        // Go forwards recursively (head => tail)
        if (!!this.nextSegment) { 
            const pos = this.getEndPosition();
            this.nextSegment.position.set(pos);
            return this.nextSegment.frontPropagate();
        }
        
        return this.position;
    }

    backPropagateToLowestGravityPoint() {
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
        const pos = this.getEndPosition();
        const color = this.color || "white";

        stroke(color);
        strokeWeight(1);

        line(this.position.x, this.position.y, pos.x, pos.y);

        noStroke();
        fill(color);

        // Default ellipse mode is CENTER, which means it draws from the center of the circle based on diameter (not radius)
        // Switching the ellipseMode(RADIUS) will draw from the center, but use the radius for sizing
        if (this.anchorType === 1) fill("cyan");
        ellipse(this.position.x, this.position.y, 4, 4);

        if (this.anchorType === 2) fill("cyan");
        ellipse(pos.x, pos.y, 4, 4);

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

        this.anchorPosition = null;
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
    setTargetPosition(x = null, y = null, targeterSegment = null) { 
        if (targeterSegment === null) targeterSegment = this.tail;
        if (targeterSegment === null) { 
            console.warn("No Anchor Segment");
            return;
        }

        if (typeof x === "number" && typeof y === "number")
            this.targetPosition = createVector(x, y);
        
        const a = targeterSegment.setTargetPosition(this.targetPosition, true);
        if (this.head.anchorType === 1) this.head.frontPropagate(this.targetPosition);

        return a;
    }

    appendSegment(options) {
        if (!options) options = {};
        if (!options.tentacle) options.tentacle = this;
        
        if (!this.head) {
            this.head = new TentacleSegment(null, options);
            this.tail = this.head;
        } else {
            this.tail = this.tail.appendSegment(options);
        }

        this.segmentCount++;
        this.targetPosition = this.tail.getEndPosition();
        this.totalLength += this.tail.length;
        this.totalAngleDiff = this.head.angle - this.tail.angle;

        return this.tail;
    }
    
    updatePhysics(index) {
        if (!!this.head) {
            this.head.updatePhysics();
            this.setTargetPosition();
        }
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