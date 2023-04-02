class P5NeuroDrawer { 
    static drawNeuron(position, sender) {
        const agent = sender.agent;
        const pos = position;

        const size = agent.size;
        const agentColor = agent.color;
        const backgroundColor = agent.backgroundColor || Neuron.defaultBackgroundColor;
        const colorOverride = sender.isSelected ? sender.selectedColor : agentColor;

        // Draw Connectors First
        for (let i = 0; i < sender.forwardConnectors.length; i++) {
            const color = sender.isSelected ? colorOverride : null;
            sender.forwardConnectors[i].draw(color);
        }
            
        // Draw the neuron
        noFill();
        textAlign(CENTER, CENTER);

        if (sender.layer.index > 0) {
            stroke(Math.abs(sender.error) > 0.1 ? "pink" : "#FFFFFF33");

            let lbl = sender.error.toFixed(3);
            if (!!sender.label) lbl += ": " + sender.label;

            text(lbl, pos.x, pos.y + 64);
        }

        stroke(colorOverride);
        text(sender.value.toFixed(3), pos.x, pos.y + 24);

        // Raw value always dimmed
        // stroke(this.isSelected ? "#FFFF0066" : "#FFFFFF33");
        // text("R:" + this.rawValue.toFixed(3), pos.x, pos.y + 44);
            
        if (!!backgroundColor) fill(backgroundColor);
        else noFill();

        strokeWeight(1);
        ellipse(pos.x, pos.y, size, size);
    }

    static drawNeuronConnector(position, sender) {
        const p1 = sender.source.agent.position;
        const p2 = sender.dest.agent.position;

        strokeWeight(1);

        const isSelected = sender.source.isSelected || sender.dest.isSelected;
        const alpha = (sender.weight + Neuron.maxWeightValue) / (Neuron.maxWeightValue * 2);
        const weightedColor = "rgba(255, 255, 255, " + alpha.toFixed(2) + ")";
        const connectorColor = isSelected ?
            "rgba(255, 255, 0, " + alpha.toFixed(2) + ")" :
            weightedColor;

        stroke(connectorColor);
        line(p1.x, p1.y, p2.x, p2.y);

        const m = p5.Vector.sub(p2, p1).mult(0.2);
        const p3 = p5.Vector.add(p1, m.mult((sender.source.index % 4) + 1));

        noFill();
        textAlign(CENTER, CENTER);
        text(sender.weight?.toFixed(3) || "Null", p3.x, p3.y);
        
        if (!!sender.label) {
            text(thsenderis.label, p3.x, p3.y + 20);
        }
    }

    static drawNeuronRunner(position, sender) {
        if (!!sender?.borderColor) {
            strokeWeight(3);
            stroke(sender.borderColor);
        } else noStroke();

        if (!!sender.color) fill(sender.color);
        else noFill();

        ellipse(position.x, position.y, sender?.size?.width || 20, sender?.size?.height || 20);
    }

}

if (typeof module === 'undefined') {
    console.log("Can't export. Running P5NeuroDrawer in-browser");
} else { 
    module.exports = P5NeuroDrawer;
}
