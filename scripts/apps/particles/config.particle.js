/**
 * Defines the structure of a person object.
 * @typedef {object} Position
 * @property {number} x
 * @property {number} y
 */

class ParticleColor { 
    constructor(name, color, range, material) {
        if (typeof name === "object") { 
            if (typeof color !== "string") color = name.color || "#FFFFFF";
            if (typeof range !== "number") range = name.range || ParticleConfig.defaultRange;
            if (typeof material !== "object") material = name.material || null;
            name = name.name || "Unknown";
        }

        this.name = name;
        this.color = color;
        this.range = range;
        this.material = material;
    }
}

/**
 * 
 */
class ParticleConfig {
    /**
     * The shortest distance between two masses. Used when we are calculating the force of gravity. 
     * If this goes to zero, the particles will do some black-hole type shit. Basically explode.
     */
    static planckLength = 0.0000001;
    static gravityAcceleration = 9.8;

    /**
     * Percent value. This will slow the particles down by 3% per second, so they don't fly all over the place. 
     * Set this to zero to see some funky stuff.
     */
    static friction = 0.0075; // 0.03;

    static lubrication = () => 1 - ParticleConfig.friction;

    /**
     * If a particle is within this distance of another particle, it will multiply its repulsive force by this value.
     */
    static personalSpaceMultiplier = 4.0;

    /**
     * Default size of the particles.
     */
    static defaultDiameter = 4.0;

    /**
     * The color of the range indicator. If ranges are visible, they are drawn with this color.
     */
    static bubbleColor = "#FFFFFF55";

    static defaultRange = 500;
    
    static colors = [
        new ParticleColor({ name: "Yellow", color: "#ffCC00", range: ParticleConfig.defaultRange, material: null }),
        new ParticleColor({ name: "Green", color: "#00AA00", range: ParticleConfig.defaultRange, material: null }),
        new ParticleColor({ name: "Blue", color: "#0000FF", range: ParticleConfig.defaultRange, material: null }),
        new ParticleColor({ name: "Red", color: "#990000", range: ParticleConfig.defaultRange, material: null }),
        new ParticleColor({ name: "Grey", color: "#888888", range: ParticleConfig.defaultRange, material: null }),
        new ParticleColor({ name: "Pink", color: "#aa00aa", range: ParticleConfig.defaultRange, material: null }),
        new ParticleColor({ name: "Cyan", color: "#00aaaa", range: ParticleConfig.defaultRange, material: null }),
        new ParticleColor({ name: "White", color: "#ffffff", range: ParticleConfig.defaultRange, material: null }),
    ];
    
    static dispose() { 
        ParticleConfig.colors.forEach(c => (typeof c.material?.dispose) === "function" && c.material.dispose());
    }

    static emptyForce = {
        force: 0,
        forceX: 0,
        forceY: 0,
        velocityX: 0,
        velocityY: 0,
        attractionValue: 0,
        fuse: false,
    };

    static isValidMatrix(matrix, maxVal = 1.0, minVal = -1.0) {
        const isMatrix = Array.isArray(matrix);
        if (!isMatrix) return false;

        const isLength = matrix.length === 8;
        if (!isLength) console.error("Matrix is not 8x8 (" + matrix?.length + ")");

        return isMatrix && isLength && matrix.every((row, rowIndex) => {
            const isRowArray = Array.isArray(row);
            
            if (!isRowArray) { 
                console.error("Row " + rowIndex + " is not an array.");
                return false;
            }

            return row.length === 8 && row.every((val, colIndex) => {
                const isNumber = typeof val === "number";
                if (!isNumber) console.error("Value in row:" + rowIndex + ", col:" + colIndex + " is not a number (" + (typeof val).toString() + "): " + val);

                const isInRange = val >= minVal && val <= maxVal;
                if (!isInRange) console.error("Value in row:" + rowIndex + ", col:" + colIndex + " is not in range (" + minVal + " to " + maxVal + "): " + val);

                return isNumber && isInRange;
            });
        });
    }

    /**
     * Creates an attraction matrix that has only 1 and -1 values, nothing in between
     * @param {numbner} maxForce - The default force value
     * @param {number} maxSelfForce - The self force value
     * @returns 
     */
    static createPositiveOrNegativeAttractionMatrix(maxForce = 1.0, maxSelfForce = 1.0) {
        let matrix = [];
        const size = ParticleConfig.colors.length;
        
        for (let i = 0; i < size; i++) {
            const cols = [];

            for (let j = 0; j < size; j++) {
                const m = Math.random() > 0.5 ? 1 : -1;
                const val = (i === j ? maxSelfForce : maxForce) * m;
                cols.push(val || m);
            }

            matrix.push(cols);
        }

        return matrix;        
    }

    /**
     * Creates a [colorCount x colorCount] matrix with the same value in each cell. This results in a "gravitational" effect where all particles are attracted to each other.
     * @param {number} value - The default force value for all color pairs
     * @returns {[number[number]] - The attraction matrix
     */
    static createUniformAttractionMatrix(value = 1.0) {
        const matrix = [];
        const size = ParticleConfig.colors.length;
        
        console.warn("Uniforming: " + size);
        for (let i = 0; i < size; i++) {
            const cols = [];

            for (let j = 0; j < size; j++) {
                cols.push(value);
            }

            matrix.push(cols);
        }

        return matrix;
    }

    /**
     * Creates a [colorCount x colorCount] matrix with the same value in each cell. This results in a "gravitational" effect where all particles are attracted to each other.
     * @param {number} value - The default force value for all color pairs
     * @returns {[number[number]] - The attraction matrix
     */
    static createZeroAttractionMatrix() {
        const matrix = [];
        const size = ParticleConfig.colors.length;
        
        console.warn("Zero-ing: " + size);
        for (let i = 0; i < size; i++) {
            const cols = [];

            for (let j = 0; j < size; j++) {
                cols.push(0);
            }

            matrix.push(cols);
        }

        return matrix;
    }    

    static createRandomAttractionMatrix(maxForce = 1.0, maxSelfForce = null, minValue = 0.25) { 
        let matrix = [];
        const size = ParticleConfig.colors.length;
        //maxForce /= 2;
        
        for (let i = 0; i < size; i++) {
            const cols = [];

            for (let j = 0; j < size; j++) {
                const m = Math.random() > 0.5 ? 1 : -1;
                const val = i === j && (typeof maxSelfForce === "number") ?
                    maxSelfForce :
                    (Math.random() * (maxForce - minValue)) + minValue;
                
                cols.push(val * m || m);
            }

            matrix.push(cols);
        }

        return matrix;
    }

    static invertAttractionMatrix(matrix) { 
        return matrix.map(row => row.map(val => val * -1));
    }

}
