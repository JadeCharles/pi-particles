/**
 * @fileoverview Neuro App
 * @version 1.0.0
 * @license MIT - Just give me some street cred
 * 
 * @description
 * This class is analogous to the Controller. It handles input (data and events) and passes data to
 * the underlying network (this.network) and view. It also handles the logic of the app.
 */
class NeuroApp extends App { 
    /** Use singleton pattern to ensure only one instance of the app is created, but more because I'm lazy and want to access the instance from anywhere */
    static instance = new NeuroApp();

    static init() {
        NeuroApp.instance = new NeuroApp({ name: "Neuro App" });
    }

    constructor(options, ...args) { 
        super(options, args);

        if (!options) options = { name: "Unnamed" };

        this.name = options?.name || "Neuro App";
        this.network = new FeedForwardNueralNetwork(this);
        this.text = "Feed-Forward Neural Network";
        this.isAuto = false;
        this.isSetup = false;
        this.selectedNeurons = [];
        this.selectedKeys = {};
        this.messages = [];
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

    initWithLayerNeuronCounts(...layerNeuronCounts) {
        const nn = new MatrixNeuroApp(layerNeuronCounts);
        this.network.initWithMatrixNetwork(nn);
    }

    addEventListeners() {
        const canvas = super.addEventListeners(true);
        
        if (!canvas || !this.network) return;

        // Handle Key Presses and other events
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
                    this.network.execute(this.getInputValues(e));
                    break;
                case "t":
                case "keyt":
                    const epocCount = 10000;
                    console.log("Training and testing XOR example x" + epocCount + "...");

                    const nn = NeuroApp.testXor(epocCount, 3);
                    NeuroApp.instance.network.initWithMatrixNetwork(nn);

                    if (typeof this.refreshInputFields === "function") this.refreshInputFields();
                    else console.error("No refreshInputFields() method found");
                    
                    this.text = "";
                    break;
                case "r":
                case "keyr":
                    this.randomizeWeights();
                    this.network.execute(this.getInputValues(e));
                    break;
            }
        });

        document.addEventListener("keyup", (e) => {
            const k = e.key.toLowerCase();
            delete this.selectedKeys[k];    // Keep track of keyup events for mult-select and other things
        });

        console.log("Added event listeners: " + (canvas !== null).toString());

        return canvas;
    }

    init(...args) {
        if (this.needsEventListeners) {
            if (!this.addEventListeners()) { 
                console.error("Failed to setup event listeners. Aborting setup.");
                return;
            }
        }

        let layers = [];

        if (!!args[0] && args[0] instanceof MatrixNeuroApp) {
            const nn = args[0];
            this.network.initWithMatrixNetwork(nn);
        }

        // If no layers were added, add default layers
        if (this.network.layers.length <= 1) {
            console.log("Setting up default layered network");

            layers = [
                new NeuronLayer(this.network, { name: "Input Layer", neuronCount: 3, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Hidden Layer 1",  neuronCount: 5, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Hidden Layer 2",  neuronCount: 7, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Hidden Layer 3",  neuronCount: 5, biasCount: 1 }),
                new NeuronLayer(this.network, { name: "Output Layer",  neuronCount: 1 }),
            ];

            this.network.appendLayers(layers);
            this.network.connect();
        }

        this.isSetup = true;

        // If the first arg is a function, use it as the getInputValues() method which is the mechanism for feeding input into the network
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
        const network = this.network;
        if (!network) return;

        this.network.updatePositions();
        super.refreshCanvas();
        this.network.draw();
    }

    static testXor(epocs = 1000, testCount = 1, learningRate = 0.1) {
        // Setup
        let training_data = [
            {
                inputs: [0, 0],
                outputs: [0]
            },
            {
                inputs: [0, 1],
                outputs: [1]
            },
            {
                inputs: [1, 0],
                outputs: [1]
            },
            {
                inputs: [1, 1],
                outputs: [0]
            }
        ];

        const nn = new MatrixNeuroApp(2, 8, 4, 1);
        nn.setLearningRate(learningRate);
        
        for (let tc = 0; tc < testCount; tc++) {
            // Train
            for (let i = 0; i < epocs; i++) {
                const data = random(training_data);
                nn.train(data.inputs, data.outputs);
            }
        }


        return nn;
    }
}