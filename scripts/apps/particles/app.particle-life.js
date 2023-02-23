/**
 * @fileoverview Particle Life App - Main engine for the particle life app.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires ParticleApp.js
 */
class ParticleApp { 
    constructor(colorCount = 4, elementId = "main-canvas") {
        this.name = "Particle Life v1.0.0";
        this.attractionMatrix = ParticleConfig.createRandomAttractionMatrix();
        this.particles = [];
        this.colorCount = colorCount;
        this.spawnMode = 0;
        this.isRunning = true;

        this.selectedIndex = -1;
        this.colorIndexCursor = 0;
        this.elementId = elementId;
        this.burstCount = 100;

        // These will be set in the updateCanvasSize() function.
        this.width = 0;
        this.height = 0;

        this.onMatrixUpdate = null;
        this.onPlayToggle = null;

        this.updateCanvasSize(elementId);
        this.addEventListeners();
    };

    clear() { 
        this.particles = [];
    }

    selectParticleColor(index) {
        if (typeof index === "string") index = parseInt(index);
        if (typeof index !== "number" || index >= ParticleConfig.colors.length) index = -1;
        if (index === this.selectedIndex) index = -1;
        
        this.selectedIndex = index;
    }

    setBurstCount(count) {
        if (typeof count === "string") count = parseInt(count);
        if (typeof count !== "number" || count < 1) return;

        this.burstCount = count;
    }

    setColorCount(count) { 
        if (typeof count === "string") count = parseInt(count);
        if (typeof count !== "number" || count < 1 || count > ParticleConfig.colors.length) return;
        this.colorCount = count;
    }

    setSpawnMode(mode) {
        if (typeof mode === "string") mode = parseInt(mode);
        if (typeof mode !== "number" || isNaN(mode) || mode < 0) return;

        this.spawnMode = mode;
    }

    togglePlay() { 
        this.isRunning = !this.isRunning;
        if (typeof this.onPlayToggle === "function")
            this.onPlayToggle(this.isRunning);
    }

    /**
     * Updates the size of the drawing canvas based on its html element container.
     * Each particle references this app object to get the global property values where needed.
     * Height/width, in this case
     * @param {string} elementId - The html elementId (<main id=""></main>) of the element to use for the canvas size
     * @returns {object} - The canvas size object { width: number, height: number }
     */
    updateCanvasSize(elementId) {
        if (typeof elementId !== "string" || elementId.length === 0)
            elementId = this.elementId;

        const canvas = document.getElementById(elementId);

        if (!canvas) {
            const message = (typeof elementId !== "string") ?
                "There was no elementId provided to the updateCanvasSize() function." :
                "Be sure to add a <main></main> element with id='" + elementId + "' to the html page."
            
            throw new Error("No canvas found: " + message);
        }
        
        this.width = typeof canvas?.offsetWidth === 'number' ? canvas.offsetWidth : 800;
        this.height = typeof canvas?.offsetHeight === 'number' ? canvas.offsetHeight - 1 : 500;
    }

    addEventListeners() {
        // Suppress right click when over the canvas
        document.querySelector("canvas").addEventListener("contextmenu", (e) => {
            if (typeof e?.preventDefault === "function") e.preventDefault();
            if (typeof e?.stopPropagation === "function") e.stopPropagation();
            if (typeof e?.stopEvent === "function") e.stopEvent();
            if (typeof e?.stopEventPropagation === "function") e.stopEventPropagation();

            return false;
        });

        // Generally add keyboard event handlers
        document.addEventListener("keydown", (e) => {
            this.setAttractionMatrix(e.code);
        });

        console.log("Added event listeners");
    }

    spawnMany(count = -1, colorIndex = -1, pos = null, options = {}) {
        if (count <= 0) count = this.burstCount;
        if (count > 1000) count = 1000;

        if (pos === null) pos = { x: this.width / 2, y: this.height / 2 };

        if (colorIndex < 0 && this.selectedIndex >= 0)
            colorIndex = this.selectedIndex;
        
        const randomRange = (options?.randomRange || 30);

        for (let i = 0; i < count; i++) {
            const ci = colorIndex >= 0 ? colorIndex : i % app.colorCount;

            const rx = Math.random() * randomRange - (randomRange / 2);
            const ry = Math.random() * randomRange - (randomRange / 2);
            const p = { ...pos, x: pos.x + rx, y: pos.y + ry }
            
            app.spawn(ci, p, options);
        }

        app.colorIndexCursor = 0;
    };

    spawn(colorIndex = -1, pos = null, options = null) {
        if (colorIndex < 0) {
            if (this.selectedIndex >= 0) { 
                colorIndex = this.selectedIndex;
            } else { 
                colorIndex = this.colorIndexCursor;
                this.colorIndexCursor++;

                if (this.colorIndexCursor >= ParticleConfig.colors.length)
                    this.colorIndexCursor = 0;
            }
        }

        if (typeof options !== "object" || options === null)
            options = {};

        options.color_index = colorIndex;

        if (typeof pos?.x === "number") options.x = pos.x;
        if (typeof pos?.y === "number") options.y = pos.y;

        if (typeof options?.maxDistance !== "number" || options.maxDistance <= 0)
            options.maxDistance = 400;

        if (typeof this.particles === "undefined") {
            console.error("Particles are no good.");
            return null;
        }

        const particle = new Particle(this, options);
        this.particles.push(particle);

        return particle;
    }

    setAttractionMatrix(key) {
        if (typeof key !== "string" || key.length === 0) return;
        key = key.toLowerCase();

        switch (key) { 
            case "r":
            case "keyr":
                this.attractionMatrix = ParticleConfig.createRandomAttractionMatrix();
                break;
            case "i":
            case "keyi":
                this.attractionMatrix = ParticleConfig.createPositiveOrNegativeAttractionMatrix();
                break;
            case "u":
            case "keyu":
                this.attractionMatrix = ParticleConfig.createUniformAttractionMatrix();
                break;
            case "z":
            case "keyz":
                this.attractionMatrix = ParticleConfig.createZeroAttractionMatrix();
                break;
            default:
                key = null;
                break;
        }

        if (typeof this.onMatrixUpdate === "function")
            this.onMatrixUpdate(key);
    }

    updatePhysics() { 
        if (!this.isRunning) return;

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

        // Return an object in case we want to add more properties later.
        return {
            count: particleCount
        };
    };

}    
