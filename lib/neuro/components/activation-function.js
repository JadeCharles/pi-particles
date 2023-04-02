/**
 * Convenient way to encapsulate activation functions and their derivatives.
 */
class ActivationFunction {
    static sigmoid(x) { 
        return 1 / (1 + Math.exp(-x))
    }

    static sigmoidPrime(y) { 
        return y * (1 - y);
    }

    static hyperTan(x) { 
        return Math.tanh(x);
    }

    static hyperTanPrime(y) { 
        return 1 - (y * y);
    }

    static rectifyLinear(x) { 
        return Math.max(0, x)
    }

    static rectifyLinearPrime(y) { 
        return y > 0 ? 1 : 0;
    }

    constructor(squashingFunction, derivativeFunction, name = "No Name") {
        this.name = name;
        this.squash = squashingFunction;
        this.getPartialDerivative = derivativeFunction;
    }

    static sigmoidActivationFunction = new ActivationFunction(ActivationFunction.sigmoid, ActivationFunction.sigmoidPrime, "Sigmoid");
    static reLUActivationFunction = new ActivationFunction(ActivationFunction.rectifyLinear, ActivationFunction.rectifyLinearPrime, "ReLU");
    static hyperTanActivationFunction = new ActivationFunction(ActivationFunction.hyperTan , ActivationFunction.hyperTanPrime, "HyperTan");

    static fromName(name) {
        if (typeof name !== "string" || !name)
            throw new Error("Invalid name passed to ActivationFunction.fromName: " + name);

        switch (name) { 
            case "Sigmoid": return ActivationFunction.sigmoidActivationFunction;
            case "ReLU": return ActivationFunction.reLUActivationFunction;
            case "HyperTan": return ActivationFunction.hyperTanActivationFunction;
            default: 
                console.error("Unknown activation function name: " + name);
                return null;
        }
    }

}

if (typeof module !== 'undefined') {
    module.exports = ActivationFunction;
} else { 
    console.log("Can't export. Running ActivationFunction in-browser");
}

