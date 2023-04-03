// if (typeof require !== "undefined") {
//     const ActivationFunction = require("../components/activation-function.js");
//     const NeuronRunner = require("../components/neuron-runner.js");
//     const MatrixNeuroApp = require("../apps/app.matrix-neuro.js");
//     const NeuronLayer = require("../components/neuron-layer.js");
// }

import ActivationFunction from '../components/activation-function.js';
import NeuronRunner from '../components/neuron-runner.js';
import MatrixNeuroApp from '../apps/app.matrix-neuro.js';
import NeuronLayer from '../components/neuron-layer.js';

/**
 * Logical and visual (Visualogical) representation of a standard FeedForward network.
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
 */
class FeedForwardNueralNetwork {
    constructor(app, options) {
        if (!app || typeof app.mounted !== "boolean")
            throw new Error("FeedForwardNueralNetwork must be created with an app (" + (typeof app) + ")");
        
        if (!options) options = {};

        this.app = app;
        this.networkType = 1;
        this.layers = options.layers;

        if (!Array.isArray(this.layers))
            this.layers = [];
        
        this.squashFunction = options.squashFunction;

        if (!(options.squashFunction instanceof ActivationFunction)) { 
            this.squashFunction = ActivationFunction.sigmoidActivationFunction; // Sigmoid by default
        }

        this.matrixNetwork = null;  // The matrix/math guts for training
        this.squash = this.squashFunction.squash;
        this.layerCount = this.layers.length;
        this.neuronCount = 0;
        this.inputLayer = null;
        this.outputLayer = null;

        // UI - Need to separate this
        this.position = null;
        this.runners = [];
    }

    initWithMatrixNetwork(matrixNeuroApp) {
        if (this.layers.length > 0) { 
            console.log("Skipping init of FeedForwardNueralNetwork because it already has layers");
            return;
        }
        
        if (!(matrixNeuroApp instanceof MatrixNeuroApp))
            throw new Error("Cannot setup from matrix when matrix is not a MatrixNeuroApp");

        let i = 0;
        let layers = [];

        for (i = 0; i < matrixNeuroApp.neuronCounts.length - 1; i++) {
            const neuronCount = matrixNeuroApp.neuronCounts[i] + 1; // +1 for bias. The visual feed forward network holds biases as neurons in the feeding layer
            const name = i === 0 ? "Input Layer" : "Hidden Layer " + i;
            const options = { name: name, neuronCount: neuronCount, biasCount: 1 };
            const hiddenLayer = new NeuronLayer(this, options)

            layers.push(hiddenLayer);
        }

        const outputsCount = matrixNeuroApp.neuronCounts[matrixNeuroApp.neuronCounts.length - 1];
        const outputLayer = new NeuronLayer(this, { name: "Output Layer", neuronCount: outputsCount, biasCount: 0 })
        layers.push(outputLayer);

        this.appendLayers(layers);
        this.connect(0);

        for (let layerIndex = 1; layerIndex < this.layerCount; layerIndex++) {
            const prevIndex = layerIndex - 1;
            const currentLayer = this.layers[layerIndex];
            const weightMatrix = matrixNeuroApp.weightMatrices[prevIndex]; // row,col => hidden0, input

            // Loop through the next layer's neurons
            for (let n = 0; n < currentLayer.neuronCount; n++) {
                const neuron = currentLayer.neurons[n];

                if (neuron.backConnectors.length === 0) break;  // Probably the bias neuron if it has no back connectors

                const matrixWeights = weightMatrix.items[n];    // <-- These should mirror the back connectors at this point

                // Loop through the current neuron's back connectors
                let ci;
                for (ci = 0; ci < neuron.backConnectors.length - 1; ci++) {
                    const connector = neuron.backConnectors[ci];
                    connector.weight = matrixWeights[ci];
                }

                // This back connector should be connecting to the bias neuron
                const biasWeights = matrixNeuroApp.biases[prevIndex].items[n];
                const biasWeight = biasWeights[0];
                neuron.backConnectors[ci].weight = biasWeight;
            }
        }

        this.runners = [];
        this.matrixNetwork = matrixNeuroApp;
    }

    createRunner(neuron, target = null, speed = 5) {
        const wayPoints = NeuronRunner.createRandomConnectorMap(neuron);
        console.warn("Waypoints: " + wayPoints.length);

        const options = {
            wayPoints: wayPoints,
            neuron: neuron,
            speed: speed,
            twoWay: true
        };

        const runner = new NeuronRunner(this, options);

        this.runners.push(runner);
        runner.run();

        console.log("Runner Created: " + runner.id);
        return runner;
    }

    removeRunner(runner) { 
        const index = this.runners.indexOf(runner);
        if (index < 0) return false;

        this.runners.splice(index, 1);

        return true;
    }

    setupFromOld(matrixNeuroApp) {
        if (this.layers.length > 0) throw new Error("Cannot setup from matrix when layers already exist");
        if (!(matrixNeuroApp instanceof MatrixNeuroApp)) throw new Error("Cannot setup from matrix when matrix is not a MatrixNeuroApp");

        let i = 0;
        let j = 0;
        let rowIndex, columnIndex;

        // Create the first layer (input layer)
        let layers = [new NeuronLayer(this, { name: "Input Layer", neuronCount: matrixNeuroApp.input_nodes + 1, biasCount: 1 })];

        // Create the hidden layers
        for (i = 0; i < matrixNeuroApp.hidden_nodes.length; i++) {
            const hiddenLayerNeuronCount = matrixNeuroApp.hidden_nodes[i] + 1;  // +1 for bias
            const hiddenLayer = new NeuronLayer(this, { name: "Hidden Layer " + i, neuronCount: hiddenLayerNeuronCount, biasCount: 1 })
            layers.push(hiddenLayer);
        }

        // Create the output layers
        const outputLayer = new NeuronLayer(this, { name: "Output Layer", neuronCount: matrixNeuroApp.output_nodes });
        layers.push(outputLayer);

        // Add the layers and connect
        this.appendLayers(layers);
        this.connect(0);

        console.log("Connected with " + this.layers.length + " layers [" + (typeof matrixNeuroApp.hidden_nodes[0]) + "]");
        

        // ** Set the weights for inputs => hidden0

        const firstHiddenLayerNeuronCount = matrixNeuroApp.hidden_nodes[0];
        for (rowIndex = 0; rowIndex < firstHiddenLayerNeuronCount; rowIndex++) {
            const hiddenNeuron = this.layers[1].neurons[rowIndex];

            for (columnIndex = 0; columnIndex < hiddenNeuron.backConnectors.length - 1; columnIndex++) { 
                const inputToHidden0Row = matrixNeuroApp.weights_ih.items[rowIndex]; // row,col => hidden0, input
                const weight = inputToHidden0Row[columnIndex];

                if (typeof weight !== "number") throw new Error("Invalid weight: " + weight + " (" + (typeof weight) + ")");
                hiddenNeuron.backConnectors[columnIndex].weight = weight;
            }
        }

        // Add the bias weight to the input => hidden0 layer
        const hidden0BiasMatrix = matrixNeuroApp.bias_h[0];
        const inputBiasNeuron = this.layers[0].neurons[this.layers[0].neurons.length - 1];

        for (i = 0; i < firstHiddenLayerNeuronCount; i++) {
            inputBiasNeuron.forwardConnectors[i].weight = hidden0BiasMatrix.items[i][0];
        }

        // ** Set weights for inner hidden layers.
        // ** Technically, there may not be any, but not sure how useful a 3-layer nn would be (input => one hidden => output) but I've seen stranger things ** /

        console.log("Converting inner hidden layer (" + matrixNeuroApp.weights_hh.length + ")");
        for (i = 1; i < matrixNeuroApp.hidden_nodes.length; i++) {
            const idx = i - 1;
            const hiddenNeuronCount = matrixNeuroApp.hidden_nodes[i];

            for (rowIndex = 0; rowIndex < hiddenNeuronCount; rowIndex++) {
                const hiddenNeuron = this.layers[i + 1].neurons[rowIndex];  // row

                for (columnIndex = 0; columnIndex < hiddenNeuron.backConnectors.length - 1; columnIndex++) {
                    const prevToCurrentRow = matrixNeuroApp.weights_hh[idx].items[rowIndex]; // row,col => hidden0, input
                    const weight = prevToCurrentRow[columnIndex];

                    if (typeof weight !== "number") throw new Error("Invalid weight: " + weight + " (" + (typeof weight) + ")");
                    hiddenNeuron.backConnectors[columnIndex].weight = weight;
                }
            }

            // Add the biases weight to the hidden[n - 1] => hidden[n] layer
            const hidden0BiasMatrix = matrixNeuroApp.bias_h[idx];
            const biasNeuron = this.layers[i].neurons[this.layers[i].neurons.length - 1];   // Last neuron in the layer

            for (i = 0; i < hiddenNeuronCount; i++) {
                biasNeuron.forwardConnectors[i].weight = hidden0BiasMatrix.items[i][0];
            }
        }

        // ** Final hidden layer => output layer conversion ---------------------- ** /
        
        // Set the weights for hidden0 => output
        const lastHiddenLayer = this.layers[this.layers.length - 2];
        const nnLastHiddenLayerNeuronCount = matrixNeuroApp.hidden_nodes.length > 0 ? matrixNeuroApp.hidden_nodes[matrixNeuroApp.hidden_nodes.length - 1] : matrixNeuroApp.input_nodes;

        console.log("Converting hidden.last[" + nnLastHiddenLayerNeuronCount + "] => output layer");
        for (i = 0; i < matrixNeuroApp.output_nodes; i++) {
            const matrixRow = matrixNeuroApp.weights_ho.items[i];
            const outputNeuron = this.outputLayer.neurons[j];

            for (j = 0; j < nnLastHiddenLayerNeuronCount; j++) {
                const weightMatrix = matrixRow[j];
                outputNeuron.backConnectors[j].weight = weightMatrix;
            }
        }

        // Add the bias weight to the hidden0 => output layer
        const biasNeuron = lastHiddenLayer.neurons[lastHiddenLayer.neurons.length - 1]
        for (i = 0; i < this.outputLayer.neuronCount; i++) {
            for (let n = 0; n < matrixNeuroApp.output_nodes; n++) { 
                const baisWeightMatrix = matrixNeuroApp.bias_o.items[i][n];
                biasNeuron.forwardConnectors[n].weight = baisWeightMatrix;
            }
        }

        this.matrixNetwork = matrixNeuroApp;
    }

    appendLayer(layer) {
        if (!layer) throw new Error("Invalid layer to append");
        this.appendLayers([layer]);

        return layer;
    }

    appendLayers(layers) { 
        if (!Array.isArray(layers)) throw new Error("Invalid layers to append. Try appendLayer(layer) for non-array layers");
        
        this.layers.push(...layers);
        this.refreshLayout();

        return layers;
    }

    insertLayer(layer, atIndex) {
        if (!layer) throw new Error("Invalid layer to insert");
        return this.insertLayers([layer], atIndex);
    }

    insertLayers(layers, atIndex) { 
        if (atIndex < 0 || atIndex >= this.layerCount === 0)
            return this.appendLayers(layers);
        
        if (!Array.isArray(layers))
            throw new Error("Invalid layers to insert. Try insertLayer(layer) for non-array layers");

        this.layers.splice(atIndex, 0, ...layers);
        this.refreshLayout();

        return layers;
    }

    /**
     * Connects all of the layers with connectors
     */
    connect(initialWeightValue = null) { 
        for (let i = 0; i < this.layerCount; i++)
            this.layers[i].connect(initialWeightValue);
    }
    
    setWeightMatrix(matrix) { 
        //
    }

    randomizeWeights() { 
        for (let i = 0; i < this.layerCount; i++)
            this.layers[i].randomizeWeights();
    }

    execute(inputs) {
        if (!Array.isArray(inputs)) throw new Error("Invalid inputs to submit");

        if (inputs.length !== this.inputLayer.neuronCount) {
            if (this.inputLayer.neuronCount - inputs.length === 1) inputs.push(1.0);
            else throw new Error("Invalid input count. Expected " + this.inputLayer.neuronCount + " but got " + inputs.length);
        }
        
        // Copy to input layer
        for (let i = 0; i < inputs.length; i++) {
            const n = this.inputLayer.neurons[i];
            n.value = inputs[i];
            n.rawValue = n.value;
        }

        for (let i = 1; i < this.layerCount; i++) {
            this.layers[i].activate();
        }

        return this.outputLayer.getValues();
    }

    executeMatrix(inputs) {
        if (!this.matrixNetwork) throw new Error("No neural network to execute");
        return this.matrixNetwork.test(inputs, true);
    }

    trainXor(epocs = 100, maxErrorValue = 0.05) {
        return 0;
    }

    reset() { 
        for (let i = 0; i < this.layerCount; i++) {
            this.layers[i].reset();
        }
    }

    refreshLayout() { 
        this.layerCount = this.layers.length;
        this.inputLayer = this.layers[0];
        this.outputLayer = this.layers[this.layerCount - 1];

        let nc = 0;
        let i = 0;

        for (i = 0; i < this.layerCount; i++) {
            const layer = this.layers[i];
            layer.index = i;
            layer.setLayout();

            nc += layer.neurons.length;
        }

        this.neuronCount = nc;
    }

    updatePositions() { 
        // Update the positions of the layers
        let i;
        const layerCount = this.layerCount;

        for (i = 0; i < layerCount; i++) { 
            this.layers[i].updatePositions();
        }

        for (i = 0; i < this.runners.length; i++) { 
            const runner = this.runners[i];
            runner.updatePosition();
        }

        return layerCount;
    }

    draw() { 
        let i = 0;

        for (i = 0; i < this.layers.length; i++) { 
            // Draw the layer
            this.layers[i].draw();
        }

        for (i = 0; i < this.runners.length; i++) { 
            const runner = this.runners[i];
            runner.draw();
        }
        
    }
}

if (typeof module === 'undefined') {
    console.log("Can't export. Running FeedForwardNueralNetwork in-browser");
} else { 
  module.exports = FeedForwardNueralNetwork;
}
