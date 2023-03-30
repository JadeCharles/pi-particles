class App { 
    constructor(...args) { 
        const options = args[0] || {};
        this.elementId = options?.elementId || "main-canvas";
        this.ui = options?.ui || null;
        this.text = "";

        this.globalAngle = 0;
        this.width = options?.width || 0;
        this.height = options?.height || 0;
        this.mounted = false;
        this.button = 0;

        this.needsEventListeners = 1;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.debugLevel = 0;

        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    static drawCircleAt(pos, color = null, size = 16, thickness = 1) { 
        if (!pos) return;
        
        stroke(color || "#CCCCCC");
        strokeWeight(thickness);
        noFill();
        ellipse(pos.x, pos.y, size, size);
    }

    addEventListeners(suppressContextMenu = true) { 
        const canvas = document?.querySelector("canvas");

        if (!canvas) {
            if (this.needsEventListeners > 1)
                console.warn("No canvas to add event listener to (returning null)");

            this.needsEventListeners++;
            return null;
        }

        if (suppressContextMenu) {
            console.log("Canvas context menu suppressed");
            canvas.addEventListener("contextmenu", (e) => {
                if (typeof e?.preventDefault === "function") e.preventDefault();
                if (typeof e?.stopPropagation === "function") e.stopPropagation();
                if (typeof e?.stopEvent === "function") e.stopEvent();
                if (typeof e?.stopEventPropagation === "function") e.stopEventPropagation();

                return false;
            });
        } else console.log("Context menu is active.");
        
        delete this.needsEventListeners;

        return canvas;
    }
    
    static initMainMenu(hide = {}) { 
        const menu = $('#main-menu');
        if (!menu.get(0)) return;

        menu.empty();

        if (!hide?.home) menu.append('<a href="/">Home</a>');
        if (!hide?.particles) menu.append('<a href="/lib/particles">Particle Life</a>');
        if (!hide?.neuro) menu.append('<a href="/lib/neuro">Neural Networs</a>');
        if (!hide?.tentacles) menu.append('<a href="/lib/tentacles">Tentacles</a>');

    }

    isCanvasClick(e) {
        const target = e?.target;
        let b = false;

        // Only allow mouse clicks on the canvas.
        if ((target?.tagName || "").toString().toUpperCase() !== "CANVAS") {
            return false;
        } else { 
            b = true;
        }

        this.button = typeof e?.button === "number" ?
            e.button :
            this.button;
        
        e.stopPropagation();
        e.preventDefault();

        return b;
    }

    update() { 
        //
    }

    refreshCanvas() {
        if (!this.context) { 
            const canvas = document.getElementById("defaultCanvas0");
            this.context = canvas?.getContext("2d");
        }

        if (!!this.context)
            this.context.clearRect(0, 0, this.width, this.height);
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
}
