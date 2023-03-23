/**
 * Notes:
 *      layerDerivatives[n] = Neuron.error
 *      weightErrors = Neuron.error
 *      thresholdsDerivatives, layerThresholdsDerivatives = ?? // Used to sum connector.weightError
 *      thresholdsUpdates = Neuron.thresholdDelta
 */
class Neuron { 
    static maxWeightValue = 24;
    static defaultBackgroundColor = "black";

    static randomWeight(miniMaxValue = null) {
        miniMaxValue = typeof miniMaxValue !== "number" || miniMaxValue === 0 ?
            Neuron.maxWeightValue :
            miniMaxValue;

        const low = -Math.abs(miniMaxValue);
        const high = Math.abs(miniMaxValue);

        return Math.random() * (high - low) + low;
    }

    static defaultColor = "#FFFFFF88";

    constructor(layer, options) { 
        if (!layer) throw new Error("Neuron must be created with a layer");
        if (!options) options = {};

        this.layer = layer;
        this.activationFunction = layer.network.activationFunction;
        this.index = options.index;
        this.forwardConnectors = [];
        this.backConnectors = [];
        
        this.threshold = 0.0;
        this.thresholdDerivative = 0.0;
        this.prevThresholdDerivative = 0.0;
        this.thresholdDelta = 0.0;  // ?? not sure yet.
        this.delta = 0.0;   // The sum of all the (error * activationValue * (1 - activiationValue)) from the next (to the right) layer

        this.error = 0.0;   // The sum of all the error from the next (to the right) layer
        this.isBias = (options.isBias === true);
        this.isSelected = (options.isSelected === true);
        this.label = null;
        this.weightTotal = 0;

        // Neuron border color
        if (!options.color) options.color = Neuron.defaultColor;
        this.agent = new Agent(options);
        this.agent.onPositionUpdate = this.onAgentMove;

        if (this.isBias) {
            this.agent.color = options.color || "#88FFFF";
            this.agent.backgroundColor = this.agent.color;
            this.rawValue = 1.0;  //typeof options.rawValue === "number" ? options.rawValue : 1.0;
            this.value = 1.0;  //typeof options.value === "number" ? options.value : 1.0;
        } else {
            this.rawValue = typeof options.rawValue === "number" ? options.rawValue : 0;
            this.value = typeof options.value === "number" ? options.value : 0;
        }

        this.didDraw = false;
        this.squash = this.activationFunction.activate;
        this.deSquash = this.activationFunction.getDerivative;
        this.deSquashPartial = this.activationFunction.getPartialDerivative;

        if (typeof this.index !== "number" || this.index < 0)
            this.index = layer.neurons.length;
    }

    /**
     * 
     * @param {NeuronLayer|null} nextLayer - Next layer to connect to
     * @param {NeuronLayer|null} prevtLayer - Previous layer to connect from
     * @returns 
     */
    connect(nextLayer, prevLayer) {
        let connectors = [];

        if (!!nextLayer) { 
            for (let i = 0; i < nextLayer.neurons.length; i++) {
                const n = nextLayer.neurons[i];

                if (n.isBias !== true) { 
                    const c = new NeuronConnector(this, n);
                    connectors.push(c);
                }
            }

            this.forwardConnectors = connectors;
        }

        if (!!prevLayer) {
            let backConnectors = [];

            for (let i = 0; i < prevLayer.neurons.length; i++) {
                const n = prevLayer.neurons[i];
                const connectors = n.forwardConnectors.filter(c => c.dest === this);

                backConnectors.push(...connectors);
            }

            this.backConnectors = backConnectors;
        }

        return this;
    }

    randomizeWeights(miniMaxValue = null) { 
        const connectorCount = this.forwardConnectors.length;

        miniMaxValue = typeof miniMaxValue !== "number" || miniMaxValue === 0 ?
            Neuron.maxWeightValue :
            miniMaxValue;

        for (let i = 0; i < connectorCount; i++)
            this.forwardConnectors[i].weight = Neuron.randomWeight(miniMaxValue);
    }

    activate() {
        if (this.backConnectors.length === 0) return this.value;

        let wt = this.threshold;
        const rawValues = this.backConnectors.map(c => { 
            wt += c.weight;
            return c.calculate();
        });

        this.weightTotal = wt;
        this.rawValue = rawValues.reduce((a, b) => a + b, 0) + this.threshold;
        this.value = this.squash(this.rawValue);

        return this.value;
    }

    /**
     * Back props all the forward connectors, which is to say that it calculates all the errors pulled from the next layer over. Be sure the forward layer neuron's errirs are already calculated
     * Try 1. Errors only (no deltas) ---- current
     * Try 2. Errors and deltas
     * @param {number} learningRate - Learning rate
     * @returns 
     */
    backPropagate() {
        const len = this.forwardConnectors.length;

        if (len === 0) {    // This should never run because we don't backpropagate the output layer
            throw new Error("Back propogation on output layer is not allowed");
        }
        
        let errorTotal = 0;

        for (let j = 0; j < len; j++) {
            const connector = this.forwardConnectors[j];
            const nextLayerNeuron = connector.dest;
            errorTotal += nextLayerNeuron.error * connector.weight;
        }

        this.error = errorTotal * this.deSquashPartial(this.value);
        //this.delta = 0;  //this.error; // * this.deSquash(this.value); //this.value * (1 - this.value);
    }

    /**
     * Calculates the gradient for the back connectors. Make sure backPropagate() is called first
     */
    calculateGradient() {
        const len = this.backConnectors.length;

        if (len === 0) {
            // Input layer; no previous connectors
            return;
        }

        for (let j = 0; j < len; j++) {
            const connector = this.backConnectors[j];
            const prevNeuron = connector.source;
            connector.weightDerivative += this.error * prevNeuron.value;
        }

        this.thresholdDerivative += this.error;
    }

    /**
     * Updates the weights of the outgoing (forward) connectors. Make sure backPropagate() is called first
     * @param {number} learningRate - Learning rate
     * @returns 
     */
    updateWeights(errIncrease = false) {
        const len = this.backConnectors.length;
        const etaPlus = 1.01;
        const deltaMax = 2.0;

        let s;

        // Update back connector weights
        for (let j = 0; j < len; j++) {
            const connector = this.backConnectors[j];
            s = connector.prevWeightDerivative * connector.weightDerivative;

            if (s >= 0) {
                if (s > 0) connector.weightDelta = Math.min(connector.weightDelta * etaPlus, deltaMax);
                connector.weight -= Math.sign(connector.weightDerivative) * connector.weightDelta;
                connector.prevWeightDerivative = connector.weightDerivative;
            } else {
                connector.weightDelta = Math.max(connector.weightDelta * etaPlus, deltaMax);
                connector.prevWeightDerivative = 0;
            }
        }

        s = this.prevThresholdDerivative * this.thresholdDerivative;

        if (s >= 0) {
            if (s > 0) this.thresholdDelta = Math.min(this.thresholdDelta * etaPlus, deltaMax);
            this.threshold -= Math.sign(this.thresholdDerivative) * this.thresholdDelta;
            this.prevThresholdDerivative = this.thresholdDerivative;
        } else { 
            this.thresholdDelta = Math.max(this.thresholdDelta * etaPlus, deltaMax);
            this.thresholdDerivative = 0;
        }
    }

    reset(deltas = 0) { 
        this.threshold = 0;
        this.thresholdDelta = 0;
        this.previousThresholdDelta = 0;
        this.delta = deltas;
        this.value = 0;
        this.rawValue = 0;

        return this;
    }

    /**
     * Everything below here is for drawing, event handling, and ui purposes (p5)
     */

    select() {
        this.isSelected = !this.isSelected;
        console.log("Select: " + this.isSelected);
        return this.isSelected ? this : null;
    }

    isAt(x, y) { 
        const p = this.agent.position;
        return dist(x, y, p.x, p.y) < this.agent.size;
    }

    /**
     * Fires any time the agent updates position
     */
    onAgentMove() {
        //
    }

    /**
     * Draws the neuron
     * @param {number} layerIndex - Index of the drawn neuron - For drawing purposes only
     */
    draw(layerIndex) {
        const agent = this.agent;
        const pos = agent.position;
        const size = agent.size;
        const agentColor = agent.color;
        const backgroundColor = agent.backgroundColor || Neuron.defaultBackgroundColor;

        const colorOverride = this.isSelected ? "yellow" : agentColor;

        // Draw Connectors First
        for (let i = 0; i < this.forwardConnectors.length; i++) {
            const color = this.isSelected ? colorOverride : null;
            this.forwardConnectors[i].draw(color);
        }
        
        // Draw the neuron
        noFill();
        textAlign(CENTER, CENTER);

        if (this.layer.index > 0) { 
            stroke(Math.abs(this.error) > 0.1 ? "pink" : "#FFFFFF33");

            let lbl = this.error.toFixed(3);
            if (!!this.label) lbl += ": " + this.label;

            text(lbl, pos.x, pos.y + 64);
        }

        // Raw value always dimmed
        stroke(this.isSelected ? "#FFFF0066" : "#FFFFFF33");
        text("R:" + this.rawValue.toFixed(3), pos.x, pos.y + 44);

        stroke(colorOverride);
        text(this.value.toFixed(3), pos.x, pos.y + 24);
        
        if (!!backgroundColor) fill(backgroundColor);
        else noFill();

        strokeWeight(1);
        ellipse(pos.x, pos.y, size, size);
    }

}
