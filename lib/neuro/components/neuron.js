/**
 * Logical representation of a neuron in a neural network. 
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
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
        this.selectedColor = "yellow";
        this.activationFunction = layer.network.activationFunction;
        this.index = options.index;
        this.forwardConnectors = [];
        this.backConnectors = [];
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
        this.squash = this.activationFunction.squash;

        if (typeof this.squash !== "function") { 
            console.warn("this.activationFunction type: " + (typeof this.activationFunction).toString());
            console.warn("this.squash: " + (typeof this.squash));
            throw new Error("Invalid activation function: " + this.squash);
        }

        this.movePosition = typeof options.movePosition === "function" ? options.movePosition : () => false;
        this.deSquash = this.activationFunction.getDerivative;
        this.deSquashPartial = this.activationFunction.getPartialDerivative;

        if (typeof this.index !== "number" || this.index < 0)
            this.index = layer.neurons.length;
    }

    /**
     * Connects this neuron to the next and prev layers
     * @param {NeuronLayer|null} nextLayer - Next layer to connect to
     * @param {NeuronLayer|null} prevtLayer - Previous layer to connect from
     * @returns {Neuron} - Return this to allow for chaining
     */
    connect(nextLayer, prevLayer, initialWeightValue = null) {
        let connectors = [];

        if (!!nextLayer) { 
            for (let i = 0; i < nextLayer.neurons.length; i++) {
                const n = nextLayer.neurons[i];

                if (n.isBias !== true) { 
                    const options = { weight: initialWeightValue };
                    const c = new NeuronConnector(this, n, options);
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

        let wt = 0;
        const rawValues = this.backConnectors.map(c => { 
            wt += c.weight;
            return c.calculate();
        });

        this.weightTotal = wt;
        this.rawValue = rawValues.reduce((a, b) => a + b, 0);
        this.value = this.squash(this.rawValue);

        return this.value;
    }

    reset(deltas = 0) { 
        return this;
    }

    /** Everything below here is for drawing, event handling, and ui purposes (p5) */
    select() {
        this.isSelected = !this.isSelected;
        console.log("Clicked: Layer Index " + this.layer.index + ", Neuron Index:" + this.index + ", Selected" + this.isSelected);
        
        if (this.isSelected) {
            // Do something.
        }

        return this.isSelected ? this : null;
    }

    isAt(x, y) {
        const p = this.agent.position;
        return dist(x, y, p.x, p.y) < this.agent.size;
    }

    /** Fires any time the agent updates position */
    onAgentMove() {
        //
    }

    /** Optionally updates the position of the neuron, if that's your jam */
    updatePosition() {
        this.movePosition();
    }

    /**
     * Draws the neuron
     * @param {p5.Vector} parentPos - Index of the drawn neuron - For drawing purposes only
     */
    draw(parentPos) {
        const agent = this.agent;
        const pos = !!parentPos ? p5.Vector.add(agent.position, parentPos) : agent.position;
        const size = agent.size;
        const agentColor = agent.color;
        const backgroundColor = agent.backgroundColor || Neuron.defaultBackgroundColor;
        const colorOverride = this.isSelected ? this.selectedColor : agentColor;

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

        stroke(colorOverride);
        text(this.value.toFixed(3), pos.x, pos.y + 24);

        // Raw value always dimmed
        // stroke(this.isSelected ? "#FFFF0066" : "#FFFFFF33");
        // text("R:" + this.rawValue.toFixed(3), pos.x, pos.y + 44);
        
        if (!!backgroundColor) fill(backgroundColor);
        else noFill();

        strokeWeight(1);
        ellipse(pos.x, pos.y, size, size);
    }
}
