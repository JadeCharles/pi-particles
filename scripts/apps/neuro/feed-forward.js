class FeedForwardNueralNetwork { 

    constructor(app, options) {
        if (!app || typeof app.mounted !== "boolean")
            throw new Error("FeedForwardNeuralNetwork must be created with an app (" + (typeof app) + ")");
        
        if (!options) options = {};

        this.app = app;
        this.networkType = 1;
        this.layers = options.layers;

        if (!Array.isArray(this.layers))
            this.layers = [];
        
        this.activationFunction = (options.activationFunction instanceof ActivationFunction) ?
            options.activationFunction :
            ActivationFunction.sigmoid; // Sigmoid by default

        this.layerCount = this.layers.length;
        this.neuronCount = 0;
        this.inputLayer = null;
        this.outputLayer = null;
    }

    appendLayer(layer) {
        if (!layer) throw new Error("Invalid layer to append");
        this.appendLayers([layer]);

        return layer;
    }

    appendLayers(layers) { 
        if (!Array.isArray(layers)) throw new Error("Invalid layers to append. Try appendLayer(layer) for non-array layers");

        console.log("Appending " + layers.length + " layers");
        
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

    connect() { 
        for (let i = 0; i < this.layerCount; i++)
            this.layers[i].connect();
    }
    
    randomizeWeights() { 
        for (let i = 0; i < this.layerCount; i++)
            this.layers[i].randomizeWeights();
    }

    submit(inputs) {
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

    trainXor(epocs = 100, maxErrorValue = 0.05) {
        const trainingSet = new TrainingSet();

        let i;
        for (i = 0; i < epocs; i++) {
            const err = trainingSet.trainEpoc(this, i) * 10000;
            if (err <= maxErrorValue) { 
                console.warn("Accuracy reached at epoc " + i + " with error " + err.toFixed(12));
                break;
            }
        }

        const epocCount = i;

        let results = [];
        for (i = 0; i < trainingSet.inputList.length; i++) {
            const inputs = trainingSet.inputList[i];
            const expected = trainingSet.expectedOutputList[i];
            results.push(trainingSet.test(this, inputs, expected));
        }

        console.log("Test Results after " + (epocCount + 1) + " epocs");
        console.table(results);

        return trainingSet.updateError();
    }

    train(inputs, expectedOutputs, learningRate = 0.03) {
        if (expectedOutputs.length !== this.outputLayer.neuronCount)
            throw new Error("Invalid output count. Expected " + this.outputLayer.neuronCount + " but got " + expectedOutputs.length);
        
        // Submit the inputs
        const outputValues = this.submit(inputs, true);
        const outputLayer = this.outputLayer;
        let sumOfSquareErrors = 0.0;

        // Calculate the errors on the output layer
        for (let i = 0; i < outputValues.length; i++) {
            const outputValue = outputValues[i];
            const n = outputLayer.neurons[i];

            let error = outputValue - expectedOutputs[i];
            error = error * n.deSquashPartial(outputValue);

            n.error = error;

            sumOfSquareErrors += (error * error);   // We are litterally summing the squares here.
        }

        // Backpropagate the errors through the hidden layers
        for (let k = this.layerCount - 2; k >= 0; k--) {
            this.layers[k].backPropagate(learningRate);
        }

        // Calculate the gradients (maybe we can do this in the backprop step)
        for (let k = 0; k < this.layerCount; k++) {
            this.layers[k].calculateGradients();
        }

        // Update all weights of the connectors
        for (let k = 0; k < this.layerCount; k++) {
            this.layers[k].updateWeights(learningRate);
        }

        return (sumOfSquareErrors / 2.0);
    }

    squashOutput() {
        const rawValues = this.outputLayer.neurons.map(n => n.value);
        const newValues = Neuron.softmax(rawValues);
        
        newValues.map((v, i) => this.outputLayer.neurons[i].value = v);

        return newValues;
    }

    reset(weightDeltas = 0.0125) { 
        for (let i = 0; i < this.layerCount; i++) {
            this.layers[i].reset(weightDeltas);
        }
    }

    refreshLayout() { 
        this.layerCount = this.layers.length;
        this.inputLayer = this.layers[0];
        this.outputLayer = this.layers[this.layerCount - 1];

        let nc = 0;
        let i = 0;

        const layerWidth = Math.floor(this.app.width / this.layerCount);

        for (i = 0; i < this.layerCount; i++) {
            this.layers[i].index = i;
            this.layers[i].setLayout(layerWidth);
            nc += this.layers[i].neurons.length;
        }

        this.neuronCount = nc;

        console.log("Layout Refreshed with " + i + " layers, and " + nc + " neurons");
    }

    draw() { 
        let layerIndex = 0;

        for (let layer of this.layers) { 
            // Draw the layer
            layer.draw(layerIndex);
        }
    }
}

