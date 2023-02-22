/**
 * Defines the structure of a person object.
 * @typedef {object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * Testing
 * @param {object} MyObject
 * @param {number} a
 * @param {number} b
 * @returns {number}
*/

class ParticleOptions {
    static width = 1200;
    static height = 800;
    static planckLength = 0.0000001;
    static maxDistance = 800;
    static gravityAcceleration = 9.8;
    static friction = 0.03;  // percent value
    static lubrication = () => 1 - ParticleOptions.friction;
    static personalSpaceMultiplier = 4.0;  //3333;
    static defaultDiameter = 4.0;
    static bubbleColor = "#FFFFFF55";

    static defaultMaxDistance = ParticleOptions.height / 5;
    
    static colors = [
        { name: "Yellow", color: "#ffff00", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
        { name: "Green", color: "#00AA00", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
        { name: "Blue", color: "#0000aa", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
        { name: "Red", color: "#aa0000", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
        { name: "Grey", color: "#888888", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
        { name: "Pink", color: "#aa00aa", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
        { name: "Cyan", color: "#00aaaa", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
        { name: "White", color: "#ffffff", maxDistance: ParticleOptions.defaultMaxDistance, material: null },
    ];
    
    static dispose() { 
        ParticleOptions.colors.forEach(c => (typeof c.material?.dispose) === "function" && c.material.dispose());
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
    static createPositiveOrNegativeAttractionMatrix(maxForce = 1.0, maxSelfForce = 2.0) {
        let matrix = [];
        const size = ParticleOptions.colors.length;
        //maxForce /= 2;
        
        for (let i = 0; i < size; i++) {
            const cols = [];

            for (let j = 0; j < size; j++) {
                const m = Math.random() > 0.5 ? 1 : -1;
                const val = i === j ? maxSelfForce : maxForce * m;
                cols.push(val || m);
            }

            matrix.push(cols);
        }

        return matrix;        
    }

    static createGravityAttractionMatrix(gravity = 1.0, selfGravity = 1.0) { 
        let matrix = [];
        const size = ParticleOptions.colors.length;
        //maxForce /= 2;
        
        for (let i = 0; i < size; i++) {
            const cols = [];

            for (let j = 0; j < size; j++)
                cols.push(i === j ? selfGravity : gravity);

            matrix.push(cols);
        }

        return matrix;
    }

    static createUniformAttractionMatrix(value = 1.0) {
        const matrix = [];
        const size = ParticleOptions.colors.length;
        //maxForce /= 2;
        
        console.warn("Randomizing: " + size);
        for (let i = 0; i < size; i++) {
            const cols = [];

            for (let j = 0; j < size; j++) {
                cols.push(value);
            }

            matrix.push(cols);
        }

        return matrix;
    }

    static createRandomAttractionMatrix(maxForce = 1.0, maxSelfForce = null, minValue = 0.25) { 
        let matrix = [];
        const size = ParticleOptions.colors.length;
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

}
