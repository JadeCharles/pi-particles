class ConvolutionalNetwork { 
    constructor() { 
        // For image recognition/classification/etc
    }
}

if (typeof module === 'undefined') {
    console.log("Can't export. Running ConvolutionalNetwork in-browser");
} else { 
  module.exports = ConvolutionalNetwork;
}
