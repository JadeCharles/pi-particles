/**
 * Basically the p5.Vector paradigm applied to a Matrix.
 * It's used to perform all (ok, maybe no "ALL" per se) the cool matrix math needed in ML
 * 
 * @note: If you're using pure JavaScript, this file should be included first
 */
class NeuroMatrix {
    constructor(rowCount, columnCount, options = null) {
        this.rowCount = parseInt(rowCount);
        this.columnCount = parseInt(columnCount);

        if (typeof this.rowCount !== "number" || this.rowCount <= 0) throw new Error("rowCount must be a positive number")
        if (typeof this.columnCount !== "number" || this.columnCount <= 0) throw new Error("columnCount must be a positive number")

        let getFillValue = () => 0.0;

        if (options?.randomize === true || options === true)
            getFillValue = () => this.randomizeWeights(options.randomMax, options.min)

        if (typeof options === "number")
            getFillValue = () => options;
        else if (typeof options === "function" && typeof options(0, 0) === "number")
            getFillValue = options;

        if (!(this.columnCount > 0)) throw new Error("columnCount must be a positive number: " + this.columnCount);
        if (!(this.rowCount > 0)) throw new Error("rowCount must be a positive number: " + this.rowCount);
        
        const rows = Array(this.rowCount).fill();
        const columns = Array(this.columnCount).fill();
        this.items = rows.map(() => columns.map(() => getFillValue()));
    }

    toList() {
        let items = [];
        let row, col;

        for (row = 0; row < this.rowCount; row++)
            for (col = 0; col < this.columnCount; col++)
                items.push(this.items[row][col]);

        return items;
    }

    randomizeWeights(min = -1, max = 1) {
        const range = max - min;
        const midRange = range / 2.0;

        return this.setMatrixValues((_) => (Math.random() * range) - midRange);
    }

    copy() {
        const neuroMatrix = new NeuroMatrix(this.rowCount, this.columnCount);
      
        for (let i = 0; i < this.rowCount; i++) {
            for (let j = 0; j < this.columnCount; j++) {
                neuroMatrix.items[i][j] = this.items[i][j];
            }
        }

        return neuroMatrix;
    }

    add(neuroMatrix) {
        if (neuroMatrix instanceof NeuroMatrix) {
            if (this.rowCount !== neuroMatrix.rowCount)
                throw new Error("Add failed: this and neuroMatrix don't seem to have matching number of rows (this.rowCount: " + this.rowCount + " vs. " + neuroMatrix.rowCount + ")");
            
            if (this.columnCount !== neuroMatrix.columnCount)
                throw new Error("Add failed: this and neuroMatrix don't seem to have matching number of columns (this.columnCount: " + this.columnCount + " vs. " + neuroMatrix.columnCount + ") although the rows do match (" + this.rowCount + ")");

            return this.setMatrixValues((value, row, col) => value + neuroMatrix.items[row][col]);
        } else if (typeof neuroMatrix === "number") {
            return this.setMatrixValues(value => value + neuroMatrix);
        }

        throw new Error("Add failed: Invalid type passed to add method (" + (typeof neuroMatrix) + "). Must be a number or a NeuroMatrix");
    }

    sub(neuroMatrix) {
        if (this.rowCount !== neuroMatrix.rowCount)
            throw new Error("Sub failed: m1 and m2 don't seem to have matching number of rows");
        
        if (this.columnCount !== neuroMatrix.columnCount)
            throw new Error("Sub failed: m1 and m2 don't seem to have matching number of columns");

        return this.setMatrixValues((value, row, col) => value - neuroMatrix.items[row][col]);
    }
    
    mult(neuroMatrix) {
        if (neuroMatrix instanceof NeuroMatrix) {
            if (this.rowCount !== neuroMatrix.rowCount)
                throw new Error("Multiplication failed: m1 and m2 don't seem to have matching number of rows (" + this.rowCount + " vs. " + neuroMatrix.rowCount + ")");
            
            if (this.columnCount !== neuroMatrix.columnCount)
                throw new Error("Multiplication failed: m1 and m2 don't seem to have matching number of columns (" + this.columnCount + " vs. " + neuroMatrix.columnCount + ") although the rows do match (" + this.rowCount + ")");
            // if (this.rowCount !== neuroMatrix.rowCount || this.columnCount !== neuroMatrix.columnCount)
            //     throw new Error("Multiplication failed: This matrix is not transposable to the passed matrix");

            return this.setMatrixValues((value, i, j) => value * neuroMatrix.items[i][j]);
        } else {
            return this.setMatrixValues(value => value * neuroMatrix);
        }
    }

    /**
     * Cool mapper I "inspired by" CodingTrain
     * @param {function|number} valueFunction - A function that takes the current value, row and column and returns the new value, or a number to set all values to
     * @returns {NeuroMatrix} - So we can chain methods together
     */
    setMatrixValues(valueFunction) {
        if (typeof valueFunction !== "function") { 
            if (typeof valueFunction !== "number")
                throw new Error("setMatrixValues failed: Invalid valueFunction passed to setMatrixValues method. Must be a function");
            
            valueFunction = () => valueFunction;
        }

        for (let row = 0; row < this.rowCount; row++) {
            for (let col = 0; col < this.columnCount; col++) {
                const currentValue = this.items[row][col];
                this.items[row][col] = valueFunction(currentValue, row, col);
            }
        }

        return this;
    }

    /* Static Constructor-ish methods */
    
    /**
     * Converts a list of numbers to a NeuroMatrix with list.length number of rows, and 1 column
     * @param {[number]} arr - An array of numbers
     * @returns {NeuroMatrix} - A new NeuroMatrix instance
     */
    static fromList(list) {
        return new NeuroMatrix(list.length, 1).setMatrixValues((_, row) => list[row]);
    }

    /**
     * Creates a new NeuroMatrix instance from an existing NeuroMatrix one, using a setter function to set the values or a number to set all values to
     * @param {NeuroMatrix} neuroMatrix - A NeuroMatrix instance
     * @param {function|number} setterFunction - A function that takes the current value, row and column and returns the new value, or a number to set all values to
     * @returns {NeuroMatrix} - A new NeuroMatrix instance
     */
    static fromMatrix(neuroMatrix, setterFunction) {
        if (typeof setterFunction !== "function") { 
            if (typeof setterFunction !== "number")
                throw new Error("Invalid setterFunction passed to fromMatrix method. Must be a function");
            
            setterFunction = () => setterFunction;
        }

        const newMatrix = new NeuroMatrix(neuroMatrix.rowCount, neuroMatrix.columnCount)
        return newMatrix.setMatrixValues((_, i, j) => setterFunction(neuroMatrix.items[i][j], i, j));
    }

    /**
     *  Takes a Json representation of a NeuroMatrix and returns a new NeuroMatrix instance
     * @param {string|object} json - Json (string of object) 
     * @returns {NeuroMatrix} - A new NeuroMatrix instance
     */
    static fromJson(json) {
        if (typeof json == "string") json = JSON.parse(json);
        
        if (!json.items) throw new Error("Invalid JSON passed to NeuroMatrix.fromJson (no items property)");
        
        const neuroMatrix = new NeuroMatrix(json.rowCount, json.columnCount);
        neuroMatrix.items = json.items;

        return neuroMatrix;
    }

    /* Static Operations Methods */

    static setMatrixValues(neuroMatrix, setterFunction) {
        return new NeuroMatrix(neuroMatrix.rowCount, neuroMatrix.columnCount).setMatrixValues((_, i, j) => setterFunction(neuroMatrix.items[i][j], i, j));
    }

    /**
     * Ripped this from p5.js and converted it to a matrix implementation
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix} - The summed matrix
     */
    static add(m1, m2) { 
        if (m1.rowCount !== m2.rowCount)
            throw new Error("m1 and m2 don't seem to have matching number of rows");
        
        if (m1.columnCount !== m2.columnCount)
            throw new Error("m1 and m2 don't seem to have matching number of columns");

        return new NeuroMatrix(m1.rowCount, m2.columnCount).setMatrixValues((_, row, col) => m1.items[row][col] + m2.items[row][col]);
    }

    /**
     * Ripped this from p5.js and converted it to a matrix implementation
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix} - The subtracted matrix
     */
    static sub(m1, m2) {
        if (m1.rowCount !== m2.rowCount)
            throw new Error("m1 and m2 don't seem to have matching number of rows");
        
        if (m1.columnCount !== m2.columnCount)
            throw new Error("m1 and m2 don't seem to have matching number of columns");

        return new NeuroMatrix(m1.rowCount, m2.columnCount).setMatrixValues((_, row, col) => m1.items[row][col] - m2.items[row][col]);
    }

    /**
     * Some cool linear algebra stuff. Multiplies two matrices together (I.e. multiply each row of m1 by each column of m2, [aka: Matrix Multiplication])
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix}
     */
    static mult(m1, m2) {
        if (m1.columnCount !== m2.rowCount)
            throw new Error("Failed to multiply matrices. Columns must be of the same size (m1.columnCount:" + m1.columnCount + " != m2. m2.rowCount:" + m2.rowCount + ")");

        return new NeuroMatrix(m1.rowCount, m2.columnCount).setMatrixValues((_, row, col) => {
            let total = 0;
            
            for (let i = 0; i < m1.columnCount; i++)
                total += m1.items[row][i] * m2.items[i][col];

            return total;
        });
    }

    /**
     * Transposing a matrix is simply swaping the rows and columns.
     * @param {NeuroMatrix} m1 - Matrix 1
     * @param {NeuroMatrix} m2 - Matrix 2
     * @returns {NeuroMatrix} - The subtracted matrix
     */
    static transpose(neuroMatrix) {
        return new NeuroMatrix(neuroMatrix.columnCount, neuroMatrix.rowCount)
            .setMatrixValues((_, i, j) => neuroMatrix.items[j][i]);
    }

}

if (typeof module === 'undefined') {
    console.log("Can't export. Running NeuroMatrix in-browser");
} else { 
  module.exports = NeuroMatrix;
}
