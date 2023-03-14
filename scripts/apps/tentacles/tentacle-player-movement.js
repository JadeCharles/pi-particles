class TentaclePlayerMovement { 
    constructor(options) {
        this.positions = [];
        this.speed = 1;
        this.repeat;
    }

    addPosition(x, y) { 
        this.positions.push(createVector(x, y));
    }
}
