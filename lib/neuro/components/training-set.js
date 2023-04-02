/**
 * XOR training object - Currently not used. I need to build this out more
 */
class TrainingSet {
    static xor = {
        inputs: [
            [1, 0],
            [0, 1],
            [0, 0],
            [1, 1],
        ],
        expectedOutputs: [
            [1],
            [1],
            [0],
            [0],
        ],
    }

    constructor(inputList, expectedOutputList, learningRate = 0.03, momentum = 0.1) {
        this.expectedOutputList = expectedOutputList || TrainingSet.xorExpectedOutputs;
        this.inputList = inputList || TrainingSet.xorInputs;
        this.learningRate = learningRate || 0.03;
        this.momentum = momentum || 0.1;
        this.errors = Array.from({ length: this.inputList.length }, () => null);
        this.notes = Array.from({ length: this.inputList.length }, () => null);
        this.networkError = 0;
        this.epocs = 0;
        this.error = 0;
    }

    test(network, inputs, expectedOutputs) {
        const outputs = network.run(inputs, false);
        const errors = outputs.map((v, i) => Math.abs(v - expectedOutputs[i]));

        this.testResults = {
            inputs: inputs.map((ip) => ip.toFixed(1)).join(", "),
            outputs: outputs.length === 1 ? parseFloat(outputs[0].toFixed(4)) : outputs,
            errors: errors.length === 1 ? parseFloat(errors[0].toFixed(4)) : errors,
        };

        return this.testResults;
    }

}
