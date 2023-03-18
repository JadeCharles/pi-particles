class Tentacle { 
    constructor(options = {x: 0, y: 0 }) {
        if (typeof options !== "object" || !options) {
            options = {x: 0, y: 0};
        }

        if (!options.player) throw new Error("Tentacle must be created with a player.");

        this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + (new Date()).getTime().toString();
        this.color = options.color || null;
        this.name = (options.name || this.color) || "Tentacle";
        this.player = options.player;
        this.shouldUpdate = false;
        this.selectedSegment = null;

        if (typeof options.x !== "number") options.x = this.player.position.x;
        if (typeof options.y !== "number") options.y = this.player.position.y;

        /**
         * The position of the tip of the tentacle
         */
        this.position = createVector(options.x, options.y);

        this.segmentCount = 0;
        this.totalLength = 0;
        
        this.state = 0; // 0=Flimsy with gravity, 1=Moving to position
        this.notes = "";

        this.tail = null;
        this.head = null;

        this.lastMouseX = null;
        this.lastMouseY = null;

        /**
         * @type {p5.Vector} - Target position that the tentacle's tip is moving towards
         */
        this.target = null;
    }

    appendSegment(options) {
        if (!options) options = {};
        
        if (!this.head) {
            this.head = new TentacleSegment(this, null, options);
            this.tail = this.head;
        } else {
            const prevAnchorType = this.tail === this.head ? ANCHOR_TYPE_HEAD : ANCHOR_TYPE_NONE;

            this.tail = this.tail.appendSegment(options);
            this.tail.prevSegment.anchorType = prevAnchorType;
        }

        this.segmentCount++;
        this.totalLength += this.tail.length;

        if (this.head === this.tail) {
            console.warn("Append Segment Head:");
            console.log(JSON.stringify(this.head.tip.position, null, 4));
            console.error(JSON.stringify(this.position, null, 4));
        }

        return this.tail;
    }

    /**
     * Sets the target position (this.target) that the tip of the tentacle will move towards.
     * If this.target is null, the tentacle will not be moving (could be in a different state though)
     * @param {p5.Vector} pos - The position that the tip of the tentacle will move towards
     * @returns 
     */
    setTarget(pos) {
        console.log("Set Tentacle Target: " + pos.x.toFixed(2) + ", " + pos.y.toFixed(2));
        this.target = pos;
        
        return true;
    }

    /**
     * Sets all child segments (not the head) to the same angle (default is zero degrees: "straight")
     */
    straigtenTentacleSegments(newGlobalAngle = 0) { 
        let cursor = this.head;
        const ax = this.head.angle;

        while (!!cursor) {
            cursor.angle = ax + newGlobalAngle;
            cursor = cursor.nextSegment;
        }

        this.state = 0;
    }

    /**
     * Attempts to set the very tip of the tentacle to the given position. If not, it will reach as far as it can and completely straighten out.
     * Uses a cursor (not recursion or for/while loop) to loop through all tentacles (starting with the head) and updates each segment accordingly (not recursive).
     * If the pos is too far, it calls straigtenTentacleSegments() to straighten out the tentacle.
     * @param {p5.Vector} pos - The position that the tip of the tentacle will move towards
     * @returns 
     */
    setTailTipPosition(pos) {
        let cursor = this.tail;

        // Check to see if it's out of reach.
        const tentacleLength = this.totalLength;
        const distance = p5.Vector.dist(pos, this.head.base.position);

        if (distance > tentacleLength) {
            this.head.angle = p5.Vector.sub(pos, this.head.base.position).heading();
            this.straigtenTentacleSegments();
            return;
        }

        while (!!cursor) {
            cursor.tip.position.set(pos);

            const dir = p5.Vector.sub(cursor.tip.position, cursor.base.position);
            cursor.angle = dir.heading();

            pos = pos.sub(cursor.calculateAngle());

            cursor = cursor.prevSegment;
        }
    };

    /**
     * Sets the color of the tentacle
     * @param {p5.Vector} locationPos - The position of the target that the tentacle is trying to grab. It searches around this area for a suitable tile that has grabability :)
     * @returns {p5.Vector|null} - Null if no suitable tile was found, otherwise a p5.Vector with the position of the tile that was found (usually then set as this.target)
     */
    findGrabbablePosition(locationPos) {
        // const tentacleSpeed = this.tail.speed;
        // const speedDifference = 1 - (tentacleSpeed / (tentacleSpeed + this.player.speed));

        return locationPos.copy();
    }

    /**
     * Re-evaluates
     * @param {number} x - The x position of the target
     * @param {number} y - The y position of the target
     * @returns {p5.Vector} - The distance between the furthest tail and the player's current position center
     */
    courseCorrect(newCoursePosition) {

        // TODO: Find a position that is within the reach of the furthest tentacle

        // that is also "grabbable" by the player -- Random for now
        // x -= Math.random() * 35;
        // y -= Math.random() * 35;

        this.setTarget(newCoursePosition);

        return newCoursePosition;
    }

    targetAcquired() { 
        const arrivalResult = (typeof this.onTentacleGrabbed == "function") ?
            this.onTentacleGrabbed(this.tailTipPosition, this.target) : 0;
        
        this.target = null;

        this.player.reSortTentacles();

        if (typeof arrivalResult === "number")
            this.state = arrivalResult;
    }

    getStretchDistance() {
        if (!this.head?.position || !this.tail?.tipPosition) return 0;
        return p5.Vector.dist(this.head.position, this.tail.tipPosition);
    }

    updatePhysics(index) {
        if (!this.head) throw new Error("No tentacle to updatePhysics with");

        let movementForces = createVector(0, 0);

        this.head.updatePhysics(index);

        return movementForces;
    }

    /**
     * Updates the coordinates of the tentacle head base after all forces have been acted upon and stored, now update the positions based on them
     * @param {number} index - The index of the tentacle in the player's tentacle array
     * @returns {boolean}
     */
    updatePositions(index) { 

        // Prioritize the anchors (in this case, the tail)
        if (!this.head) return false;
        
        this.head.base.position.set(this.player.position);
        this.head.updatePositions();
        
        return true;
    }

    drawTentacle(index) {
        const summary = { count: 0 };
        if (!this.head) return summary; 

        const colorOverride = null;

        // Recursively draw all segments
        this.head.draw(0, colorOverride);

        if (this.debug) {
            if (!!this.target) { 
                TentacleApp.instance?.drawCircleAt(this.target, "#00FF0088", 12, "Target");
            }
            //
        }

        text("" + (this.notes || ""), 10, 50 + (index * 20));


        return {
            count: 0
        };
    }

    
}