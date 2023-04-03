import ActivationFunction from "../components/activation-function.js";
import App from "../../common/app.js";
import MatrixNeuroApp from "./app.matrix-neuro.js";
import NeuronLayer from "../components/neuron-layer.js";
import Neuron from "../components/neuron.js";
import NeuronRunner from "../components/neuron-runner.js";
import NeuronConnector from "../components/neuron-connector.js";
import FeedForwardNueralNetwork from "../networks/feed-forward.js";

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
    static retry = 0;

    static init(NeuronDrawer) {
        if (!!NeuronDrawer) { 
            if (typeof NeuronDrawer.drawNeuron !== "function") throw new Error("NeuronApp.init: NeuronDrawer.drawNeuron is not a function.");
            Neuron.defaultDrawer.draw = NeuronDrawer.drawNeuron;
            
            if (typeof NeuronDrawer.drawNeuronConnector !== "function") console.warn("NeuronApp.init: NeuronDrawer.drawNeuronConnector is not a function. Neuron connectors will not be displayed.");
            else NeuronConnector.defaultDrawer.draw = NeuronDrawer.drawNeuronConnector;

            if (typeof NeuronDrawer.drawNeuronRunner !== "function") console.warn("NeuronApp.init: NeuronDrawer.drawNeuronRunner is not a function. Neuron runners will not be displayed.");
            else NeuronRunner.defaultDrawer.draw = NeuronDrawer.drawNeuronRunner;
        }
    }

    constructor(options, ...args) { 
        super(options, args);

        if (!options) options = { name: "Unnamed" };

        this.name = options?.name || "Neuro App";
        const sig = new ActivationFunction(ActivationFunction.sigmoid, ActivationFunction.sigmoidPrime, "Sigmoid");;
        this.network = new FeedForwardNueralNetwork(this, { squashFunction: sig });
        this.text = "Feed-Forward Neural Network";
        this.isAuto = false;
        this.isSetup = false;
        this.selectedNeurons = [];
        this.selectedKeys = {};
        this.messages = [];
        this.results = [];
        this.vectorHandler = options.vectorHandler;

        if (typeof document === "undefined") return;

        if (!document.getElementById(this.elementId)) {
            NeuroApp.retry++;
            if (NeuroApp.retry > 1) console.error("No canvas found with id: " + this.elementId + ". Aborting setup.");
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
        this.network.initWithMatrixNetwork(nn, { vectorHandler: this.vectorHandler });
    }

    animateRunners(count = 5) {
        const inputLayer = this.network.inputLayer;

        for (let i = 0; i < count; i++) { 
            const index = Math.floor(Math.random() * inputLayer.neurons.length);
            const n = inputLayer.neurons[index];
            this.network.createRunner(n, null, 15);
        }

        setTimeout(() => {
            const newCount = Math.floor(Math.random() * 5) + 1;
            this.animateRunners(count);
        }, 750);
    }

    handleMouseMove(e) { 
        const x = e.offsetX;
        const y = e.offsetY;

        const n = this.getNeuronAt(x, y);

        if (!!n) {
            const count = Math.floor(Math.random() * 8) + 2;
            for (let i = 0; i < count; i++) {
                const timing = Math.floor(Math.random() * 1500);

                setTimeout(() => {
                    this.network.createRunner(n, null, 15);
                }, timing);
            }
        }
    }

    addEventListeners() {
        const canvas = super.addEventListeners(true);
        
        if (!canvas || !this.network) return;

        //canvas.onmousemove = (e) => this.handleMouseMove(e);

        // Handle Key Presses and other events
        document.addEventListener("keydown", (e) => {
            const k = e.key.toLowerCase();
            this.selectedKeys[k] = true;

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

                    const trainedNetwork = NeuroApp.trainAndTestXor(new MatrixNeuroApp(2, 8, 4, 1), epocCount, 3);
                    this.network.initWithMatrixNetwork(trainedNetwork);

                    if (typeof this.refreshInputFields === "function") this.refreshInputFields();
                    else console.warn("No refreshInputFields() method found");
                    
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

    /**
     * Gets all the neurons in the network and returns them in a single array
     */
    getAllNeurons() { 
        const neurons = [];
        this.network.layers.map((layer) => {
            layer.neurons.map(n => neurons.push(n));
        });

        return neurons;
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

    static trainAndTestXor(matrixNet, epocs = 1000, testCount = 1, learningRate = 0.1) {
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

        matrixNet.setLearningRate(learningRate);
        
        for (let tc = 0; tc < testCount; tc++) {
            // Train
            for (let i = 0; i < epocs; i++) {
                const randomIndex = Math.floor(Math.random() * training_data.length);
                const data = training_data[randomIndex];

                matrixNet.train(data.inputs, data.outputs);
            }
        }


        return matrixNet;
    }
}

if (typeof module !== "undefined") module.exports = NeuroApp;
else console.log("NeuroApp not exported. Running in browser.");
