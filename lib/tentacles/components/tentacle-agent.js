class TentacleAgent extends Agent { 
    constructor(options) { 
        super(options);
        if (!options) options = {};

        this.selectedIndex = -1;
        this.health = options.health || 100;
        this.tentacles = options.tentacles || [];
        this.backgroundColor = typeof options.backgroundColor === "string" || options.backgroundColor === null ?
            options.backgroundColor :
            "black";
        
        this.name = options.name || "Tentacle Agent";
        this.color = options.color || "white";
        this.app = options.app || null;
        this.notes = null;
        this.debugLevel = 0;

        this.speed = (options.speed || options.speed) || 1.5;
        this.accelerationScalar = (options.acceleration || options.accelerationValue) || 0.1;
        this.acceleration = createVector(0, 0); // Acceleration vector (x/y direction)

        this.currentSpeed = createVector(0, 0);    // Current speed vector (x/y direction)
        this.currentScalarSpeed = 0;  // Current speed as a decimal value

        this.targetSpeed = createVector(0, 0);  // Max speed vector (x/y direction)
        this.targetScalarSpeed = 0; // Max speed as a decimal value

        this.target = null; // The target the agent is moving towards

        const pos = this.position;
        const tentacleSegmentLength = options.tentacleSegmentLength || 24;
        const tentacleSegmentCount = options.tentacleSegmentCount || (options.tentacleSegmentCount || 10);
        const tentacleCount = options.tentacleCount || 0;

        for (let i = 0; i < tentacleCount; i++) {
            const po = { x: pos.x, y: pos.y, angle: 0, agent: this, name: this.name + " Tentacle " + i };
            const color = this.color;
            const t = this.createTentacle(po, tentacleSegmentCount, tentacleSegmentLength, color);
        }

        this.tentacleCount = tentacleCount;
        this.setRestingPose(pos.x, pos.y);
    }

    /**
     * 
     * @param {object} pos - Position object { x: number, y: number }
     * @param {number} segmentCount - Number of tentacle segments (the higher the number, the more fluid the tentacle)
     * @param {number} segmentLength - Length of each segment (the smaller the number, the more fluid the tentacle)
     * @returns 
     */
    createTentacle(pos, segmentCount = 5, segmentLength = 50, color = null) { 
        if (this.needsEventListeners) this.addEventListeners();
        
        if (!pos) pos = { x: this.position.x, y: this.position.y };

        const tentacle = new Tentacle({ agent: this, color: color });
        const colorCount = TentacleSegment.colors.length;

        const tailIndex = segmentCount - 1;
        const intervalRadians = (Math.PI / 3);
        let cursor = null;

        for (let i = 0; i < segmentCount; i++) {
            const m = i % 2 === 0 ? -1 : 1;
            // const randomAngle = (Math.random() * (Math.PI / 2)) * m;

            const angle = (i === 0 ? Math.PI / 6 : intervalRadians) * m;

            const segmentOptions = {
                x: pos.x,
                y: pos.y,
                angle: angle,
                length: segmentLength,
                color: color,
                colorIndex: i % colorCount
            };

            cursor = tentacle.appendSegment(segmentOptions);
        }

        tentacle.head.id = "head-" + this.tentacles.length.toString();
        tentacle.tail.id = "tail-" + this.tentacles.length.toString();

        this.tentacles.push(tentacle);
        if (this.selectedIndex < 0) this.selectedIndex = 0;

        this.tentacleCount = this.tentacles.length;
        return tentacle;
    }

    setRestingPose(x, y, offset = null) {
        for (let i = 0; i < this.tentacles.length; i++) {

            let dx = (typeof offset === "number") ? offset : this.tentacles[i].totalLength;
            let dy = dx;

            const mod = i % 4;
            switch (mod) { 
                case 0:
                    dx = -dx;
                    break;
                case 2:
                    dx = -dx;
                    dy = -dy;
                    break;
                case 3:
                    dy = -dy;
                    break;
            }

            const xx = Math.max(x + dx * 0.7, -1);
            const yy = Math.max(y + dy * 0.7, -1);

            this.tentacles[i].setTarget(createVector(xx, yy));
        }
    }

    resetState() {
        for(let i = 0; i < this.tentacleCount; i++) {
            this.tentacles[i].resetState();
        }
    }

    setTargetDestination(targetPos) {
        this.target = targetPos;
        console.log("Set Target: " + this.target);

        this.targetScalarSpeed = this.speed;
        this.targetSpeed = p5.Vector.sub(this.target, this.position);
        this.acceleration = this.targetSpeed.copy().setMag(this.accelerationScalar);  // Set to max acceleration

        this.targetSpeed.setMag(this.targetScalarSpeed);    // Set to max speed
        this.accelerate();

        //this.updateSpeed(Math.max(this.currentScalarSpeed, 0.00001)); // Set to current speed (if it currently has a speed), or 0.00001 (if it's stopped, which is basically zero)

        this.reSortTentacles();

        return this.target;
    }

    /**
     * Gets the tentacle that has a tip that is the closest to the last calculated agent target position,
     * which is the last tentacle in the array after reSortTentacles() is called.
     * @returns {Tentacle} The tentacle that is closest to the target, which is to say: the tentacle that is sorted last in the array after reSortTentacles() is called
     */
    getClosestTentatleToTarget() {
        return this.tentacles[this.tentacleCount - 1];
    }

    /**
     * Gets the tentacle that has a tip that is the farthest from the last calculated agent target position,
     * which is the first tentacle in the array after reSortTentacles() is called.
     * @returns {Tentacle} The tentacle that is farthest from the target, which is to say: the tentacle that is sorted last in the array after reSortTentacles() is called
     */
    getFarthestTentatleToTarget() {
        return this.tentacles[0];
    }

    reSortTentacles() {
        if (!this.target) return this.tentacles;

        this.tentacles.sort((a, b) => {
            const aDist = (a.tail.tip || a.tail.getEndPosition()).dist(this.target);
            const bDist = (b.tail.tip || b.tail.getEndPosition()).dist(this.target);

            return (bDist - aDist);
        });

        return this.tentacles;
    }

    getSelectedTentacle() { 
        return this.tentacles[this.selectedIndex];
    }

    onArrival(clearTarget = true) { 
        if (clearTarget === true) { 
            this.targetSpeed = createVector(0, 0);
            this.targetScalarSpeed = 0;
            this.target = null;

            this.acceleration = createVector(0, 0);

            this.currentSpeed = createVector(0, 0);
            this.currentScalarSpeed = 0;

            setTimeout(() => {
                if (!this.target)
                    this.setRestingPose(this.position.x, this.position.y);
            }, 800);
        }

        // Current speed
        this.updateSpeed(Math.max(this.currentScalarSpeed, 0.00001));
        if (typeof this.onStop === "function") this.onStop();
    }

    update(index, isAuto = false) { 
        let i = 0;
        const tentacleCount = this.tentacles.length;
        const tentacleForces = createVector(0, 0);
        
        while (i < tentacleCount) {
            const forces = this.tentacles[i].updatePhysics(i, isAuto);
            tentacleForces.add(forces);
            i++;
        }

        return this.updatePositions(tentacleForces);
    }

    updatePositions(tentacleForces) {
        const tentacleCount = this.tentacles.length;
        
        if (this.currentScalarSpeed < this.targetScalarSpeed) { 
            this.accelerate();
        }
        
        // TODO: Some Newtonian physics here with tentacleForces
        let posUpdate = false;
        let hasArrived = false;

        if (!!this.target) {
            this.position.add(this.currentSpeed);

            const diff = p5.Vector.sub(this.target, this.position);
            const distance = diff.mag();
            const minDist = Math.max(1, this.currentScalarSpeed);

            posUpdate = true;
            hasArrived = (distance <= minDist);
        }

        let i = 0;

        // Set the head position of each tentacle to the position of the agent' position
        // The rest of the segments will auto configure themselves
        while(i < tentacleCount) {
            this.tentacles[i].updatePositions(i);
            i++;
        }

        if (posUpdate && typeof this.onPositionUpdate === "function")
            this.onPositionUpdate();

        if (hasArrived) { 
            console.error("Agent Arrived");
            this.onArrival();
        }

        return tentacleCount;
    }

    accelerate() {
        if (typeof this.currentScalarSpeed !== "number") throw new Error("Can't accelerate. CurrentScalarSpeed is no good: " + this.currentScalarSpeed);
        if (typeof this.accelerationScalar !== "number" || this.accelerationScalar <= 0)
            throw new Error("Can't accelerate. AccelerationScalar is no good: " + this.accelerationScalar);

        return this.updateSpeed(this.currentScalarSpeed + this.accelerationScalar);
    }

    updateSpeed(speedScalar) {
        if (!this.target) return;
        if (typeof speedScalar !== "number") throw new Error("Can't set speed scalar: " + speedScalar);
        
        if (speedScalar <= 0) { 
            if (!this.target) { 
                this.currentSpeed = createVector(0, 0);
                this.currentScalarSpeed = 0;
                return this.currentSpeed;
            }
        }

        this.currentSpeed = p5.Vector.sub(this.target, this.position);
        this.currentSpeed.setMag(speedScalar);
        this.currentScalarSpeed = speedScalar;

        return this.currentSpeed;
    }

    drawTarget() { 
        if (!this.target) return false;
        
        stroke("#FFFFCC08");
        strokeWeight(16);
        line(this.position.x, this.position.y, this.target.x, this.target.y);

        noFill();
        stroke("#FFFFFF");
        strokeWeight(1);
        ellipse(this.target.x, this.target.y, 24, 24);
        ellipse(this.target.x, this.target.y, 2, 2);

        return true;
    }

    draw(index, selectedSegmentId = null) {
        const tentacles = this.tentacles;
        const tentacleCount = tentacles.length;

        let i = 0;

        while (i < tentacleCount) { 
            tentacles[i].draw(i);
            i++;
        }

        super.draw(index);
        this.drawTarget();
    }

}
