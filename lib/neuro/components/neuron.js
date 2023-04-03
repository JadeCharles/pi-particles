import VectorHandler from '../../common/vector-handler.js';
import Agent from '../../common/agent.js';
import NeuronConnector from './neuron-connector.js';
import NeuronLayer from './neuron-layer.js';

/**
 * Logical representation of a neuron in a neural network. 
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
 * 
 * @requires: VectorHandler
 * @requires: Agent
 * @requires: NeuroApp
 */
class Neuron { 
    static maxWeightValue = 24;
    static defaultBackgroundColor = "black";
    static defaultDrawer = {
        draw: (position, sender) => { 
            throw new Error("Neuron: No drawer specified.");
        },
    };
    
    static randomWeight(miniMaxValue = null) {
        miniMaxValue = typeof miniMaxValue !== "number" || miniMaxValue === 0 ?
            Neuron.maxWeightValue :
            miniMaxValue;

        const low = -Math.abs(miniMaxValue);
        const high = Math.abs(miniMaxValue);

        return Math.random() * (high - low) + low;
    }

    static moveNeuronPosition = (neuron) => { 
        if (!neuron.targetPos) return false;

        const app = neuron.app;
        if (!app) return false;

        if (typeof app.lastMouseX !== "number" || typeof app.lastMouseY !== "number")
            return;

        const pos = neuron.agent.position;

        const diff = this.vectorHandler.sub(neuron.targetPos, pos);
        const dist = this.vectorHandler.mag(diff);

        if (dist <= neuron.speed) {
            neuron.agent.position = this.vectorHandler.setValues(neuron.agent.position, neuron.targetPos);
            neuron.targetPos = null;

            return;
        }

        diff = this.vectorHandler.normalize(diff);

        this.vectorHandler.mult(diff, neuron.speed, true);
        this.vectorHandler.add(neuron.agent.position, diff, true);
    }

    static defaultColor = "#FFFFFF88";

    constructor(layer, options) { 
        if (!layer) throw new Error("Neuron must be created with a layer");
        if (!layer.app) throw new Error("Neuron must be created with a layer with an app");
        
        if (!options) options = {};

        this.layer = layer;
        this.app = layer.app;
        this.selectedColor = "yellow";
        this.vectorHandler = options.vectorHandler;
        this.drawer = options.drawer || Neuron.defaultDrawer;
        this.speed = 1.0;
        this.squashFunction = layer.network.squashFunction;
        this.index = options.index;
        this.forwardConnectors = [];
        this.backConnectors = [];
        this.targetPos = null;
        this.error = 0.0;   // The sum of all the error from the next (to the right) layer

        this.isBias = (options.isBias === true);
        this.isSelected = (options.isSelected === true);
        this.label = null;
        this.weightTotal = 0;

        if (!(this.vectorHandler instanceof VectorHandler)) { 
            this.vectorHandler = typeof p5 !== "undefined" ?
                VectorHandler.createP5Handler() :
                new VectorHandler();
        }

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
        this.squash = this.squashFunction.squash;

        if (typeof this.squash !== "function") { 
            console.warn("this.squashFunction type: " + (typeof this.squashFunction).toString());
            console.warn("this.squash: " + (typeof this.squash));
            throw new Error("Invalid activation function: " + this.squash);
        }

        this.movePosition = typeof options.movePosition === "function" ?
            options.movePosition :
            () => Neuron.moveNeuronPosition(this);
        
        this.deSquash = this.squashFunction.getDerivative;
        this.deSquashPartial = this.squashFunction.getPartialDerivative;

        if (typeof this.index !== "number" || this.index < 0)
            this.index = layer.neurons.length;
    }

    setTargetPos(x, y) { 
        this.targetPos = createVector(x, y);
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

    /** Everything below here is for drawing, event handling, and ui purposes */
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

    /**
     * Optionally updates the position of the neuron, if that's your jam.
     * Set this.movePosition in your constructor to override it.
     */
    updatePosition() {
        this.movePosition();
    }

    /**
     * Draws the neuron
     * @param {object} parentPos - Index of the drawn neuron - For drawing purposes only
     */
    draw(parentPos) {
        const pos = !!parentPos ? this.vectorHandler.add(this.agent.position, parentPos) : this.agent.position;
        this.drawer.draw(pos, this);
    }
}

if (typeof module === 'undefined') {
    console.log("Can't export. Running Neuron in-browser");
} else { 
  module.exports = Neuron;
}
