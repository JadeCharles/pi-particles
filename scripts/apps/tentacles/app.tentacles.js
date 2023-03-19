class TentacleApp { 
    static instance = new TentacleApp();

    static init() {
        const grid = new GameGrid({ showGrid: true });
        TentacleApp.instance = new TentacleApp({ grid: grid });
    }

    constructor(...args) { 
        const options = args[0] || {};
        this.name = "Tentacle App";
        this.elementId = "main-canvas";
        this.ui = null;

        this.width = 100;
        this.height = 100;
        this.mounted = false;
        this.grid = null; // options.grid || null;
        this.showGrid = true;
        this.globalAngle = 0;
        this.text = "";

        this.isAuto = false;
        this.autoState = 0;

        this.selectedIndex = -1;
        this.needsEventListeners = true;
        this.players = [];
        this.markers = [];

        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.debugLevel = 1;

        if (!document.getElementById(this.elementId)) return;

        this.updateCanvasSize();
        this.addEventListeners();
    }

    createPlayer(options) { 
        if (!this.mounted) {
            console.warn("App not mounted yet");
            return null;
        }

        if (this.needsEventListeners) this.addEventListeners();

        if (!options) options = {};
        options.app = this;

        this.players.push(new TentaclePlayer(options));
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

        // Handle Key Press

        // Generally add keyboard event handlers
        document.addEventListener("keydown", (e) => {
            const player = (this.players.length > 0) ? this.players[0] : null;
            const tent = player?.tentacles[0];
            const k = e.key.toLowerCase();

            switch (k) {
                case "escape":
                    break;
                case "t":
                case "keyt":
                    this.autoState = 1;
                    break;
                case "a":
                case "keya":
                    if (this.isAuto) this.resetState();
                    else this.isAuto = true;
                    break;
                case "h":
                    break;
                case "s":
                case "keys":
                    if (!!tent) {
                        tent.selectedSegment = !!tent.selectedSegment ? tent.selectedSegment?.nextSegment : tent.head;
                        console.log("Selected segment: " + (tent.selectedSegment?.id || "(None)"));
                    }
                    break;
                case "d":
                case "keyd":
                    this.debugLevel++;
                    if (this.debugLevel > 2) this.debugLevel = 0;
                    break;
            }
        });

        console.log("Added event listeners");
        delete this.needsEventListeners;
    }
    
    resetState() { 
        for(let i = 0; i < this.players.length; i++) {
            this.players[i].resetState();
        }
        this.isAuto = false;
        this.autoState = 0;
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
    
    update() { 
        let i = 0;
        const players = TentacleApp.instance.players;
        const playerCount = players.length;

        while (i < playerCount) { 
            const p = players[i];

            if (typeof p.update !== "function") { 
                for (let x in p) { 
                    console.log(x);
                }
                throw new Error("Not a function: ");
            }

            p.update(i);
            i++;
        }

        // Return an object in case we want to add more properties later.
        return {
            count: playerCount
        };
    }

    drawCircleAt(pos, color = null, size = 16, thickness = 1) { 
        if (!pos) return;
        
        stroke(color || "#CCCCCC");
        strokeWeight(thickness);
        noFill();
        ellipse(pos.x, pos.y, size, size);
    }

    drawPlayers() { 
        let i = 0;
        const players = TentacleApp.instance.players;
        const playerCount = players.length;

        while (i < playerCount) { 
            players[i].draw(i);
            i++;
        }

        i = 0;
        const len = this.markers.length;

        stroke(0, 255, 255);
        strokeWeight(1);
        noFill();

        while (i < len) { 
            const m = this.markers[i];
            if (!m.text) continue;

            fill(0, 255, 255, 80);
            ellipse(m.x, m.y, 16, 16);

            noFill();
            text(m.text, m.x + 16, m.y);

            i++;
        }

        noFill();

        // Return an object in case we want to add more properties later.
        return {
            count: playerCount,
            player: playerCount > 0 ? players[0] : null
        };
    }
}

