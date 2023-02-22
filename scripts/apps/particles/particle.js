
class Particle {
    constructor(app, options) { 
        if (!options || typeof options !== "object")
            options = {};
        
        this.id = options.id || (Math.random() * 100000000).toString(36);
        this.label = null;
        this.isDead = false;
        this.epoc = 0;
        this.tick = 0;
        this.app = app;
        this.debugText = this.id;
        this.colorIndex = (options.color_index >= 0) ?
            options.color_index % ParticleOptions.colors.length :
            Math.floor(Math.random() * ParticleOptions.colors.length);
        
        this.diameter = options.diameter || ParticleOptions.defaultDiameter;
        this.isSelected = options.isSelected === true;

        const particleColor = ParticleOptions.colors[this.colorIndex];
        this.position = createVector(options.x || 0, options.y || 0);

        this.force = (!!options.force && options.force instanceof p5.Vector) ?
            options.force : createVector(options.force_x || 0, options.force_y || 0);

        this.velocity = (!!options.velocity && options.velocity instanceof p5.Vector) ?
            options.velocity : createVector(options.velocity_x || 0, options.velocity_y || 0);
        
        this.angle = options.angle || 0;
        this.color = color(particleColor.color || "white");
        this.maxVelocity = (typeof options.maxVelocity === "number" ? options.maxVelocity : 0) || 3;
        this.bubbleColor = options.bubbleColor || ParticleOptions.bubbleColor;
        this.attachments = [];

        this.maxDistance = (options.maxDistance || particleColor.maxDistance) || ParticleOptions.maxDistance;
        this.rectangle = { x: this.position.x - (this.maxDistance / 2), y: this.position.y - (this.maxDistance / 2), width: this.maxDistance, height: this.maxDistance };

        this.mass = options.mass || 1;
        this.energy = options.energy || 1;
        this.eventHorizon = this.diameter * ParticleOptions.personalSpaceMultiplier;
        this.peakDistance = (this.maxDistance - 0) / 2.0;
        //console.log("PeakDistance: " + this.peakDistance + " MaxDistance: " + this.maxDistance + " Event Horizon: " + this.eventHorizon + "");

        this.onInteraction = typeof options.onInteraction === "function" ? options.onInteraction : Particle.doNothing;
        this.lubrication = options.lubrication >= 0 && options.lubrication <= 1 ?
            options.lubrication :
            ParticleOptions.lubrication();
        
        this.gravityLubrication = (options.gravityLubrication || options.gravity_lubrication) || 1;
        this.bounciness = options.bounciness || (ParticleOptions.bounciness || Math.random());
    }

    isOffscreen() { 
        const pos = this.position;
        return pos.x < 0 || pos.x > this.app.canvasSize.width || pos.y < 0 || pos.y > this.app.canvasSize.height;
    }

    setAngle(degrees) { 
        this.angle = degrees * 0.0174532925;
    }

    setEnergy(energy) { 
        this.energy = energy;
        if (this.energy <= 0) this.die();
    }

    setColorIndex(index) {
        this.colorIndex = index % ParticleOptions.colors.length;
        const c = ParticleOptions.colors[this.colorIndex];
        this.color = c.color;
        this.maxDistance = c.maxDistance || this.maxDistance;

        return c;
    }

    /**
     * 
     * @param {Particle} otherParticle 
     * @param {numb} distance
     * @returns {number} The attraction value
     */
    calculateAttractionValue(otherParticle, distance) { 
        const d = (distance - this.eventHorizon);
        let f = 0;

        if (d < 0) { 
            f = -1 + (distance / this.eventHorizon);
        } else {
            let p = d / this.peakDistance;
            if (p > 1) p = 2 - p;

            f = p * this.app.attractionMatrix[this.colorIndex][otherParticle.colorIndex];
        }

        return { attractionValue: f, distance: d };
    }

    /**
     * Calculates the force vector between this particle and another particle.
     * The velocity will be updated after this.
     */
    getForceVector(otherParticle, distanceVector, distance = -1) {
        if (distance < 0) distance = distanceVector.mag();
        
        if ((distance - this.eventHorizon) > this.maxDistance) {
            // Too far away
            return {
                attractionValue: 0,
                force: createVector(0, 0)
            };
        }
        
        const { attractionValue } = this.calculateAttractionValue(otherParticle, distance);

        return {
            attractionValue: attractionValue,
            force: distanceVector.normalize().mult(attractionValue * 1.5),
        };
    }

    /**
     * 
     * @param {Particle} otherParticle 
     * @param {number} history 
     * @returns {number}
     */
    interactWith(otherParticle, history = null) {
        const distanceVector = p5.Vector.sub(otherParticle.position, this.position);
        const distance = distanceVector.mag();
        const { force } = this.getForceVector(otherParticle, distanceVector, distance);

        if (typeof this.constrain !== "function") this.constrain = this.enforceBoundaryField;
        this.constrain(force, 128);

        this.force = force;
        this.velocity.add(force).limit(this.maxVelocity * 5).mult(this.lubrication);

        // if (distance < this.eventHorizon * 0.75) { 
        //     const av = this.sketch.attractionMatrix[this.colorIndex][otherParticle.colorIndex];
        //     if (av > 0.9 && this.colorIndex !== otherParticle.colorIndex) {
        //         this.eat(otherParticle);
        //     } else if (av > 0.8) { 
        //         this.copulateWith(otherParticle);
        //     }
        // }

        return 0;
    }

    getGravityForce(otherMass, distanceVector, distance = -1) {
        if (distance < 0) distance = distanceVector.mag();

        const G = 1.1;
        const masses = this.mass * otherMass * G;
        
        if (distance < this.eventHorizon) { 
            distanceVector.setMag(this.diameter);
            distance = this.diameter;
        }

        const gravityForceVector = distanceVector.normalize().mult(masses / (distance * distance));

        return {
            attractionValue: 1.0,
            force: gravityForceVector,
            //velocity: velocityVector,
        };
    }
    
    enforceBoundaryField(forceVector, boundaryMargin = 128) {
        const { x, y } = this.position;
        const { width, height } = this.app.canvasSize;
        
        const farX = width - boundaryMargin;
        const farY = height - boundaryMargin;
        
        // This is so the particles softly slingshot back into the active area, instead of bouncing off the walls.
        // The higher the number, the more "stretchy" the boundary is.
        const reducer = 5; 

        if (x < boundaryMargin) forceVector.x += (boundaryMargin - x) / (boundaryMargin * reducer);
        else if (x > farX) forceVector.x += (farX - x) /  (boundaryMargin * reducer);

        if (y < boundaryMargin) forceVector.y += (boundaryMargin - y) /  (boundaryMargin * reducer);
        else if (y > farY) forceVector.y += (farY - y) /  (boundaryMargin * reducer);
    }

    /**
     * 
     * @param {Particle} otherParticle 
     * @param {number} history 
     * @returns {number}
     */
    gravitate(otherParticle, history = null) {
        const distanceVector = p5.Vector.sub(otherParticle.position, this.position);
        const distance = distanceVector.mag();
        const { force } = this.getGravityForce(otherParticle.mass || 1, distanceVector, distance);

        if (typeof this.constrain !== "function") this.constrain = this.enforceBoundaryField;

        this.constrain(force, 128);
        this.velocity.add(force).limit(this.maxVelocity).mult(this.gravityLubrication);

        return 0;
    }

    updateFallingPhysics() {
        const force = createVector(0, 0.1);
        const repel = 2 * this.bounciness;

        if (this.position.y > this.app.canvasSize.height - this.diameter) {
            force.y = -this.velocity.y * repel;
        }

        if (this.position.x < this.diameter) {
            force.x = Math.abs(this.velocity.x) * repel;
        } else if (this.position.x > this.app.canvasSize.width - this.diameter) {
            force.x = -Math.abs(this.velocity.x) * repel;
        }

        this.velocity.add(force).mult(0.999);

        //this.constrainParticlePositionByForce(this.velocity.mult(this.lubrication));
        //console.log(JSON.stringify(this.velocity, null, 4));
        this.updatePosition();
    };

    updateGravityPhysics(otherParticles) {
        const particle = this;
        const particleCount = otherParticles.length;

        let history = null;

        let i = 0;
        while (i < particleCount) {
            const otherParticle = otherParticles[i];
            i++;

            if (otherParticle.id === particle.id)
                continue; // No need to interact with itself
            history = this.gravitate(otherParticle, history);
        }

        this.updatePosition();
        this.updateTimers();
    }

    updatePhysics(otherParticles) {
        const particle = this;
        const particleCount = otherParticles.length;

        let history = null;

        let i = 0;
        while (i < particleCount) {
            const otherParticle = otherParticles[i++];
            if (otherParticle.id === particle.id)
                continue; // No need to interact with itself
            history = this.interactWith(otherParticle, history);
        }

        this.updatePosition(particleCount);
        this.updateTimers();
    }

    updateTimers() { 
        this.tick++;

        if (this.tick > 100000) {
            if (this.poc === 100000) {
                console.error("EPOC: " + this.epoc.toString());
            }

            this.epoc++;
            this.tick = 0;
        }
    }

    updatePosition() {
        this.position.add(this.velocity);

        const offset = (this.maxDistance / 2);
        this.rectangle.x = this.position.x - offset;
        this.rectangle.y = this.position.y - offset;
    }

    drawParticle(index, isPaused = false) {
        const pos = this.position;

        noStroke();
        fill(this.color, 0, 0);

        // Default mode is CENTER, which means it draws from the center of the circle based on diameter (not radius)
        // Switching the ellipseMode(RADIUS) will draw from the center, but use the radius for sizing
        ellipse(pos.x, pos.y, this.diameter, this.diameter);
    }

    drawLabel() { 
        const pos = this.position;
        const offset = this.diameter * 2.5;

        noStroke();
        fill("white");

        const label = this.label || JSON.stringify(this.position, null, 4);
        text(label, pos.x + offset, pos.y + offset);
    }

    drawRanges(index, pos = this.position) {
        //const offset = this.diameter / 2.0;
        const cx = pos.x;
        const cy = pos.y;

        noFill();

        stroke("white");
        ellipse(cx, cy, this.eventHorizon, this.eventHorizon);

        //sketch.stroke("#00ff0088");
        //sketch.ellipse(cx, cy, this.peakDistance, this.peakDistance);

        stroke("#ffffff22");
        ellipse(cx, cy, this.maxDistance * 2, this.maxDistance * 2);

        // sketch.noStroke();rr
        // sketch.fill("#ffffff88");
        // sketch.text(this.maxDistance.toFixed(2), cx, cy + this.maxDistance + 5);        
    }
    
    drawForces() { 
        const pos = this.position;

        stroke("white");
        strokeWeight(1);

        const vx = this.force.x * 100;
        const vy = this.force.y * 100;

        line(pos.x, pos.y, pos.x + vx, pos.y + vy);
    }

    zap() { 
        this.velocity.set(0, 0, 0);
    }

    copulateWith(otherParticle) { 

    };

    eat(otherParticle) {
        if (otherParticle.diameter > this.diameter * 1.5) { 
            return;
        }

        this.diameter += otherParticle.diameter * 0.4;
        //console.warn(ParticleOptions.colors[this.colorIndex].name + " ate " + ParticleOptions.colors[otherParticle.colorIndex].name);
        otherParticle.die();
    };

    die() { 
        this.isDead = true;
        //console.warn(ParticleOptions.colors[this.colorIndex].name + " died");
    }    
    // Static and Interaction methods
    
    static doNothing(params) { 
        // Do nothing
    }

    static cloneMe(me, otherParticle, force, dist) {
        return null;
    }
}
