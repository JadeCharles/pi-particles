const ANCHOR_TYPE_HEAD = 1;
const ANCHOR_TYPE_TAIL = 2;
const ANCHOR_TYPE_NONE = 0;
const DEFAULT_SEGMENT_LENGTH = 20;
const DEFAULT_SEGMENT_MAX_VELOCITY = 10;
const DEFAULT_SEGMENT_MASS = 1;

const G = -9.8 * (1);

class TentacleSegment { 
    static colors = ["green"]; // ["#00820077", "green"];
    
    /**
     * 
     * @param {Tentacle} tentacle - The tentacle that this segment is a part of
     * @param {TentacleSegment} prevSegment - The previous segment in the tentacle
     * @param {number} length - The length of this segment
     */
    constructor(tentacle, prevSegment = null, options = null) { 
        // Check to see if the params were switched
        if (tentacle === null || !(tentacle instanceof Tentacle))
            throw new Error("tentacle must be an instance of Tentacle: " + JSON.stringify(tentacle, null, 4));

        if (prevSegment !== null && !(prevSegment instanceof TentacleSegment))
            throw new Error("prevSegment must be an instance of TentacleSegment: " + JSON.stringify(prevSegment, null, 4));

        if (options === null || typeof options !== "object")
            options = {};

        // Identifiers
        this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + (new Date()).getTime().toString();
        this.anchorType = typeof options.anchorType === "number" ? options.anchorType : ANCHOR_TYPE_TAIL;

        // Visual Properties
        this.color = options.color || "yellow";

        // Physical Properties
        this.length = options.length;
        if (typeof this.length !== "number") this.length = DEFAULT_SEGMENT_LENGTH;
        
        this.angle = options.angle || (options.localAngle || 0);
        if (typeof this.angle !== "number") this.angle = 0;
        this.localAngle = this.angle - (prevSegment?.angle || 0);

        this.angleVelocity = 0;
        this.angleAcceleration = 0;

        this.angleSpring = options.angleSpring;
        if (typeof this.angleSpring !== "number") this.angleSpring = 0.0;

        this.angleDamping = options.angleDamping;
        if (typeof this.angleDamping !== "number") this.angleDamping = 0.9;
        
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxVelocity = options.maxVelocity;
        this.mass = options.mass;

        if (typeof this.maxVelocity !== "number") this.maxVelocity = DEFAULT_SEGMENT_MAX_VELOCITY;
        if (typeof this.mass !== "number") this.mass = DEFAULT_SEGMENT_MASS;

        // Geometric Properties
        const basePos = !!prevSegment ? prevSegment.tip.position : tentacle.position;
        this.base = new TentacleSegmentEndpoint(basePos.copy());
        this.tip = new TentacleSegmentEndpoint(basePos.copy().add(createVector(this.length, 0)));

        // References
        this.tentacle = tentacle;
        this.prevSegment = prevSegment;
        this.nextSegment = null;
        this.totalLength = (prevSegment?.totalLength || 0) + this.length; // Length from the head of the entire tentacle to this end position
        
        if (!prevSegment) this.anchorType = ANCHOR_TYPE_HEAD;    // Head/anchor base
        else { 
            this.index = prevSegment.index + 1;
            if (!prevSegment.prevSegment) prevSegment.anchorType = ANCHOR_TYPE_HEAD;
            else prevSegment.anchorType = ANCHOR_TYPE_NONE;
        }

        if (typeof this.length !== "number") this.length = 20;
        if (this.length <= 0) this.length = 20;

        this.onTentacleGrabbed = (tp, t) => {
            return 1;
        };

        this.updateTipAngles(0, true);
    }

    /**
     * Updates the angles of the two endpoints of this segment (base and tip) - this.angle MUST be set before calling this method.
     * @param {number} positionAnchor - 0 = Base: Position is updated relative to the base endpoint, 1 = Tip: Position is updated relative to the tip endpoint
     */
    updateTipAngles(positionAnchor = 0, updatePositions = true) { 
        this.base.angle = this.angle;
        //this.tip.angle = this.angle + Math.PI;
        this.tip.angle = -this.angle;

        if (!updatePositions) return;

        const dir = this.calculateAngle();  //createVector(len * Math.cos(a), len * Math.sin(a));

        if (positionAnchor === 0) {
            this.tip.position.set(this.base.position.copy().add(dir));
        } else {
            const revPos = p5.Vector.sub(this.tip.position, dir);
            this.base.position.set(revPos);
        }
    }
    
    calculateAngle() {
        const a = this.angle;
        return createVector(this.length * Math.cos(a), this.length * Math.sin(a));
    }

    /**
     * Calculates the angle of the segment from the base to the tip.
     * @returns {p5.Vector} - The vector from the base of this segment to the tip of this segment
     */
    calculateClamAngle() {
        const a = -this.angle;
        const len = -this.length;
        return createVector(len * Math.cos(a), len * Math.sin(a));
    }

    /**
     * Appends a segment to the end of this segment.
     * @param options {object} - Segment options
     */
    appendSegment(options = {}) {
        if (!options) options = {};
        if (!!options.color) options.color = this.color;

        this.nextSegment = new TentacleSegment(this.tentacle, this, options);
        
        return this.nextSegment;
    }

    getLocalAngle() { 
        return this.angle - (this.prevSegment?.angle || 0);
    }

    updateAngleBy(angleDelta) { 
        if (typeof angleDelta !== "number") return;

        this.angle += angleDelta;
        this.nextSegment?.updateAngleBy(angleDelta);
    }

    /**
     * Do all calculations (update forces and angles) for this segment and its children. Update positions after this
     */
    updatePhysics() { 
        
        if (!!this.nextSegment) this.nextSegment.updatePhysics();
    }

    /**
     * This sets (recursively) the base of the current segment to the tip of the previous segment (Only position values are updated -- No angles or forces)
     * @param {number} parentAngleDiff - The difference in angle between this segment and its parent
     */
    updatePositions(parentAngleDiff = 0) {
        if (!!this.prevSegment) { 
            this.base.position.set(this.prevSegment.tip.position);
        }

        this.updateTipAngles(0, true);
        if (!!this.nextSegment) this.nextSegment.updatePositions(parentAngleDiff);
    }

    /**
     * This sets (recursively, starting from tail going back down to head) the base of the current segment to the tip of the previous segment (Only position values are updated -- No angles or forces)
     * @param {number} parentAngleDiff - The difference in angle between this segment and its parent
     */
    updatePositionsBackward(parentAngleDiff = 0) {
        if (!!this.nextSegment) { 
            this.tip.position.set(this.nextSegment.base.position);
        }

        console.log("Updating Positions Backward with Angle: " + (this.angle * DEGREE_RATIO).toFixed(1));
        this.updateTipAngles(1, true);
        if (!!this.prevSegment) this.prevSegment.updatePositionsBackward(parentAngleDiff);
    }
    
    drawLabels(distance = 170) {
        const app = TentacleApp.instance;
        const isSelected = this.tentacle.selectedSegment === this;
        strokeWeight(1);

        if (app.debugLevel <= 0) {
            if (isSelected) app.drawCircleAt(this.base.position, "red", 24, 1);
            return;
        }

        const tipPos = this.tip.position;
        const basePos = this.base.position;

        const m = basePos.y < this.tentacle.player.position.y ? -1 : 1;

        const baseLabelPos = basePos.copy().add(createVector(0, distance * m)); //.setHeading(a));
        const tipLabelPos = tipPos.copy().add(createVector(0, distance * m)); //.setHeading(a + offset));

        let red = 255;
        let green = 255;
        let blue = 150;
        let alpha = isSelected ? 255 : 50;

        if (this.tentacle.head === this) {
            red -= 100;
        } else if (this.tentacle.tail === this) {
            green -= 100;
        }

        let colorName = "rgba(" + red + ", " + green + ", " + blue + ", " + (alpha / 255).toFixed(2) + ")";

        stroke(red, green, blue, alpha - 30);
        fill(red, green, blue, alpha - 30);

        line(basePos.x, basePos.y, baseLabelPos.x, baseLabelPos.y);
        line(baseLabelPos.x + 1, baseLabelPos.y, baseLabelPos.x + 5, baseLabelPos.y);
        text(this.base.getDescription(), baseLabelPos.x + 10, baseLabelPos.y);

        stroke(red, green, blue, alpha);
        fill(red, green, blue, alpha);

        line(tipPos.x, tipPos.y, tipLabelPos.x, tipLabelPos.y);
        line(tipLabelPos.x + 1, tipLabelPos.y, tipLabelPos.x + 5, tipLabelPos.y);
        text(this.tip.getDescription(), tipLabelPos.x + 10, tipLabelPos.y);

        noStroke();
        
        colorName = "rgba(255, 255, 255, " + ((alpha - 30) / 255).toFixed(2) + ")";
        app.drawCircleAt(tipPos, colorName, this.length);

        colorName = "rgba(" + red + ", " + green + ", " + blue + ", " + ((alpha - 30) / 255).toFixed(2) + ")";
        app.drawCircleAt(basePos, colorName, this.length);

        colorName = "rgba(255, 255, 255, " + (Math.max(0, alpha - 80) / 255).toFixed(2) + ")";
        stroke(colorName);
        line(tipPos.x, tipPos.y, tipPos.x + this.length/2, tipPos.y)

        colorName = "rgba(255, 255, 255, " + (Math.max(0, alpha - 80) / 255).toFixed(2) + ")";
        stroke(colorName);
        line(basePos.x, basePos.y, basePos.x + this.length/2, basePos.y)

        if (isSelected) { 
            strokeWeight(16);
            stroke("rgba(255, 255, 255, 0.25)");
            let revPos = p5.Vector.sub(tipPos, this.calculateAngle());
            line(revPos.x, revPos.y, tipPos.x, tipPos.y);


            if (app.debugLevel > 1) {
                // Note this: The following turns the tip into a knee, and the line drawn is the tibia
                stroke("rgba(0, 255, 255, 0.5)");    // Set color to cyan transluscent
                const tibiaPos = p5.Vector.sub(tipPos, this.calculateClamAngle());    // Get thet position for the tip of the "tibia"
                line(tipPos.x, tipPos.y, tibiaPos.x, tibiaPos.y);    // Draw the line from the "knee" (this.tip) to the tip of the "tibia" (new tibiaPos)
            }

            app.drawCircleAt(this.base.position, "red", 24, 1);
            app.drawCircleAt(this.tip.position, "red", 12, 3);
        }
    }

    draw(index, colorOverride = null) {
        const tipPosition = this.tip.position;

        if (!tipPosition) throw new Error("Failed to draw segment. No tipPosition was set.");

        const color = colorOverride || (this.color || "#999999");

        stroke(color);
        strokeWeight(3);

        const basePos = this.base.position;
        const tipPos = this.tip.position;
        
        line(basePos.x, basePos.y, tipPos.x, tipPos.y);

        // Dot/ball joint
        ellipse(tipPosition.x, tipPosition.y, 6, 6);

        if (!!this.nextSegment)
            this.nextSegment.draw(index + 1, false, colorOverride);
        
        this.drawLabels();
    }


}