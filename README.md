# JavaScript Particle (Life) Engine

## Particle Life

JavaScript implementation of Particle Life implementation, using the p5.js library
https://p5js.org/

Inspired by this video (which looks way better than mine).
https://www.youtube.com/watch?v=p4YirERTVF0

Mostly pure JavaScript, but used JQuery for the UI controls. The dependencies are included in the project's `/scripts` directory (not CDN) so it should work out the box.
[Try it](./index.html)

Only tested in Chrome, so no guarantees on other browsers :/

## Features and Usage

The app initializes with 0 particles, 4 (out of 8) distinct colors, and random attraction values.
Right click anywhere on the canvas to spawn 100 particles; colors will be sequential. Left click to spawn a single particle.

Click one of the colors in the top panel to set the color (click the same color to de-select). When a color is selected, spawning will result in the same color selected.

Keyboard: Press `r` to re-randomize the attraction values, press `u` to set all the attraction values to 1.0 (they'll lump into a ball, like a planet)

There's an invisible force field around the edges of the canvas to keep the particles in the visible area (camera view coming later)

## Coding Pattern Notes

Since JQuery is used for most of the UI, it has a tendancy to hijack the "this" variable, so referencing the global "app" variable makes more sense

## Coming Soon (i.e, when time permits)

This implementation can be further optimized. In the current version (v1.0.0) there's a quad-tree class, but haven't had time to fully complete/implement it.

Upcoming Features:

1. Editing individual attraction values
2. Quadtree for performance boost
3. More Spawn Modes (spiral, squares, random large circles, etc) - Right now there's only Left Click (spawn 1), Right CLick (spawn many), and Mouse Drag (spawn where the mouse moves)
4. Particle rotation so the attraction forces can be more granular and based on what "side" of the particle is facing (or touching) another particle
5. New binding modes to try to encourage larger/more complex structures
6. Eating + Procreation => Evolution
7. DNA???
8. More UI/controls
9. Save/Load Configs
10. Camera view to pan L/R/U/D
11. Fixed particles (so moving particles can bounce off/collidet/black-hole/etc)
