class TentaclePlayer extends Player { 
    constructor(options) { 
        super(options);
        if (!options) options = {};

        const tentacleCount = options.tentacleCount || 4;

        this.selectedIndex = -1;
        this.tentacles = options.tentacles || [];
        this.tentacleCount = 0;
        this.app = options.app || null;
        this.notes = null;
        this.debug = false;

        this.speedValue = (options.speed || options.speedValue) || 1.5;
        this.accelerationValue = (options.acceleration || options.accelerationValue) || 0.1;

        this.currentSpeed = createVector(0, 0);    // Current speed vector (x/y direction)
        this.currentSpeedScalar = 0;  // Current speed as a decimal value

        this.targetSpeed = createVector(0, 0);  // Max speed vector (x/y direction)
        this.targetSpeedScalar = 0; // Max speed as a decimal value

        this.acceleration = createVector(0, 0); // Acceleration vector (x/y direction)
        this.accelerationScalar = 0;            // Acceleration as a decimal value

        this.target = null; // The target the player is moving towards

        // The position vector that the player is hung-up on.
        // Usually the tip of the tail of the furthest tentacle from the direction the player is headed
        this.hungupTentacle = null;

        const pos = this.position;
        const tentacleSegmentLength = options.tentacleSegmentLength || 12;
        const tentacleSegmentCount = options.tentacleSegmentCount || (options.tentacleSegmentCount || 10);

        console.log("TentacleSegmentCount: " + tentacleSegmentCount + ", TentacleSegmentLength: " + tentacleSegmentLength);
        for (let i = 0; i < tentacleCount; i++) {
            const po = { x: pos.x, y: pos.y, angle: 0, player: this };
            const color = TentacleSegment.colors[0];  //i % TentacleSegment.colors.length];
            const t = this.createTentacle(po, tentacleSegmentCount, tentacleSegmentLength, color);
            t.name += " (" + i + ")";
        }

        this.setRestingPose(pos.x, pos.y);

        console.log("Created Player: " + this.name);
    }

    setRestingPose(x, y, offset = null) {
        for (let i = 0; i < this.tentacles.length; i++) {

            let dx = (typeof offset === "number") ? offset : this.tentacles[i].totalLength;
            let dy = dx;

            console.warn("Offset: " + dx + " | " + this.tentacles[i].totalLength);

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

            const xx = Math.max(x + dx, -1);
            const yy = Math.max(y + dy, -1);

            this.tentacles[i].setTargetPosition(xx, yy);
        }
    }

    setTargetDestination(x, y) {
        if (typeof x !== "number" || typeof y !== "number")
            throw new Error("Invalid position: " + x + ", " + y);

        this.target = createVector(x, y);

        this.targetSpeedScalar = this.speedValue;
        this.targetSpeed = p5.Vector.sub(this.target, this.position);
        this.accelerationScalar = this.accelerationValue;

        this.targetSpeed.setMag(this.targetSpeedScalar);    // Set to max speed
        this.acceleration.setMag(this.accelerationScalar);  // Set to max acceleration
        this.updateSpeed(Math.max(this.currentSpeedScalar, 0.00001)); // Set to current speed (if it currently has a speed), or 0.00001 (if it's stopped, which is basically zero)

        this.reSortTentacles();

        return this.target;
    }

    /**
     * Gets the tentacle that has a tip that is the closest to the last calculated player target position,
     * which is the last tentacle in the array after reSortTentacles() is called.
     * @returns {Tentacle} The tentacle that is closest to the target, which is to say: the tentacle that is sorted last in the array after reSortTentacles() is called
     */
    getClosesTentatleToTarget() {
        return this.tentacles[this.tentacleCount - 1];
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

        const tentacle = new Tentacle({ player: this, color: color });
        const colorCount = TentacleSegment.colors.length;

        let cursor = null;
        
        for (let i = 0; i < segmentCount; i++) {
            const m = Math.floor(Math.random() * 10) % 2 === 0 ? 1 : -1;
            const angle = (Math.random() * Math.PI) * m;
            const segmentOptions = { x: pos.x, y: pos.y, angle: angle, length: segmentLength, color: color, colorIndex: i % colorCount };
            cursor = tentacle.appendSegment(segmentOptions);
        }

        this.tentacles.push(tentacle);
        if (this.selectedIndex < 0) this.selectedIndex = 0;

        this.tentacleCount = this.tentacles.length;

        return tentacle;
    }

    onArrival(clearTarget = true) { 
        if (clearTarget === true) { 
            this.targetSpeed = createVector(0, 0);
            this.targetSpeedScalar = 0;
            this.target = null;

            this.acceleration = createVector(0, 0);
            this.accelerationScalar = 0;

            this.currentSpeed = createVector(0, 0);
            this.currentSpeedScalar = 0;

            setTimeout(() => {
                if (!this.target)
                    this.setRestingPose(this.position.x, this.position.y);
            }, 800);
        }

        // Current speed
        this.updateSpeed(Math.max(this.currentSpeedScalar, 0.00001));
    }

    update(index) { 
        let i = 0;
        const tentacleCount = this.updatePositions(); // this.tentacles.length;

        while (i < tentacleCount) {
            this.tentacles[i].updatePhysics(i);
            i++;
        }

        // Return an object in case we want to add more properties later.
        return tentacleCount; //this.updatePositions(constraints);
    }

    updatePositions() {
        const tentacleCount = this.tentacles.length;
        
        if (!this.target) {
            return tentacleCount;
        }

        if (!!this.hungupTentacle) {
            this.onArrival(false);
            this.setCourse();
            this.hungupTentacle = null;

            return tentacleCount;
        }

        if (this.currentSpeedScalar < this.targetSpeedScalar)
            this.accelerate();
        
        this.position.add(this.currentSpeed);

        const pos = this.position; 

        let i = 0;
        // Set the head position of each tentacle to the position of the player' position
        // The rest of the segments will auto configure themselves
        while(i < tentacleCount) {
            this.tentacles[i].setRootPosition(pos.x, pos.y);
            i++;
        }

        const diff = p5.Vector.sub(this.target, pos);
        const distance = diff.mag();
        const minDist = Math.max(1, this.currentSpeedScalar);

        if (distance <= minDist) {
            console.error("Player Arrived");
            this.onArrival();
        }

        return tentacleCount;
    }

    accelerate() {
        return this.updateSpeed(this.currentSpeedScalar + this.accelerationScalar);
    }

    updateSpeed(speedScalar) {
        if (!this.target) return;
        if (speedScalar === 0) throw new Error("Can't set speed scalar to zero");
        
        const newSpeed = p5.Vector.sub(this.target, this.position);
        newSpeed.setMag(speedScalar);

        this.currentSpeed = newSpeed;
        this.currentSpeedScalar = speedScalar;

        return this.currentSpeed;
    }

    drawTargetSymbol() { 
        if (!this.target) return false;
        
        noFill();
        stroke("#FFFFFF");
        strokeWeight(1);
        ellipse(this.target.x, this.target.y, 24, 24);
        ellipse(this.target.x, this.target.y, 2, 2);

        return true;
    }

    draw(index) { 
        const tentacles = this.tentacles;
        const tentacleCount = tentacles.length;

        let i = 0;

        while (i < tentacleCount) { 
            tentacles[i].drawTentacle(i);
            i++;
        }

        this.drawTargetSymbol();
        super.draw();

        if (!!this.target) { 
            stroke("#FFFFCC08");
            strokeWeight(16);
            line(this.position.x, this.position.y, this.target.x, this.target.y);
        }

    }

}
