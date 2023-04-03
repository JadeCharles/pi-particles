// if (typeof require !== "undefined") { 
//     const Neuron = require("../components/neuron.js");
//     const FeedForwardNueralNetwork = require("../networks/feed-forward.js");
// }

import VectorHandler from '../../common/vector-handler.js';
import Neuron from '../components/neuron.js';
import FeedForwardNueralNetwork from '../networks/feed-forward.js';

/**
 * A visual effect to make it seem like there is some sort of brain activity going on...
 * Concretely - It's a little particle thingy that moves along the weights, etc
 */
class NeuronRunner { 
    static _nonce = 0;
    static defaultDrawer = {
        draw: (position, sender) => {
            if (NeuronRunner._nonce === 0) { 
                console.error("NeuronRunner: No drawer specified. Neuron Runners will not be drawn.");
                NeuronRunner._nonce++;
            }
        },
    };

    constructor(network, options = {}) { 
        if (!(network instanceof FeedForwardNueralNetwork))
            throw new Error("NeuronRunner must be created with a feed-forward network type");
        
        this.id = options.id || (Math.random() * 99999999).toString(16);
        this.vectorHandler = VectorHandler.createP5Handler();
        this.network = network;
        this.neuron = (options.neuron instanceof Neuron) ? options.neuron : null;
        this.drawer = options.drawer || NeuronRunner.defaultDrawer;
        
        this.repeat = typeof options.repeat !== "number" ?
            (options.repeat === true ? -1 : 0) :
            options.repeat;

        // Visual properties
        this.color = options.color || null;
        this.borderColor = options.borderColor || null;
        this.size = { width: options.width || 0, height: options.height || 0 };
        this.speed = typeof options.speed === "number" && options.speed >= 0 ? options.speed : 5;

        // Cursors
        this.position = null;
        this.target = null;

        this.wayPoints = Array.isArray(options.wayPoints) ?
            options.wayPoints :
            [];

        this.reverseWayPoints = [];
        this.twoWay = options.twoWay === true;
        
        if (this.wayPoints.length > 0) {
            this.target = this.wayPoints.shift();
        }

        if (this.twoWay) { 
            this.reverseWayPoints.push(this.neuron);
            if (this.target) this.reverseWayPoints.push(this.target);
        }

        // Clean up the properties
        if (typeof this.size.width !== "number" || this.size.width <= 0) this.size.width = 4;
        if (typeof this.size.height !== "number" || this.size.height <= 0) this.size.height = 4;

        if (!this.color && !this.borderColor) this.borderColor = "#FFFFFF77";

        // Navigation Functions ---
        
        /** Default callback for any time the runner changes linear direction */
        this.onNavigate = (targetNeuron) => {
            const targetPos = targetNeuron.agent.position;
            if (!targetPos) throw new Error("Invalid targetNeuron during onNavigate(targetNeuron)");

            if (this.wayPoints.length > 0) {
                //return this.setNextTarget();
            } else { 
                // End
                this.onComplete();
                this.destroy();
            }

            return 1;
        };

        this.onReverse = () => { 
            console.log("onReverse()");
        };

        this.onComplete = () => { 
            console.log("onComplete()");
        };

        // state management
        this.printed = false;
        this.isReversed = false;
        this.didReverse = false;
    }

    setNextTarget() { 
        if (this.wayPoints.length === 0) { 
            return 0;
        }

        this.target = this.wayPoints.shift();
        if (!this.twoWay) return true;

        if (!this.isReversed)
            this.reverseWayPoints.push(this.target);
        else if (this.didReverse) { 
            this.didReverse = false;
            this.onReverse();
        }

        if (this.wayPoints.length === 0) {
            // cleared.
            if (this.twoWay) {

                if (this.isReversed) {
                    this.isReversed = false;
                    this.reverseWayPoints = [];
                    return false;
                }

                this.isReversed = true;
                this.didReverse = true;
                this.wayPoints = this.reverseWayPoints;
                this.wayPoints.reverse();
                this.reverseWayPoints = [];

                return 1;
            }

            return 0;
        }

        return 1;
    }

    destroy() {
        return this.network.removeRunner(this);
    }

    onArrival(neuron) { 
        const arrival = this.onNavigate(neuron) || 0;
        //
        return arrival;
    }

    run(neuron = null, options = {}) {
        if (!neuron) neuron = this.neuron;

        if (neuron?.layer?.network !== this.network) 
            throw new Error("NeuronRunner.run called with invalid neuron. Must be part of the network " + this.network.name);
        if (!neuron.agent?.position)
            throw new Error("Neuron does not have a valid agent position. Be sure to add neuron.agent");
        
        this.neuron = neuron;
        this.position = neuron.agent.position.copy();

        if (!!options.target) { 
            if (!!this.target) this.wayPoints.push(this.target);
            else this.target = options.target;
        }

        if (typeof options === "function") { 
            this.onNavigate = options;
            options = {};
        } else if (typeof options.onNavigate === "function") {
            this.onNavigate = options.onNavigate;
        }

        this.repeat = typeof options.repeat !== "number" ?
            (options.repeat === true ? -1 : this.repeat) :
            options.repeat;

        this.speed = typeof options.speed === "number" && options.speed >= 0 ?
            options.speed :
            this.speed;
    }

    updatePosition() {
        if (!this.target || !this.position) { 
            console.warn("NeuronRunner.updatePosition() called : No target (" + this.target + ") or position (" + this.position + ")");
            return;
        }

        const tp = this.target.agent.position;
        let diff = this.vectorHandler.sub(tp, this.position);

        const dir = diff.normalize();
        const dx = dir.x * this.speed;
        const dy = dir.y * this.speed;

        this.position.add(createVector(dx, dy));
        
        diff = this.vectorHandler.sub(tp, this.position);    // See if we overshot it (or arrived)
        
        if (Math.abs(diff.x) < this.speed && Math.abs(diff.y) < this.speed) {
            this.vectorHandler.setValues(this.position, tp.x, tp.y);

            this.onArrival(this.target);

            if (this.wayPoints.length > 0)
                this.setNextTarget();
        }
    }

    /** Uses p5 - Be sure this is ultimately invoked from a sketch */
    draw() {
        this.drawer.draw(this.position, this);
    }

    /** Static runner waypoint maps */

    static createStrongestConnectorMap(neuron, options = {}) {
        let waypoints = [neuron];
        let current = neuron;

        const network = neuron.layer.network;
        if (!network) throw new Error("NeuronRunner.createStrongestConnectorMap called with invalid neuron");

        while (current.forwardConnectors.length > 0) {
            let index = 0;
            let w = -10000;

            current.forwardConnectors.map((c, idx) => {
                let weight = Math.abs(c.weight);
                if (weight > w) {
                    w = weight;
                    index = idx;
                }
            });

            const next = current.forwardConnectors[index].dest;

            waypoints.push(next);
            current = next;
        }

        return waypoints;
    }

    static createRandomConnectorMap(neuron, options = {}) {
        let waypoints = [neuron];
        let current = neuron;

        const network = neuron.layer.network;
        if (!network) throw new Error("NeuronRunner.createStrongestConnectorMap called with invalid neuron");

        while (current.forwardConnectors.length > 0) {
            const index = Math.floor(Math.random() * current.forwardConnectors.length);
            const next = current.forwardConnectors[index].dest;

            waypoints.push(next);
            current = next;
        }

        return waypoints;
    }    
}

if (typeof module === 'undefined') {
    console.log("Can't export. Running NeuronLayer in-browser");
} else { 
  module.exports = NeuronRunner;
}
