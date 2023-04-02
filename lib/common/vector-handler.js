class VectorHandler {
    static createP5Handler() {
        if (typeof p5 === "undefined") throw new Error("Can't create p5 VectorHandler: p5 is not defined. Make sure the p5.js library is included in your project");
        let handler = new VectorHandler();

        handler.createVector = function (x, y) { 
            return createVector(x, y);
        };

        handler.setValues = function (vec1, vec2, options = null) {
            if (typeof vec2 === "number" && typeof options === "number")
                return vec1.set(vec2, options);
            
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

    constructor(lib) {
        if (!lib) lib = {};
    }

    createVector(x, y) { 
        return { x: x, y: y, z: 0 };
    }

    setValues(vec1, vec2, options = null) { 
        return vec1;
    }

    mult(vec1, vec2, options = null) { 
        return vec1;
    }

    add(vec1, vec2, options = null) { 
        return vec1;
    }

    sub(vec1, vec2, options = null) { 
        return vec1;
    }

    getAngle(vec, options = null) { 
        return vec;
    }

    getMagnetude(vec, options = null) { 
        return vec;
    }
}

if (typeof module === "undefined") { 
    console.log("Can't export. Running VectorHandler in-browser");
} else { 
    module.exports = VectorHandler;
}
