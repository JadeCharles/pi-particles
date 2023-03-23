class ActivationFunction { 
    constructor(name, activationFunction, derivativeFunction, partialDerivativeFunction) {
        this.name = name;
        this.activate = activationFunction;
        this.getDerivative = derivativeFunction;
        this.getPartialDerivative = partialDerivativeFunction;
    }

    static sigmoid = new ActivationFunction("Sigmoid", (x) => 1 / (1 + Math.exp(-x)), (x) => x * (1 - x), (x) => x * (1 - x));
    
    static tanh = new ActivationFunction("Tanh", (x) => Math.tanh(x), (x) => 1 - (x * x), (x) => 1 - (x * x));

    static relu = new ActivationFunction("ReLU", (x) => Math.max(0, x), (x) => x > 0 ? 1 : 0, (x) => x > 0 ? 1 : 0);

    static softmax = new ActivationFunction("Softmax", (xs) => ActivationFunction.softmax(xs), (xs) => ActivationFunction.softmax(xs), (xs) => ActivationFunction.softmax(xs));

    static getActivationFunctionByName(name) {
        switch (name) {
            case "Sigmoid":
                return ActivationFunction.sigmoid;
            case "Tanh":
                return ActivationFunction.tanh;
            case "ReLU":
                return ActivationFunction.relu;
            case "Softmax":
                return ActivationFunction.softmax;
            default:
                return ActivationFunction.sigmoid;
        }
    }


}