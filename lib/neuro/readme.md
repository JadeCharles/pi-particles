# Neural Networks

Exploring the inner workings of neural networks, logically speaking.

## General Components

The Neural Network Engine's architecture has some key areas/components of note.

- Matrix math - This is where all the math happens with vectors and matrices. The three files that make up this area do all the weight updates, error/gradient calculations, etc... So any change to them should be with appropriate caution:

```
/lib/neuro/components/activation-function.js    # Different types; Sigmoid, TanH, etc
/lib/neuro/components/neuron-matrix.js          # A Matrix class library for matrix ops
/lib/neuro/apps/app.matrix-neuro.js             # App that runs the training and testing
```

- Analogous Logic - The logical elements that make up a brain. It takes input from the Matrix Math area and converts it to a structure more analogous to a biological/phyiscal neural network, for educational purposes. It feeds data into the presentation layer which renderes the elements (positions, colors, tracers, etc)

```
/lib/neuro/components/neuron.js
/lib/neuro/components/neuron-connector.js
/lib/neuro/components/neuron-layer.js
/lib/neuro/apps/app.visual-neuro.js
```

- Presentation - The UI and UX of the app. The top level presentation is HTML/CSS/DOM, but there is also a rendering layer that does the drawing onto a canvas or other medium. Default is using p5.js as the rendering bridge (which uses Canvas)

```
/lib/neuro/p5-neuro-drawer.js   # p5 drawing functions
/lib/sketch.neuro.js            # p5 rendering engine
```

# Network Types

Only Feed Forward is currently implemented, but there are plans for the future.

## Feed Forward

Uses a basic XOR example that converts 2 inputs into a single output with the XOR boolean logical operation to it.
This is a really good "first example" if you're new or learning the nuts/bolts of neural networks. It can be used
for any basic classificiation

## Convolutional

Image classification and other fun stuff - Incomplete

## Recurrent

Language models, etc - Incomplete

## More...

Additional stubs are in the `/lib/neuro/networks` folder. Check back for more.
