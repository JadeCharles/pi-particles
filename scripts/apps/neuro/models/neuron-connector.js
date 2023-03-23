/**
 * Notes:
 *      weightsDerivatives, layerWeightsDerivatives[n] = Connector.weightDerivative
 *      weightsPreviousDerivatives[n] = Connector.prevWeightDerivative
 *      weightsUpdates[n] = Connector.weightDelta
*/
class NeuronConnector {
    constructor(source, dest, ...args) { 
        if (!source) throw new Error("NeuronConnector must have a source neuron");
        if (!dest) throw new Error("NeuronConnector must have a destination neuron");

        this.id = (Math.random() * 9999999999).toString(36) + "-" + (new Date()).getTime().toString()
        this.source = source;
        this.dest = dest;
        this.didDraw = false;
        this.label = null;

        const options = args?.length > 0 ? args[0] : {};
        this.weight = typeof options === "number" ? options : options.weight;
        this.weightDelta = 0.0;
        this.weightDerivative = 0.0;    // The sum of the dest neuron errors * previous neuron's value
        this.prevWeightDerivative = 0.0;

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
        const activatedValue = this.source.value * this.weight;
        this.colorWeight = activatedValue;

        return activatedValue;
    }

    /**
     * Draws the neuron
     * @param {number} layerIndex - Index of the drawn neuron - For drawing purposes only
     */
    draw(color = null) {

        if (typeof color !== "string") color = this.color;
        const p1 = this.source.agent.position;
        const p2 = this.dest.agent.position;

        strokeWeight(1);

        const isSelected = this.source.isSelected || this.dest.isSelected;

        const c = (this.weight + Neuron.maxWeightValue) / (Neuron.maxWeightValue * 2);
        if (isSelected) {
            stroke("rgba(255, 255, 0, " + c.toFixed(2) + ")");
        } else { 
            stroke("rgba(255, 255, 255, " + c.toFixed(2) + ")");
        }

        line(p1.x, p1.y, p2.x, p2.y);

        const m = p5.Vector.sub(p2, p1).mult(0.2);
        const p3 = p5.Vector.add(p1, m.mult((this.source.index % 4) + 1));

        noFill();
        textAlign(CENTER, CENTER);
        text(this.weight.toFixed(3), p3.x, p3.y);
    
        if (!!this.label) {
            text(this.label, p3.x, p3.y + 20);
        }
    }
}
