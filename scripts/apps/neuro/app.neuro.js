class NeuroApp extends App { 
    static instance = new NeuroApp();

    static init() {
        NeuroApp.instance = new NeuroApp({ name: "Neuro App" });
    }

    constructor(options, ...args) { 
        super(options, args);

        if (!options) options = { name: "Unnamed" };

        this.name = options?.name || "Neuro App";
        this.network = new FeedForwardNueralNetwork(this);
        this.text = "Neuro App FF";
        this.isAuto = false;
        this.isSetup = false;
        this.selectedNeurons = [];
        this.selectedKeys = {};
        this.log = [];
        this.results = [];

        if (!document.getElementById(this.elementId)) { 
            return;
        }

        this.updateCanvasSize();
        this.getInputValues = (sender) => {
            console.warn("No input values provided because the getInputValues() method was not set. Returning empty array.");
            return [];
        }

        if (!!this.addEventListeners()) console.log("Tentacle App mounted");
        else if (this.addEventListeners > 1) console.warn("No canvas mounted");
    }

    addEventListeners() {
        const canvas = super.addEventListeners(true);
        if (!canvas || !this.network) return;

        // Handle Key Press

        // Generally add keyboard event handlers
        document.addEventListener("keydown", (e) => {
            const k = e.key.toLowerCase();
            this.selectedKeys[k] = true;
            console.log(JSON.stringify(this.selectedKeys));

            switch (k) {
                case "escape":
                    this.clearSelectedNeurons();
                    break;
                case "a":
                case "keya":
                    this.network.submit(this.getInputValues(e));
                    break;
                case "t":
                case "keyt":
                    const ts = this.network.trainXor(1000, 0, 0);

                    const lastValue = this.results.length > 0 ? this.results[this.results.length - 1] : null;
                    const suffix = typeof lastValue === "number" ? ((lastValue - this.error) > 0 ? "Good" : "Bad") : "New";

                    this.results.push(ts.error);
                    this.log.push(ts.error.toFixed(6) + " " + suffix);
                    this.text = "Trained " + ts.epocs + ": " + ts.errors.map((e) => e[0].toFixed(3)).join(", ") + "\n" + this.log.join("\n");
                    break;
                case "r":
                case "keyr":
                    this.randomizeWeights();
                    this.network.submit(this.getInputValues(e));
                    break;
            }
        });

        document.addEventListener("keyup", (e) => {
            const k = e.key.toLowerCase();
            delete this.selectedKeys[k];
        });

        console.log("Added event listeners? " + (canvas !== null).toString());

        return canvas;
    }

    setup(...args) {
        if (this.needsEventListeners) { 
            if (!this.addEventListeners()) { 
                console.error("Failed to setup event listeners. Aborting.");
                return;
            }
        }

        let layerCount = 0;
        let layers = [];

        while (true) {
            const neuronCount = parseInt(args[layerCount.toString()]);
            if (!(layerCount > 0)) break;

            const options = { index: layerCount, neuronCount: neuronCount };
            const layer = new NeuronLayer(this.network, options);

            layers.push(layer);
            layerCount++;

            if (layerCount > 9999) break;
        }

        if (layers.length <= 1) {
            console.log("Setting up default layered network");

            layers = [
                new NeuronLayer(this.network, { name: "Input Layer", neuronCount: 3, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Hidden Layer 1",  neuronCount: 5, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Hidden Layer 2",  neuronCount: 7, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Hidden Layer 1",  neuronCount: 5, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Hidden Layer 1",  neuronCount: 5, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Output Layer",  neuronCount: 1 }),
            ];
        }

        this.network.appendLayers(layers);
        this.network.connect();
        this.isSetup = true;

        if (args.length > 0 && typeof args[0] === "function")
            this.getInputValues = (sender) => args[0];

        console.log("Neuro App setup: " + this.network.layerCount + " layers, " + this.network.neuronCount + " neurons");
    }

    randomizeWeights() { 
        this.network.randomizeWeights();
    }

    layerCount() {
        return this.network.layerCount;
    }

    getNeuronAt(x, y) { 
        let i = 0;
        const network = this.network;
        if (!network) return;

        const layerCount = network.layerCount;

        while (i < layerCount) { 
            const neuron = network.layers[i].neurons.find(n => n.isAt(x, y));

            if (neuron) return neuron;
            i++;
        }
    }

    clearSelectedNeurons() { 
        this.selectedNeurons = [];
        this.network.layers.map((layer) => {
            layer.neurons.map(n => n.isSelected = false);
        });
    }

    draw() { 
        super.refreshCanvas();

        let i = 0;
        const network = this.network;
        if (!network) return;

        const layerCount = network.layerCount;

        while (i < layerCount) { 
            network.layers[i].draw();
            i++;
        }
    }
}