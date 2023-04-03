class VectorHandler {
    static createP5Handler() {
        if (typeof p5 === "undefined")
            throw new Error("Can't create p5 VectorHandler: p5 is not defined. Make sure the p5.js library is included in your project. Alternatively, you can create your own VectorHandler by extending the VectorHandler and including the matrix operations function");
        
        let handler = new VectorHandler();

        handler.createVector = function (x, y) { 
            return createVector(x, y);
        };

        handler.setValues = function (vec1, vec2, options = null) {
            if (typeof vec2 === "number" && typeof options === "number") { 
                const nv = createVector(vec2, options);
                return vec1.set(nv);
            }
            
            return vec1.set(vec2);
        };

        handler.mult = function (vec1, vec2, options = null) {
            return options === true ?
                vec1.mult(vec2) : 
                p5.Vector.mult(vec1, vec2);
        };

        handler.add = function (vec1, vec2, options = null) {
            return options === true ?
                vec1.add(vec2) :
                p5.Vector.add(vec1, vec2);
        }

        handler.sub = function (vec1, vec2, options = null) {
            return options === true ?
                vec1.sub(vec2) :
                p5.Vector.sub(vec1, vec2);
        }

        handler.getAngle = function (vec, options = null) {
            const angle = vec.heading();
            return options === true ? angle * 180 / Math.PI : angle;
        }

        return handler;
    }

    static createDefaultHandler() { 
        return new VectorHandler();
    }

    static ensureVector(vec, symbol = null) { 
        if (typeof vec?.x === "number" && typeof vec?.y === "number") return;

        if (typeof symbol !== "string" || symbol.length === 0)
            symbol = "Vector operation";
    
        throw new Error(symbol + " called with invalid arguments. Must be a vector or two numbers");
    }

    constructor(lib) {
        if (!lib) lib = {};
    }

    createVector(x, y) { 
        return { x: x, y: y, z: 0 };
    }

    setValues(vec1, vec2, options = null) {
        let x = vec2?.x || vec2;
        let y = vec2?.y || options;

        if (typeof x !== "number" || typeof y !== "number")
            throw new Error("VectorHandler.setValues() called with invalid arguments. Must be a vector or two numbers");

        vec1.x = x;
        vec1.y = y;

        return vec1;
    }

    mult(vec1, vec2, options = null) { 
        VectorHandler.ensureVector(vec1, "vec1.mult()");
        VectorHandler.ensureVector(vec2, "vec2.mult()");

        // Multiply two vectors
        const x = vec1.x * vec2.x;
        const y = vec1.y * vec2.y;

        if (options !== true)
            return this.createVector(x, y);
        
        vec1.x = x;
        vec1.y = y;

        return vec1;
    }

    add(vec1, vec2, options = null) { 
        VectorHandler.ensureVector(vec1, "vec1.add()");
        VectorHandler.ensureVector(vec2, "vec2.add()");

        const x = vec1.x + vec2.x;
        const y = vec1.y + vec2.y;

        if (options !== true)
            return this.createVector(x, y);

        vec1.x = x;
        vec1.y = y;

        return vec1;
    }

    sub(vec1, vec2, options = null) {
        VectorHandler.ensureVector(vec1, "vec1.sub()");
        VectorHandler.ensureVector(vec2, "vec2.sub()");

        const x = vec1.x - vec2.x;
        const y = vec1.y - vec2.y;

        if (options !== true)
            return this.createVector(x, y);

        vec1.x = x;
        vec1.y = y;

        return vec1;
    }

    getAngle(vec, options = null) {
        VectorHandler.ensureVector(vec, "vec.getAngle()");
        return Math.atan2(vec.y, vec.x);
    }

    getMagnetude(vec, options = null) { 
        VectorHandler.ensureVector(vec, "vec.getMagnetude()");
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    }
}

if (typeof module === "undefined") { 
    console.log("Can't export. Running VectorHandler in-browser");
} else { 
    module.exports = VectorHandler;
}
