class TrainingSet {
    static xorInputs = [
        [1, 0],
        [0, 1],
        [0, 0],
        [1, 1],
    ];

    static xorExpectedOutputs = [
        [1],
        [1],
        [0],
        [0],
    ];

    constructor(inputList, expectedOutputList, learningRate = 0.03, momentum = 0.1) {
        this.expectedOutputList = expectedOutputList || TrainingSet.xorExpectedOutputs;
        this.inputList = inputList || TrainingSet.xorInputs;
        this.learningRate = learningRate || 0.03;
        this.momentum = momentum || 0.1;
        this.errors = Array.from({ length: this.inputList.length }, () => null);
        this.notes = Array.from({ length: this.inputList.length }, () => null);
        this.epocs = 0;
        this.error = 0;
        this.networkError = 0;
    }

    test(network, inputs, expectedOutputs) {
        const outputs = network.submit(inputs, false);
        const errors = outputs.map((v, i) => Math.abs(v - expectedOutputs[i]));

        this.testResults = {
            outputs: outputs.length === 1 ? parseFloat(outputs[0].toFixed(4)) : outputs,
            errors: errors.length === 1 ? parseFloat(errors[0].toFixed(4)) : errors,
        };

        return this.testResults;
    }

    trainEpoc(network, epocNumber) {
        const tl = this.inputList.length;
        let totalErrors = 0;

        for (let i = 0; i < tl; i++) {
            const err = this.trainIndex(network, i, epocNumber);
            totalErrors += err;
            if (i % 1000) console.log("Error[" + i + "]: " + (err * 100).toFixed(8));
        }
        
        return totalErrors;
    }

    /**
     * 
     * @param {TrainingSet} trainingSet - The training set to train on
     * @param {number} inputIndex - The index of the inputs in the training set batch
     * @param {number} epocNumber - The epoc number
     * @returns 
     */
    trainIndex(network, inputIndex, epocNumber) {
        const sumSquareError = network.train(this.inputList[inputIndex],
            this.expectedOutputList[inputIndex],
            this.learningRate,
            this.momentum,
            inputIndex,
            epocNumber);

        this.errors[inputIndex] = network.outputLayer.getErrors();

        this.networkError = sumSquareError;
        this.epocs++;

        return sumSquareError;
    }
    
    updateError() { 
        this.error = this.errors.reduce((a, b) => Math.abs(a) + Math.abs(b), 0) / this.expectedOutputList.length;

        return this;
    }
}
