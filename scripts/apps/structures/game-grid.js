class GameTile { 
    constructor(options = {}) { 
        if (typeof options.row !== "number") throw new Error("Invalid tile row");
        if (typeof options.column !== "number") throw new Error("Invalid tile column");

        if (typeof options.width !== "number" || options.width <= 0) throw new Error("Invalid tile width");
        if (typeof options.height !== "number" || options.height <= 0) throw new Error("Invalid tile height");

        this.row = options.row;
        this.column = options.column
        this.color = options.color || null;
        this.width = options.width;
        this.height = options.height;
        this.x = this.row * this.width;
        this.y = this.column * this.height;

        this.centerX = this.x + (this.width / 2);
        this.centerY = this.y + (this.height / 2);

        this.value = options.value || 0;
        if (typeof this.value !== "number")
            this.value = 0;
        
        if (!this.color && this.value > 0) this.color = "white";
    }

}

class GameGrid { 
    constructor(options) { 
        if (!options) options = {
            width: -1,
            height: -1,
            tileWidth: 24,
            tileHeight: 24
        };

        this.width = options.width || -1;
        this.height = options.height || -1;
        this.tileWidth = options.tileWidth;
        this.tileHeight = options.tileHeight;

        if (typeof this.tileWidth !== "number" || this.tileWidth <= 0)
            this.tileWidth = 24;
        
        if (typeof this.tileHeight !== "number" || this.tileHeight <= 0)
            this.tileHeight = 24;

        this.tiles = [];

        this.columns = 0;
        this.rows = 0;

        this.showGrid = true;  //options.showGrid === true;

        this.updateSize();
    }

    updateSize() { 
        const canvas = document.querySelector("canvas");
        if (!canvas) return false;

        let canvasWidth = 0;
        let canvasHeight = 0;

        if (!!canvas) { 
            canvasWidth = canvas.width;
            canvasHeight = canvas.height;
        }

        if (typeof this.width !== "number" || this.width <= 0)
            this.width = canvasWidth;
        
        if (typeof this.height !== "number" || this.height <= 0)
            this.height = canvasHeight;

        const colCount = Math.floor(this.width / this.tileWidth);
        const rowCount = Math.floor(this.height / this.tileHeight);

        this.columns = colCount;
        this.rows = rowCount;

        console.log("Grid Size: " + this.rows + "x" + this.columns);

        this.tiles = Array.from({ length: rowCount }, (_, i) => {
            return Array.from({ length: colCount }, (_, j) => { 
                const options = {
                    value: (Math.round(Math.random() * 3) % 3 === 0) ? 1 : 0,
                    row: i,
                    column: j,
                    width: this.tileWidth,
                    height: this.tileHeight
                };

                return new GameTile(options);
            });
        });
    }

    getTileAtPosition(x, y, radius) {
        if (typeof x !== "number" || typeof y !== "number") return null;

        const units = radius / (this.tileWidth / 2.0)
        let r = 0;
        let fallbackTile = null;

        do {
            const col = Math.floor(x / this.tileWidth);
            const row = Math.floor(y / this.tileHeight);

            r += units;

            if (col < 0 || row < 0) continue;
            if (col >= this.columns || row >= this.rows) continue;

            const tile = this.tiles[row][col];
            if (tile.value > 0) return tile;
            else if (!fallbackTile) fallbackTile = tile;

        } while (r < radius * 2);

        return fallbackTile;
    }

    drawGrid() { 
        //if (!this.showGrid) return;

        const rowCount = this.rows;
        const colCount = this.columns;

        noFill();
        strokeWeight(1);

        for (let row = 0; row < rowCount; row++) { 
            for (let col = 0; col < colCount; col++) { 
                const tile = this.tiles[row][col];
                if (!tile) continue;

                const c = tile.color || "#FFFFFF11";

                stroke(c);
                rect(tile.x, tile.y, tile.width, tile.height);
            }
        }
    }
}

p5.Vector.prototype.isWithinMidPoint = function (p1, p2) {
    if (!p1 || !p2) return false;
    const p3 = this;  //this.player.position;

    const backDiff = p5.Vector.sub(p3, p1);
    const bodyDiff = p5.Vector.sub(p2, p3);
    const m = p5.Vector.mult(backDiff, bodyDiff);

    if (m.x >= 0 || m.y >= 0) {
        return true;
    }

    return false;
}

p5.Vector.prototype.isInBetween = function (p1, p2) { 
    if (!p1 || !p2) return false;
    
    const middlePoint = this;
    const dir = p5.Vector.sub(p2, p1).normalize();
    const middlePointDir = p5.Vector.sub(middlePoint, p1).normalize();

    let m = p5.Vector.mult(dir, middlePointDir);

    if (m.x >= 0 && m.y >= 0) {
        const pastDir = p5.Vector.sub(p2, middlePoint);
        m = p5.Vector.mult(pastDir, dir);

        if (m.x >= 0 && m.y >= 0) { 
            //console.log("Is Within Midpoint: " + m.x + ", " + m.y);
            return true;
        }
    }

    return false;
};