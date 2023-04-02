# JavaScript Emergence Engine

A collection of libraries demonstrating emergence of some sort.
I tried to stay away from major frameworks, but that isn't always
very reasonable.

## Running

Best way is to use `http-server`

... But you can simply double click any of the index.html files individually. Just know that navigation may be a bit funky.

# 3rd Party Libraries

- JQuery - Mainly for UI/UX outside the canvas UX (React was more trouble than it was worth)
- p5.js - For drawing/rendering and Vector math
- axios - Not really used as of now, but will be used to save/load snapshots (among other cool stuff that you should be real excited about)
- http-server - Not included, and optional. Used to run the project. To install, `cd` into the root directory and run it. Installation steps below:

## Install http-server Utility

`http-server` is a convenient utility that spins up a server instance on your local box
[Check the http-server npm page](https://www.npmjs.com/package/http-server) for more info.

```
> npm install -g http-server
```

## Run http-server Utility

`cd` into the root of this project and run it. Steps are:

```
> cd pi-particles
> http-server
```

# Architecture

Each of the modules will (eventually) have the same general arhitecture and pattern.
It consists of three swappable abstraction layers (not to be confused with Neural Network Layers - So we will also refer to the abstraction layers as "`segments`" in this repo), plus the "non-swappable"
Presentation Layer, which is a web page/DOM

> ### Data Layer

> ### Business Logic
>
> This is where most, if not all, of the guts are. Inside the `/lib` directory, there are subfolders
> respectively named after each module, plus a `/lib/common` directory that holds all the reusable
> component JavaScript files. Each of the modules get more specialized/specific, the deeper you go into the project's folder structure

> ### Rendering Layer

Basically, the layer that draws onto the canvas or other medium. Canvas is the most common,
but others like CSS/DOM,

> ### Presentation Layer

Normal web page/DOM. JQuery is used here, but you can use React, Veu, etc.

# Modules

Currently, there are three base modules: Neural Networks, Particles, and Tentacles.

Toast.

## Neural Network (/lib/neuro)

The furthest along. Currently a Feed Forward network using matrix math, and a NeuroApp visualizer which uses p5 for both vector math and drawing to the canvas.
You can swap out the math module and the drawing module. See the readme file.
[Neuro Readme.md](lib/neuro).

## Particle Life

This "works" but probably consider this "as is." The UI/UX is funky, and I'm not 100% on the close-quarters repulsive force function
[Particles Readme.md](lib/particles).

## Tentacle Physics (/lib/tentacles)

I need to put some time into this one still. The demo is good for a tentacle following the mouse, but I need to implement pendulum/gravity physics and state changing, as this
will eventually be a game element (NPC or otherwise)
[Tentacles Readme.md](lib/tentacles).
