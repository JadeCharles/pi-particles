/**
 * Fairly lightweight feed forward neural network 
 * Implementation using matrices (the most common and efficient way it's done) to make training faster and more understandable from a math perspective.
 * The trained weights can be exported to a JSON file and/or used in app.neuro.js for visuals.
 * This can be used for classification or regression problems.
 * Most of the error checking in the training can (should?) probably be removed for performance reasons,
 * but we care more about the educational component of this project than the performance
 */
class MatrixNeuroApp {
    static defaultActivationFunction = ActivationFunction.sigmoidActivationFunction;
    static defaultLearningRate = 0.075;

    constructor(...args) {
        if (args?.length === 1 && Array.isArray(args[0]))
            args = args[0];
        
        if (!args || args.length < 3)
            throw new Error("MatrixNeuroApp constructor requires at least 3 arguments (" + args.length + ")");

        this.neuronCounts = [];

        // Loop through all args and create layers with respective number of neurons
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (typeof arg !== "number")
                throw new Error("MatrixNeuroApp constructor arguments must be numbers. They reporesent the number of neurons per layer (excluding bias)");
            
            this.neuronCounts.push(arg);
        }

        this.activationFunction = MatrixNeuroApp.defaultActivationFunction; // Try different ones, based on the problem
        this.learningRate = MatrixNeuroApp.defaultLearningRate;             // Try different ones, based on the problem. 0.075 feels like a decent default

        this.biases = [];
        this.messages = []; // Keep some logs
        this.weightMatrices = [];
        this.activationValues = [];
        this.layerCount = this.neuronCounts.length;

        // Attach biases to all layers except input layer
        for (let i = 1; i < this.layerCount; i++) {
            const rowCount = this.neuronCounts[i];
            const columnCount = this.neuronCounts[i - 1];

            this.weightMatrices.push(new NeuroMatrix(rowCount, columnCount).randomizeWeights());
            this.biases.push(new NeuroMatrix(this.neuronCounts[i], 1).randomizeWeights());
        }
    }

    static fromJson(json) {
        if (typeof json === "string") json = JSON.parse(json);
        if (typeof json !== "object") throw new Error("Invalid json of type '" + (typeof json).toString() + "' passed to MatrixNeuroApp.fromJson");
        
        const learningRate = json.learningRate;
        const activationFunction = ActivationFunction.fromName(json.activationFunction);
        const neuronCounts = json.neuronCounts;
        const biases = json.biases.map(bias => NeuroMatrix.fromList(bias));
        const weights = json.weights.map(weight => NeuroMatrix.fromList(weight));

        const app = new MatrixNeuroApp(...neuronCounts);
        app.learningRate = learningRate;
        app.activationFunction = activationFunction;
        app.biases = biases;
        app.weightMatrices = weights;

        return app;
    }

    toJson() {
        return {
            learningRate: this.learningRate,
            activationFunction: this.activationFunction.name,
            neuronCounts: this.neuronCounts,
            biases: this.biases.map(bias => bias.toList()),
            weights: this.weightMatrices.map(weightMatrix => weightMatrix.toList()),
        };
    }

    test(inputValues, print = true) {
        return this.execute(inputValues, print).outputs.toList();
    }

    /**
     * Executes the network with the given input values
     * @param {[number]} - The input values
     * @returns {object} - The inputs (echoed), activations, and outputs (results)
     */
    execute(inputValues, print = false) { 
        const inputs = NeuroMatrix.fromList(inputValues);

        let iterator = inputs;
        let layerIndex;
        let activationValues = [];

        if (print === true) { 
            console.log("Inputs: ");
            console.table(inputValues);
        }

        for (layerIndex = 0; layerIndex < this.layerCount - 2; layerIndex++) {
            const layerBias = this.biases[layerIndex];
            const weights = this.weightMatrices[layerIndex];
            const hiddenActivations = NeuroMatrix.mult(weights, iterator.copy());

            hiddenActivations.add(layerBias);    // Sum up
            hiddenActivations.setMatrixValues(this.activationFunction.squash); // Activate

            activationValues.push(hiddenActivations);
            
            iterator = hiddenActivations;
        }

        const output = NeuroMatrix.mult(this.weightMatrices[layerIndex], iterator.copy());
        output.add(this.biases[layerIndex]);    // Sum up
        output.setMatrixValues(this.activationFunction.squash);  // Activate

        activationValues.push(output);
        this.activationValues = activationValues;

        if (print) {
            console.log("Outputs:");
            console.table(output.items);
        }

        return {
            inputs: inputs,
            outputs: output,
            activations: iterator,
        };
    }

    /*** Training and testing */

    /**
     * Sets the learning rate of the network. I.e., the "steps" it takes during back propagation
     * @param {number} learningRate - The learning rate of the network. Defaults to 0.1
     * @returns {MatrixNeuroApp} - So we can chain methods together
     */
    setLearningRate(learningRate = 0.1) {
        this.learningRate = learningRate;
        return this;
    }

    /**
     * Takes the summed up weight x input + bias and squashes it between 0 and 1 (or some other small range)
     * @param {ActivationFunction} activationFunction - The squashing function to use. Defaults to sigmoid
     * @returns {MatrixNeuroApp} - So we can chain methods together
     */
    setActivationFunction(activationFunction = null) {
        this.activationFunction = activationFunction || MatrixNeuroApp.defaultActivationFunction;
        return this;
    }

    /**
     * Trains a single round of the network. This method should be run a crap-load of times, with different inputs/outputs to train the network.
     * Basically the magic of machine learning.
     * @param {[number]} inputs - Input values of the training round
     * @param {[number]} expectedOutputs - Expected output values of the training round
     */
    train(inputs, expectedOutputs) {
        // Step 1. Feed Forward

        // Generating the output's output
        const result = this.execute(inputs);
        const outputs = result.outputs;

        // Convert list of numbers to Matrix
        const targets = NeuroMatrix.fromList(expectedOutputs);

        // 1. Calc errors
        // 2. Calc gradients
        // 3. Calc deltas
        // 4. Update weights

        // Basic cost function: (target - output)
        // We usually use the mean squared error function, which is the average of the squared errors, but we can use this for now
        let errors = NeuroMatrix.sub(targets, outputs);

        // Calculate gradient
        let gradients = NeuroMatrix.setMatrixValues(outputs, this.activationFunction.getPartialDerivative);
        gradients.mult(errors);
        gradients.mult(this.learningRate);

        // We handle the last layer separately
        let activations = this.activationValues[this.activationValues.length - 2]; // 2nd to last layer of neurons. We use this as a cursor/hold-over
        let weightsIndex = this.weightMatrices.length - 1;

        while (weightsIndex > 0) {
            // Calculate deltas and adjust accordingly
            const weights = this.weightMatrices[weightsIndex];
            const weightDeltas = NeuroMatrix.mult(gradients, NeuroMatrix.transpose(activations));
            const weightErrors = NeuroMatrix.mult(NeuroMatrix.transpose(weights), errors);

            weights.add(weightDeltas);  // Update weights - Glorious.

            // Adjust the bias by its deltas (which is just the gradients because bias is always 1.0 [for now])
            this.biases[weightsIndex].add(gradients);

            // Calculate next (backward) gradient and rinse/repeat
            gradients = NeuroMatrix.setMatrixValues(activations, this.activationFunction.getPartialDerivative);
            
            gradients.mult(weightErrors);
            gradients.mult(this.learningRate);

            errors = weightErrors;  // Cursor (value is used in the next loop)
            weightsIndex--;

            activations = this.activationValues[weightsIndex - 1];  // Cursor.
        }

        // Final updates
        const lastDeltas = NeuroMatrix.mult(gradients, NeuroMatrix.transpose(result.inputs));
        this.weightMatrices[0].add(lastDeltas);
        this.biases[0].add(gradients);
    }

}
