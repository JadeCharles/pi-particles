/**
 * Utility/Helper class to draw stuff with the p5.js library
 */
class P5Ui { 
    static drawCircleAt(pos, color = null, size = 16, thickness = 1) { 
        if (!pos?.x || !pos?.y) return;
        
        stroke(color || "#CCCCCC");
        strokeWeight(thickness);
        noFill();
        ellipse(pos.x, pos.y, size, size);
    }
}
