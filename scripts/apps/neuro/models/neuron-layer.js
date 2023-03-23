class NeuronLayer { 
    constructor(network, options) { 
        if (!(network?.networkType > 0))
            throw new Error("Invalid network to create layer for: " + network);

        if (!options) options = {};

        this.network = network;
        this.index = network.layers.length;
        this.name = options.name || "";
        this.nerons = options.neurons;
        this.neuronSpace = 0;
        this.neuronMaxSize = 0;
        this.neuronMinSize = 9999999;
        this.biasCount = options.biasCount;

        if (!Array.isArray(this.neurons))
            this.neurons = [];
        
        if (typeof this.biasCount !== "number" || this.biasCount < 0) { 
            if (this.index === 0) this.biasCount = 0;
            else this.biasCount = 1;
        }
        console.warn("Bias Count for " + this.name + "[" + this.index + "]: " + this.biasCount);

        if (options.neuronCount > 0) { 
            const biasIndex = options.neuronCount - (this.biasCount);

            for (let i = 0; i < options.neuronCount; i++) { 
                const n = new Neuron(this, { index: i, isBias: (i >= biasIndex) });
                this.neurons.push(n);

                // Stuff for UI and layout
                this.neuronSpace += n.size;
                if (n.size > this.neuronMaxSize) this.neuronMaxSize = n.size;
                if (n.size < this.neuronMinSize) this.neuronMinSize = n.size;
            }
        }
        
        this.neuronCount = this.neurons.length;
        console.log(this.name + " created with " + this.neuronCount + " neurons");
    }

    getNextLayer() { 
        if (this.index >= this.network.layers.length - 1) return null;
        return this.network.layers[this.index + 1];
    }

    getPreviousLayer() {
        if (this.index <= 0) return null;
        return this.network.layers[this.index - 1];
    }

    getValues() { 
        return this.neurons.map((n) => n.value);
    }

    getErrors() {
        return this.neurons.map(n => n.error);
    }

    /**
     * Connects the neurons in this layer to the neurons in the next layer
     */
    connect() { 
        const nextLayer = this.getNextLayer();
        const prevLayer = this.getPreviousLayer();

        for (let i = 0; i < this.neurons.length; i++) {
            const n = this.neurons[i];
            n.connect(nextLayer, prevLayer);
        }
    }

    /**
     * Make sure the neuron deltas have already been set
     */
    backPropagate() { 
        const neruonCount = this.neuronCount;

        for (let i = 0; i < neruonCount; i++) {
            this.neurons[i].backPropagate();
        }
    }

    calculateGradients() { 
        const neruonCount = this.neuronCount;

        if (this.index === 0) {
            // Input layer; so we just calc err x inputvalue
            for (let i = 0; i < neruonCount; i++) {
                const n = this.neurons[i];
                const flen = n.forwardConnectors.length;

                for (let j = 0; j < flen; j++) {
                    const connector = n.forwardConnectors[j];
                    connector.weightDerivative += n.error * n.value;
                }

                n.thresholdDerivative += n.error;
            }

            return;
        }
        
        for (let i = 0; i < neruonCount; i++) {
            this.neurons[i].calculateGradient();
        }
    }

    /**
     * Make sure the neuron deltas have already been set
     * @param {number} learningRate - The learning rate to use for backpropagation
     */
    updateWeights(learningRate, momentum = 0.1) { 
        const neruonCount = this.neuronCount;

        for (let i = 0; i < neruonCount; i++) {
            this.neurons[i].updateWeights(learningRate, momentum);
        }
    }

    randomizeWeights() {
        for (let i = 0; i < this.neuronCount; i++)
            this.neurons[i].randomizeWeights();
    }

    /**
     * Takes the input from the previous layer and passes it through the neurons in this layer
     */
    activate() {
        for (let i = 0; i < this.neuronCount; i++) {
            const n = this.neurons[i];
            n.activate();
        }
    }
    
    reset(deltas) { 
        for(let i = 0; i < this.neuronCount; i++) { 
            const n = this.neurons[i];
            n.thresholdDelta = deltas;
            n.reset(deltas);
        }
    }

    /**
     * Everything below here is for UI
     */


    /**
     * Sets the positions of each neuron in the layer
     */
    setLayout(layerWidth = -1) { 
        const app = this.network.app;
        if (layerWidth <= 0) layerWidth = Math.floor(app.width / this.network.layers.length);

        const containerWidth = Math.floor(app.width / this.network.layerCount);
        const containerHeight = Math.floor(app.height / this.neuronCount);
        
        for (let i = 0; i < this.neurons.length; i++) { 
            const n = this.neurons[i];
            const x = (this.index * containerWidth) + (containerWidth / 2.0);
            const y = (i * containerHeight) + (containerHeight / 2.0);

            n.agent.position.set(x, y);
        }

        this.neuronCount = this.neurons.length;
    }

    /**
     * Everything below here is for p5
     */


    /**
     * Draws the neurons in this layer
     */
    draw() {
        //console.log("Drawing Layer: " + this.name);
        for(let i = 0; i < this.neuronCount; i++) { 
            this.neurons[i].draw(i);
        }
    }
}