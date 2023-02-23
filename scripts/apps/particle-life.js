let app = null;

function createCanvasSize(elementId = "main-canvas") {
    if (app === null) app = createApp();

    const canvas = document.getElementById('main-canvas');
    app.canvasSize.width = typeof canvas?.offsetWidth === 'number' ? canvas.offsetWidth : 800;
    app.canvasSize.height = typeof canvas?.offsetHeight === 'number' ? canvas.offsetHeight - 1 : 500;

    return app.canvasSize;
}

function createApp() {
    const app = {
        attractionMatrix: ParticleOptions.createRandomAttractionMatrix(),
        particles: [],
        colorCount: 3,
        canvasSize: { width: 0, height: 0 },
        colorIndexCursor: 0
    };

    app.spawn = (colorIndex, pos = null, options = {}) => {
        if (colorIndex < 0) {
            colorIndex = app.colorIndexCursor;
            app.colorIndexCursor++;

            if (app.colorIndexCursor >= app.colorCount)
                app.colorIndexCursor = 0;
        }

        options.color_index = colorIndex;

        if (typeof pos?.x === "number") options.x = pos.x;
        if (typeof pos?.y === "number") options.y = pos.y;

        if (typeof options?.maxDistance !== "number" || options.maxDistance <= 0)
            options.maxDistance = 400;

        if (typeof app.particles === "undefined") {
            console.error("This is nothing");
            console.warn(JSON.stringify(app));
            return null;
        }


        const particle = new Particle(app, options);
        app.particles.push(particle);

        return particle;
    };

    app.spawnMany = (count, colorIndex = -1, pos = null, options = {}) => {
        for (let i = 0; i < count; i++) {
            app.spawn(i % app.colorCount, pos, options);
        }

        app.colorIndexCursor = 0;
    };

    app.updatePhysics = () => { 
        let i = 0;
        const particleCount = app.particles.length;
        const particles = app.particles;

        while (i < particleCount) { 
            particles[i++].updatePhysics(particles);
        }
    };

    app.drawParticles = () => {
        let i = 0;
        const particleCount = app.particles.length;

        while (i < particleCount) { 
            app.particles[i].drawParticle(i);
            i++;
        }

        return particleCount;
    };

    document.querySelector("canvas").addEventListener("contextmenu", (e) => {
        if (typeof e?.preventDefault === "function") e.preventDefault();
        if (typeof e?.stopPropagation === "function") e.stopPropagation();
        if (typeof e?.stopEvent === "function") e.stopEvent();
        if (typeof e?.stopEventPropagation === "function") e.stopEventPropagation();

        return false;
    });

    document.addEventListener("keydown", (e) => {
        switch (e.code) {
            case "KeyR":
                app.attractionMatrix = ParticleOptions.createRandomAttractionMatrix();
                break;
            case "KeyU":
                app.attractionMatrix = ParticleOptions.createUniformAttractionMatrix();
                break;
            default:
                break;
        }
    });

    return app;
}

function setup() {
    if (app === null) app = createApp();
    const c = createCanvasSize(app);
    createCanvas(c.width, c.height);
}

function draw() {
    app.updatePhysics();

    background(0);
    const count = app.drawParticles();

    fill(255);

    text("Count: " + count, 10, 20);
}

function mousePressed(e) {
    console.log("Mouse: " + e.button);
    console.log("Target: " + e?.target?.tagName);
    
    const button = e.button;

    if (button === 0) app.spawn(-1, { x: mouseX, y: mouseY });
    else if (button === 2) app.spawnMany(100);
}
