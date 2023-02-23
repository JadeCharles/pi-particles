class ParticleApp { 
    constructor() {
        this.attractionMatrix = ParticleOptions.createRandomAttractionMatrix();
        this.particles = [];
        this.colorCount = 3;
        this.canvasSize = { width: 0, height: 0 };
        this.colorIndexCursor = 0;

        this.spawn = (colorIndex, pos = null, options = {}) => {
            console.log("Spawned particle: " + colorIndex);
            if (colorIndex < 0) {
                colorIndex = this.colorIndexCursor;
                this.colorIndexCursor++;

                if (this.colorIndexCursor >= this.colorCount)
                    this.colorIndexCursor = 0;
            }

            options.color_index = colorIndex;

            if (typeof pos?.x === "number") options.x = pos.x;
            if (typeof pos?.y === "number") options.y = pos.y;

            if (typeof options?.maxDistance !== "number" || options.maxDistance <= 0)
                options.maxDistance = 400;

            if (typeof this.particles === "undefined") {
                console.error("This is nothing");
                return null;
            }

            const particle = new Particle(this, options);
            this.particles.push(particle);

            return particle;
        };
    };

    addEventListeners() {
        document.querySelector("canvas").addEventListener("contextmenu", (e) => {
            if (typeof e?.preventDefault === "function") e.preventDefault();
            if (typeof e?.stopPropagation === "function") e.stopPropagation();
            if (typeof e?.stopEvent === "function") e.stopEvent();
            if (typeof e?.stopEventPropagation === "function") e.stopEventPropagation();

            return false;
        });

        document.addEventListener("keydown", (e) => {
            switch (e.code) {
                case "KeyR":
                    app.attractionMatrix = ParticleOptions.createRandomAttractionMatrix();
                    break;
                case "KeyU":
                    app.attractionMatrix = ParticleOptions.createUniformAttractionMatrix();
                    break;
                default:
                    break;
            }
        });

        return app;
    }

    spawnMany(count, colorIndex = -1, pos = null, options = {}) {
        for (let i = 0; i < count; i++) {
            app.spawn(i % app.colorCount, pos, options);
        }

        app.colorIndexCursor = 0;
    };

    updatePhysics() { 
        let i = 0;
        const particleCount = app.particles.length;
        const particles = app.particles;

        while (i < particleCount) { 
            particles[i++].updatePhysics(particles);
        }
    };

    drawParticles () {
        let i = 0;
        const particleCount = app.particles.length;

        while (i < particleCount) { 
            app.particles[i].drawParticle(i);
            i++;
        }

        return particleCount;
    };

}    
