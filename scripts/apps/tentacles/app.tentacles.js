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
        this.grid = options.grid || null;
        this.showGrid = true;
        
        this.selectedIndex = -1;
        this.needsEventListeners = true;
        this.players = [];

        if (!document.getElementById(this.elementId)) return;

        this.updateCanvasSize();
        this.addEventListeners();
    }

    createPlayer(options) { 
        if (!this.mounted) {
            console.error("App not mounted yet");
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

        // Generally add keyboard event handlers
        document.addEventListener("keydown", (e) => {
            // Handle Key Press
            const k = e.key.toLowerCase();
            switch (k) {
                case "escape":
                    break;
                case "h":
                    break;
                case "d":
                case "keyd":
                    if (this.players.length > 0) this.players[0].debug = !(this.players[0].debug === true);
                    break;
            }
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

    drawPlayers() { 
        let i = 0;
        const players = TentacleApp.instance.players;
        const playerCount = players.length;

        while (i < playerCount) { 
            players[i].draw(i);
            i++;
        }

        // Return an object in case we want to add more properties later.
        return {
            count: playerCount,
            player: playerCount > 0 ? players[0] : null
        };
    }
}

