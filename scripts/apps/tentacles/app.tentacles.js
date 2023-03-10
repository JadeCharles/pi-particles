class TentacleApp { 
    static instance = new TentacleApp();

    static init() { 
        TentacleApp.instance = new TentacleApp();
    }

    constructor(...args) { 
        const options = args[0] || {};
        this.name = "Tentacle App";
        this.elementId = "main-canvas";
        this.ui = null;

        this.width = 100;
        this.height = 100;
        this.mounted = false;
        this.tentacles = [];

        this.selectedIndex = -1;
        this.needsEventListeners = true;

        if (!document.getElementById(this.elementId)) return;

        this.updateCanvasSize();
        this.addEventListeners();
    }

    createTentacle(pos, segmentCount = 5) { 
        if (!this.mounted) {
            console.error("App not mounted yet");
            return null;
        }

        if (this.needsEventListeners) this.addEventListeners();
        
        if (!pos) pos = { x: 0, y: 0 };

        const tentacle = new Tentacle();
        const colorCount = TentacleSegment.colors.length;

        let cursor = null;
        
        for (let i = 0; i < segmentCount; i++) {
            const m = Math.floor(Math.random() * 10) % 2 === 0 ? 1 : -1;
            const angle = (Math.random() * Math.PI) * m;
            const segmentOptions = { x: pos.x, y: pos.y, angle: angle, length: 60, colorIndex: i % colorCount };
            cursor = tentacle.appendSegment(segmentOptions);
        }

        this.tentacles.push(tentacle);
        if (this.selectedIndex < 0) this.selectedIndex = 0;
    }

    addEventListeners() {
        // Suppress right click when over the canvas
        const canvas = document?.querySelector("canvas");
        if (!canvas) { 
            console.warn("No canvas to add event listener to");
            return;
        }

        console.log("Canvas context menu nullifying");

        canvas.addEventListener("contextmenu", (e) => {
            if (typeof e?.preventDefault === "function") e.preventDefault();
            if (typeof e?.stopPropagation === "function") e.stopPropagation();
            if (typeof e?.stopEvent === "function") e.stopEvent();
            if (typeof e?.stopEventPropagation === "function") e.stopEventPropagation();

            return false;
        });

        // Generally add keyboard event handlers
        document.addEventListener("keydown", (e) => {
            // Handle Key Press
        });

        console.log("Added event listeners");
        delete this.needsEventListeners;
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
    
    updatePhysics() { 
        let i = 0;
        const app = TentacleApp.instance;
        const tentacleCount = app.tentacles.length;

        while (i < tentacleCount) { 
            const tentacle = app.tentacles[i];
            tentacle.updatePhysics(i);
            tentacle.updatePositions(i);
            i++;
        }

        // Return an object in case we want to add more properties later.
        return {
            count: tentacleCount
        };
    }

    drawTentacles() { 
        let i = 0;
        const app = TentacleApp.instance;
        const tentacleCount = app.tentacles.length;

        while (i < tentacleCount) { 
            app.tentacles[i].drawTentacle(i);
            i++;
        }

        // Return an object in case we want to add more properties later.
        return {
            count: tentacleCount
        };
    }
}

