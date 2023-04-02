class TentacleApp extends App { 
    static instance = new TentacleApp();

    static init() {
        const grid = new GameGrid({ showGrid: true });
        TentacleApp.instance = new TentacleApp({ grid: grid });
    }

    constructor(...args) { 
        super(args);

        this.name = "Tentacle App";

        this.grid = null; // options.grid || null;
        this.showGrid = true;

        this.isAuto = false;
        this.autoState = 0;

        this.selectedIndex = -1;
        this.agents = [];
        this.markers = [];

        if (!document.getElementById(this.elementId)) { 
            return;
        }

        this.updateCanvasSize();
        if (!!this.addEventListeners()) console.log("Tentacle App mounted");
        else if (this.addEventListeners > 1) console.warn("No canvas mounted");
    }

    createAgent(options) {
        if (!this.mounted) {
            if (this.needsEventListeners > 1) console.warn("App not mounted yet: " + this.needsEventListeners);
            return null;
        }

        if (this.needsEventListeners)
            this.addEventListeners();

        if (!options) options = {};
        options.app = this;

        this.agents.push(new TentacleAgent(options));
    }

    addEventListeners() {
        const canvas = super.addEventListeners(true);
        if (!canvas) return;

        // Handle Key Press

        // Generally add keyboard event handlers
        document.addEventListener("keydown", (e) => {
            const agent = (this.agents.length > 0) ? this.agents[0] : null;
            const tent = agent?.tentacles[0];
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
                    this.isAuto = !this.isAuto;
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
                    const agent = this.agents[0];
                    if (!!agent) { 
                        agent.debugLevel++;

                        if (agent.debugLevel > 2)
                            agent.debugLevel = 0;
                    }
                    break;
            }
        });

        console.log("Added event listeners? " + (canvas !== null).toString());

        return canvas;
    }
    
    resetState() { 
        for(let i = 0; i < this.agents.length; i++) {
            this.agents[i].resetState();
        }
        this.isAuto = false;
        this.autoState = 0;
    }

    update() { 
        let i = 0;
        const agents = TentacleApp.instance.agents;
        const agentCount = agents.length;

        while (i < agentCount) { 
            agents[i].update(i, this.isAuto);
            i++;
        }

        // Return an object in case we want to add more properties later.
        return {
            count: agentCount
        };
    }

    draw() { 
        this.refreshCanvas();
        
        if (!!this.grid) this.grid.drawGrid();

        let i = 0;
        const agents = TentacleApp.instance.agents;
        const agentCount = agents.length;
        
        while (i < agentCount) { 
            agents[i].draw(i, this.selectedSegment?.id);
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
            count: agentCount,
            agent: agentCount > 0 ? agents[0] : null
        };
    }
}

