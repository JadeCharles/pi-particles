const ANCHOR_TYPE_HEAD = 1;
const ANCHOR_TYPE_TAIL = 2;
const ANCHOR_TYPE_NONE = 0;

class TentacleSegment { 
    static colors = ["green"]; // ["#00820077", "green"];
    
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
        this.speed = 5;
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
        this.color = options.color || TentacleSegment.colors[colorIndex];

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

        this.onTentacleGrabbed = (tp, t) => {
            return 1;
        };
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

        options.color = this.color;
        if (options.contiguous !== false) { 
            const endPos = this.getEndPosition();
            options.x = endPos.x;
            options.y = endPos.y;
        }

        this.nextSegment = new TentacleSegment(this, options);

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

        if (!!this.nextSegment)
            return this.nextSegment.updateAngleBy(angleChange);
        
        return true;
    }

    getEndPosition(updateTipPosition = false) { 
        const pos = this.position.copy(); 
        pos.x += cos(this.angle) * this.length;
        pos.y += sin(this.angle) * this.length;

        if (this.anchorType === 2 || updateTipPosition === true)
            this.tip = pos.copy();

        return pos;
    }

    backPropagate(pos, gravityPercent = 0.25) {
        if (typeof pos?.x !== "number" || typeof pos?.y !== "number")
            throw new Error("Can't set segment target position. Pos is not a valid vector: " + pos);

        const diff = p5.Vector.sub(pos, this.position);
        this.angle = diff.heading();

        if (this.anchorType == 1) { 
            this.tip = null;
        } else {
            diff.mult(-1);
            diff.setMag(this.length);

            if (this.anchorType === 2) {
                //this.tip = pos.copy();
                this.tentacle.reachPosition = pos.copy();
                this.tentacle.endPosition = this.getEndPosition();
            } else if (this.tentacle.state === 0) {
                const gravityAccelerationX = 0;
                const gravityAccelerationY = this.tentacle.head.anchorType === 0 ? 5 : 0.15;  //9.8 * gravityPercent;
                diff.add(gravityAccelerationX, gravityAccelerationY);
            }

            this.position = p5.Vector.add(pos, diff);
            if (this.anchorType === 2) this.tip = this.getEndPosition();
        }

        // Go backwards recursively (tail => head)
        const hasPrev = !!this.prevSegment;
        if (!hasPrev) return this.position;

        if (!this.nextSegment) {
        }

        return this.prevSegment.backPropagate(this.position, gravityPercent);
    }

    /**
     * Propagates from head=>tail; adjusts the position of each segment to match the end position of the previous segment.
     * @returns {p5.Vector} - The position of the end of this segment
     */
    frontPropagate() {
        // Go forwards recursively (head => tail)
        if (!!this.nextSegment) {
            const pos = this.getEndPosition();
            this.nextSegment.position.set(pos);
            return this.angle - this.nextSegment.frontPropagate();
        }
        
        return this.angle;
    }

    updatePhysics(index) { 
        // Do something first...

        // if (!!this.nextSegment)
        //     this.nextSegment.updatePhysics();
        
        // Do something after...
    }

    updatePositions() {
        // if (!this.nextSegment) return;
        // this.nextSegment.updatePositions();
    }

    drawSegment(index, isTail = false, colorOverride = null) {
        const pos = this.getEndPosition();
        const color = colorOverride || (this.color || "#FFFFFF77");

        stroke(color);
        strokeWeight(3);

        line(this.position.x, this.position.y, pos.x, pos.y);

        noStroke();
        fill(color);

        // Default ellipse mode is CENTER, which means it draws from the center of the circle based on diameter (not radius)
        // Switching the ellipseMode(RADIUS) will draw from the center, but use the radius for sizing
        if (this.anchorType === 1) fill("yellow");
        if (!this.prevSegment || this.prevSegment.anchorType !== 1)
            ellipse(this.position.x, this.position.y, 4, 4);

        if (this.anchorType === 2) { 
            if (!!this.tentacle.target) fill("cyan");
        }

        ellipse(pos.x, pos.y, 4, 4);

        if (!!this.nextSegment)
            this.nextSegment.drawSegment(index, false, colorOverride);
    }
}

class Tentacle { 
    constructor(options = {x: 0, y: 0, player: null }) {
        if (typeof options !== "object" || !options) {
            options = {x: 0, y: 0};
        }

        if (!options.player) throw new Error("Tentacle must be created with a player.");

        if (typeof options.x !== "number") options.x = 0;
        if (typeof options.y !== "number") options.y = 0;

        this.id = options.id || Math.floor(Math.random() * 9999999999).toString(36) + (new Date()).getTime().toString();
        this.color = options.color || null;
        this.name = (options.name || this.color) || "Tentacle";
        this.player = options.player;
        this.position = createVector(options.x, options.y);
        this.segmentCount = 0;
        this.totalAngleDiff = 0;
        this.totalLength = 0;
        
        this.span = createVector(0, 0);
        this.state = 0; // 0=Flimsy with gravity, 1=Moving

        this.notes = "";
        this.anchorPosition = null;
        this.tail = null;
        this.head = null;

        this.lastMouseX = null;
        this.lastMouseY = null;

        this.tailTipPosition = null;
        this.target = null;

        this.reachPosition = null;
        this.endPosition = null;
    }

    /**
     * Moves the head/root of the tentacle to correspond to the player's body position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {p5.Vector}
     */
    setRootPosition(x, y) { 
        this.position.x = x;
        this.position.y = y;

        // TODO: Update segments, fixed or otherwise
        if (!!this.head) this.head.position = this.position;

        return this.position;
    }

    /**
     * Sets the tail tip to a target position, then animates to that position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {TentacleSegment} anchorSegment - Segment to anchor to. If null, it assumes the tail
     * @returns the root/head position of the entire tentacle after it recurses from the tail back up to the head/root
     */
    setTargetPosition(x = null, y = null) {
        if (typeof x === "number" && typeof y === "number") {
            // const tile = TentacleApp.instance.grid.getTileAtPosition(x, y);
            // if (!tile) return this.target;
            // x = tile.x;
            // y = tile.y;

            this.target = createVector(x, y);
            this.state = 1;
        }

        return this.target;
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
        this.tailTipPosition = this.tail.getEndPosition();
        this.totalLength += this.tail.length;
        this.totalAngleDiff = this.head.angle - this.tail.angle;

        return this.tail;
    }
    
    getGrabbablePosition(x, y, grabTarget) {
        const tentacleSpeed = this.tail.speed;
        const speedDifference = 1 - (tentacleSpeed / (tentacleSpeed + this.player.speedValue));
        const randomAngle = ((Math.random() * 90.0) - 45.0) / 180.0;
        const randomDistance = Math.random() * this.totalLength * 0.20; // Random range is 20% of the total length of the tentacle
        const grabTargetAngle = grabTarget.heading();

        const newMag = this.totalLength - randomDistance;

        grabTarget.setHeading(grabTargetAngle + randomAngle);
        grabTarget.setMag(newMag);

        const playerPosition = this.player.position;

        x = playerPosition.x + grabTarget.x;
        y = playerPosition.y + grabTarget.y;

        // const tile = this.player.app.grid.getTileAtPosition(x, y);

        // if (!!tile) { 
        //     x = tile.x;
        //     y = tile.y;
        // }

        return createVector(x, y);
    }

    /**
     * Updates the tentacle distances from the target, and sets the tentacles tip target to
     * a target around the target position that's "grabbable"
     * @param {number} x - The x position of the target
     * @param {number} y - The y position of the target
     * @returns {p5.Vector} - The distance between the furthest tail and the player's current position center
     */
    setTentacleTipCourse(x = null, y = null) {
        const courseTarget = this.player.target;

        if (!courseTarget) return null; // throw new Error("Failed to setCourse because player target is null: " + courseTarget);

        // Set furthest tentacle's target to the new position.
        // The rest of the tentacles will move in response to the furthest tentacle's movement.
        if (typeof x !== "number" || typeof y !== "number") { 
            x = courseTarget.x;
            y = courseTarget.y;
        }

        const tentacleTarget = createVector(x, y);
        const grabTargetDistanceVector = p5.Vector.sub(tentacleTarget, this.player.position);
        const oldMag = grabTargetDistanceVector.mag();
        const targetOutofReach = (oldMag > this.totalLength);

        if (targetOutofReach) {
            const newGrabTarget = this.getGrabbablePosition(x, y, grabTargetDistanceVector);

            x = newGrabTarget.x;
            y = newGrabTarget.y;
        }

        // Find a position that is within the reach of the furthest tentacle
        // that is also "grabbable" by the player -- Random for now
        // x -= Math.random() * 35;
        // y -= Math.random() * 35;

        this.setTargetPosition(x, y);

        return null;
    }

    targetHit() { 
        const arrivalResult = (typeof this.onTentacleGrabbed == "function") ?
            this.onTentacleGrabbed(this.tailTipPosition, this.target) : 0;
        
        this.target = null;

        this.player.reSortTentacles();

        if (typeof arrivalResult === "number")
            this.state = arrivalResult;
    }

    updatePhysics(index) {
        if (!this.head) throw new Error("No tentacle to updatePhysics with");

        if (!!this.target) {
            const speed = (this.player.currentSpeedScalar * 1) + (this.speed || 5);
            const diff = p5.Vector.sub(this.target, this.tailTipPosition);
            const d = diff.mag();

            if (d < speed) {
                this.targetHit();
            } else {
                diff.setMag(speed);
                this.tailTipPosition = this.tail.getEndPosition().add(diff);
            }
        }

        // Do the tentacle update and constraints
        const a = this.tail.backPropagate(this.tailTipPosition, true);
        const result = (this.head.anchorType === 1) ? Math.abs(Math.round(this.head.frontPropagate(this.tailTipPosition) * 10)) : null;
        const targetDistance = !!this.target ? p5.Vector.dist(this.target, this.tailTipPosition) : null;

        this.notes = "";

        // Decide on whether to un-grab the current tentacle and target the next step...
        
        if (typeof result === "number") {
            //if (result < 1) this.target = null;

            const closestTentacle = this.player.getClosesTentatleToTarget();
            const backPos = this.tail.getEndPosition();

            // if no tentacles are in front of the player, then we need to make that happen
            // (reach for next target :: setTentacleTipCourse())
            if (!!this.player.target && closestTentacle === this) {
                const closestTip = closestTentacle.tail.tip || closestTentacle.tail.getEndPosition();

                if (!closestTip.isInBetween(this.player.position, this.player.target)) {
                    this.debugColor = "yellow";
                    this.setTentacleTipCourse();
                    return;
                } else this.debugColor = "pink";

            } else { 
                //if (!!this.player.target) closestTentacle.debugColor = "cyan";
            }

            const stretchDistance = p5.Vector.dist(this.head.position, this.tail.tip);

            if (stretchDistance >= this.totalLength - 2) {
                if (!this.player.target) {
                    if (!!this.target && targetDistance >= 1) { // Stretched out and won't hit the target (be cause player is no longer moving), so abort the ik.
                        this.debugColor = null;
                        this.setTargetPosition(backPos.x, backPos.y);
                        this.notes = "X-";
                    }

                    return;
                }

                if (this.player.position.isWithinMidPoint(backPos, this.player.target)) {
                    this.setTentacleTipCourse();
                }
            }
        }

        this.notes += !!this.target ? "Target Dist: " + targetDistance?.toFixed(1) + " (" + result?.toFixed(1) + ")" : "No Target";
        //this.span = p5.Vector.sub(this.player.position, tailTipPosition);

        return 0;
    }

    getPerpendicularLine(p1, p2) {
        
    }
    
    updatePositions(index) { 
        // Prioritize the anchors (in this case, the tail)
        if (!this.head) return false;
        
        // Do we go from head to tail? Or tail to head? (head to tail for now)
        this.head.updatePositions();

        return true;
    }

    drawCirclePosition(pos, color = null, size = 16) { 
        if (!pos) return;
        
        stroke(color || (this.color || "#FF0000"));
        strokeWeight(1);
        noFill();
        ellipse(pos.x, pos.y, size, size);
    }

    drawTentacle(index) { 
        if (!this.head) return { count: 0 }; 

        const endPos = this.tail.getEndPosition();
        const colorOverride = (index === 0) ? (this.debugColor || "orange") : null;

        // Recursively draw all segments
        this.head.drawSegment(index, false, colorOverride);

        if (this.player.debug) { 
            if (!!this.target) { 
                stroke("#FFFFCC22");
                strokeWeight(16);
                line(endPos.x, endPos.y, this.target.x, this.target.y);
                this.drawCirclePosition(this.target);
            }

            if (!!this.reachPosition) {
                this.drawCirclePosition(this.reachPosition, colorOverride || "#FF00FF88");
                this.drawCirclePosition(this.endPosition, null, 12);
            }

            stroke(this.color);
            strokeWeight(1);
            noFill();
            //text("TotalLen: " + (this.totalLength).toString() + ", PosLen: " + (p5.Vector.dist(this.head.position, endPos).toFixed(1)), endPos.x + 20, endPos.y + 20);
            text((this.notes || "").trim(), endPos.x + 20, endPos.y + 20);
        } else { 
            stroke(this.color);
            strokeWeight(1);
            noFill();
        }
        text("" + (this.notes || ""), 10, 50 + (index * 20));


        return {
            count: 0
        };
    }
}