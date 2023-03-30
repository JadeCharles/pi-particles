/**
 * @fileoverview Particle Life App - Main engine for the particle life app.
 * @author Jade Charles
 * @version 1.0.0
 * @license MIT - Just give me some street cred.
 * @requires p5.js
 * @requires ParticleApp.js
 */
class ParticleApp { 
    constructor(options, ...args) {
        //colorCount = 4, elementId = "main-canvas", legendElementId = "color-matrix"
        const colorCount = typeof options === "number" ? options : (options?.colorCount || 2);
        const elementId = options?.canvasId || (args[0] || "main-canvas");
        const legendElementId = options?.legendId || (args[1] || "color-matrix");
        const controlsElementId = options?.controlsId || (args[2] || "controls");

        this.ui = options.ui;
        this.name = "Particle Life v1.0.0";
        this.stateText = "";
        this.attractionMatrix = ParticleConfig.createRandomAttractionMatrix();
        this.particles = [];
        this.colorCount = colorCount;
        this.spawnMode = 0;
        this.isRunning = true;
        this.legend = null;

        this.selectedIndex = -1;
        this.colorIndexCursor = 0;
        this.elementId = elementId;

        // These are defaults, but will be explicitly set down below to ensure the UI is updated.
        this.lubrication = 0.0;
        this.speed = 1.0;
        this.burstCount = 100;
        this.lubrication = ParticleConfig.lubrication();

        // These will be set in the updateCanvasSize() function.
        this.width = 0;
        this.height = 0;

        this.onMatrixUpdate = null;
        this.onPlayToggle = null;

        this.legendElementId = legendElementId;
        this.controlsElementId = controlsElementId;
        this.controls = new AnimationControls(this, { elementId: controlsElementId });
        
        this.updateCanvasSize(elementId);
        this.addEventListeners();

        const me = this;
        
        this.updateLegend = () => { 
            console.log("Updating legend: " + legendElementId);
            ParticleLegend.createUi(me, legendElementId);
        };

        this.updateControls = () => {
            console.log("Updating Controls: " + controlsElementId);
            me.controls.display = "";
            me.controls.updateUi(me);
        };

        this.updateLegend();
        this.updateControls();

        this.updateUi(this.colorCount, 'color-count');

        // Call these methods so the UI updates (even though we've already set them)
        this.setFrictionAmount(ParticleConfig.friction);
        this.setSpeed(1);
        this.setColorCount(colorCount);
        this.setBurstCount(this.burstCount);

        console.log("App constructed with colorCount: " + colorCount);
    };

    getDisplay() { 
        let display = "Paused";

        if (this.isRunning) {
            display = "Playing";
            if (this.particles.length === 0) display = "No Particles";
            else if (this.selectedIndex >= 0) display = ParticleConfig.colors[this.selectedIndex].name + " " + display;
        }

        return display;
    }

    onCellClick(e) { 
        if (!e) e = { type: "unknown" };

        if (e?.type === "cell") { 
            console.log("Cell clicked good: " + e.row + ", " + e.col + " = " + e.value);
            return false;
        }

        if (e.type === "color") { 
            // Use the variable "app" because this method is sometimes called by a JQuery event handler
            // which seems to hijack the this variable.
            app.selectParticleColor(e.index);
            app.updateControls();

            return false;
        }

        return true;
    }

    reset() {
        this.particles = [];
        this.updateLegend();
        this.updateControls();
    }

    selectParticleColor(index) {
        if (typeof index === "string") index = parseInt(index);
        if (typeof index !== "number" || index >= this.colorCount) index = -1;

        if (index === this.selectedIndex) { 
            console.log("Unselected: " + index);
            index = -1;
        }

        this.selectedIndex = index;
        console.log("Selected Index: " + index);

        return true;
    }

    setBurstCount(count) {
        if (typeof count === "string") count = parseInt(count);
        if (typeof count !== "number" || count < 1) return false;

        this.burstCount = count;
        this.updateUi(this.burstCount, 'burst-count');
        return true;
    }

    setColorCount(count) { 
        if (typeof count === "string") count = parseInt(count);
        if (typeof count !== "number" || count < 1 || count > ParticleConfig.colors.length) return false;

        this.colorCount = count;
        this.updateLegend();

        return this.updateUi(this.colorCount, 'color-count');
    }

    setSpeed(speed = 1.0, updateFormValue = false) { 
        if (typeof speed === "string") speed = parseFloat(speed);

        if (isNaN(speed) || typeof speed !== "number") { 
            console.error("Speed value is invalid (" + (typeof speed).toString() + "): " + speed);
            return false;
        }

        this.updateAllParticlesValue("speed", speed);
        this.speed = speed;
        this.updateUi(this.speed, 'speed-amount');
        
        if (updateFormValue)
            this.updateUiValue(this.speed, 'speed-amount-value');
        
        return true;
    }

    setFrictionAmount(amount) {
        if (typeof amount === "string") amount = parseFloat(amount);
        if (typeof amount !== "number" || isNaN(amount)) return false;

        const lube = 1.0 - amount;

        // Update all particle individually
        // This is because we want to be able to change the friction amount for an individual particle at some point
        this.updateAllParticlesValue("lubrication", lube);
        this.lubrication = lube;

        console.log("Lubrication: " + lube.toFixed(4));
        
        //this.updateUiValue(amount.toFixed(6), 'friction-amount');
        this.updateUi(amount, 'friction-amount');
        return true;
    }

    updateUiValue(value, elementId) { 
        if (typeof this.ui?.updateValue === "function")
            return this.ui.updateValue(value, elementId);
        
        return false;
    }

    updateUi(value, elementId) {
        if (typeof this.ui?.updateHtml === "function") { 
            return this.ui.updateHtml(value, elementId);
        }

        console.error("Failed to update UI (" + elementId + "): " + value);
        return false;
    }

    setSpawnMode(mode) {
        if (typeof mode === "string") mode = parseInt(mode);
        if (typeof mode !== "number" || isNaN(mode) || mode < 0) { 
            console.error("Failed to setSpawnMode because mode is invalid: " + mode);
            return;
        }

        this.spawnMode = mode;
        console.log("Spawn mode is now: " + mode);
    }

    togglePlay() { 
        this.isRunning = !this.isRunning;
        if (typeof this.onPlayToggle === "function")
            this.onPlayToggle(this.isRunning);
        
        this.updateControls();
    }

    updateAllParticlesValue(fieldName, value) { 
        const particleCount = this.particles.length;
        if (particleCount <= 0) return 0;
        if (typeof this.particles[0][fieldName] === "undefined") return -1;

        let i;
        for (i = 0; i < particleCount; i++) {
            this.particles[i][fieldName] = value;
        }

        return i;
    }

    setAttractionValue(i, j, value) { 
        if (typeof i === "string") i = parseInt(i);
        if (typeof j === "string") j = parseInt(j);
        if (typeof value === "string") value = parseFloat(value);

        if (typeof i !== "number" || typeof j !== "number" || typeof value !== "number") return;
        if (i < 0 || i >= this.attractionMatrix.length || j < 0 || j >= this.attractionMatrix.length) return;

        this.attractionMatrix[i][j] = value;
        
        if (typeof this.onMatrixUpdate === "function")
            this.onMatrixUpdate({ i, j, value});
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
        
        if (!options) options = {};
        if (typeof options.updateControls !== "boolean")
            options.updateControls = false;
        
        const randomRange = (options?.randomRange || 30);

        for (let i = 0; i < count; i++) {
            const ci = colorIndex >= 0 ? colorIndex : i % app.colorCount;

            const rx = Math.random() * randomRange - (randomRange / 2);
            const ry = Math.random() * randomRange - (randomRange / 2);
            const p = { ...pos, x: pos.x + rx, y: pos.y + ry }
            
            app.spawn(ci, p, options);
        }

        app.colorIndexCursor = 0;
        app.updateControls();
    };

    spawn(colorIndex = -1, pos = null, options = null) {
        if (colorIndex < 0) {
            if (this.selectedIndex >= 0) { 
                colorIndex = this.selectedIndex;
            } else { 
                colorIndex = this.colorIndexCursor;
                this.colorIndexCursor++;

                const maxCount = Math.min(this.colorCount, ParticleConfig.colors.length);

                if (this.colorIndexCursor >= maxCount)
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

        if (options.updateControls !== false)
            this.updateControls();

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
                this.attractionMatrix = ParticleConfig.invertAttractionMatrix(this.attractionMatrix);
                break;
            case "d":
            case "keyd":
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
            case "escape":
                if (this.ui.isMenuItemOpen()) this.ui.closeMenus();
                else this.reset();

                break;
            default:
                console.log("Key Press: " + key);
                key = null;
                break;
        }

        this.updateLegend();
        if (typeof this.onMatrixUpdate === "function") { 
            this.onMatrixUpdate(key);
        }
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
