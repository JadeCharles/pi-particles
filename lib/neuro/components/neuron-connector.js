if (typeof require !== "undefined") { 
    const Neuron = require("./neuron.js");
}

/**
 * Logical representation of a neural network's neuron weight connection.
 * The matrix version (which does all the real work) gets converted to this for visual and intuitive representation.
 */
class NeuronConnector {
    static _nonce = 0;
    /** Uses p5.js - Make sure it's included */
    static defaultDrawer = {
        draw: (position, sender) => {
            if (NeuronConnector._nonce === 0) { 
                console.error("NeuronRunner: No drawer specified. Neuron Connectors will not be drawn.");
                NeuronConnector._nonce++;
            }
        },
    };
    
    constructor(source, dest, ...args) { 
        if (!source) throw new Error("NeuronConnector must have a source neuron");
        if (!dest) throw new Error("NeuronConnector must have a destination neuron");

        this.id = (Math.random() * 9999999999).toString(36) + "-" + (new Date()).getTime().toString()
        this.source = source;
        this.dest = dest;
        this.drawer = NeuronConnector.defaultDrawer;
        this.didDraw = false;
        this.label = null;

        const options = args?.length > 0 ? args[0] : {};
      
        this.weight = typeof options === "number" ? options : options.weight;
        this.weightDelta = 0.0;
        this.rawValue = 0.0;
        this.contributionPercent = 0.0;

        this.color = args?.length > 1 ? args[1] : (options.color || "#FFFFFF55");
        this.colorWeight = 0;

        if (typeof this.weight !== "number")
            this.weight = Neuron.randomWeight();
    }

    /**
     * Calculates the source neuron's activated value * weight
     * @param {string|null} label - Label to draw on the connector (optional)
     * @returns {number} - The activated value of the neuron
     */
    calculate(label = null) {
        if (typeof this.source?.value !== "number") throw new Error("NeuronConnector must have a source neuron");
        if (typeof this.weight !== "number") throw new Error("NeuronConnector must have a value");

        this.label = label;
        const v = this.source.value * this.weight;

        this.rawValue = v;
        this.colorWeight = v;

        return v;
    }

    /**
     * Draws the neuron
     * @param {number} layerIndex - Index of the drawn neuron - For drawing purposes only
     */
    draw(color = null) {
        this.drawer.draw(null, this);
    }
}


if (typeof module === 'undefined') {
    console.log("Can't export. Running NeuronConnector in-browser");
} else { 
  module.exports = NeuronConnector;
}
