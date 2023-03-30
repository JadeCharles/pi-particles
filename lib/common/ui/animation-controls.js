class AnimationControls {
    controller(app, options, ...args) { 
        if (typeof options !== "object" || options === null)
            options = {};
        
        this.app = app;
        this.elementId = options.elementId || "controls";
        this.updateUi();
    }

    updateUi(app = null) {
        if (!app) app = this.app;
        if (!app) throw new Error("No app provided for AnimationControls");

        let display = (typeof app.getDisplay === "function" ? app.getDisplay() : null) || "";

        if (!display) { 
            display = "Paused";
            if (app.isRunning) { 
                if (app.particles.length === 0) display = "No Particles";
                else display = "Playing";
            }
        }

        const options = {
            display: display,
        };

        AnimationControls.createUi(app, options);
    }

    static createUi(app, options = {}) {
        if (typeof app !== "object" || app === null) throw new Error("Invalid app.");
        if (!options) options = {};

        const controlsId = app.controlsElementId || "controls";

        let controller = $('#' + controlsId);
        let needsToAppend = false;

        if (!controller.get(0)) { 
            needsToAppend = true;
            controller = $('<span id="' + controlsId + '"></span>');
        }

        const playIcon = app.isRunning ? 'fa-pause' : 'fa-play';
        const display = options.display || ((typeof app.getDisplay === "function" ? app.getDisplay() : null) || "");

        controller.html('');
        controller.append(`
            <span class="control-display">` + display + `</span>
            
            <span class="control" id="play-pause">
                <i class="fa-solid ` + playIcon + `"></i>
            </span>
            <span class="control" id="speed-up">
                <i class="fa-regular fa-forward-fast"></i>
            </span>
            
            <span class="control" id="reset">
                <i class="fa-solid fa-power-off"></i>
            </span>
        `);

        const playButton = controller.find('#play-pause');
        const speedUpButton = controller.find('#speed-up');
        const resetButton = controller.find('#reset');

        playButton.off();
        playButton.click((ev) => { 
            ev.preventDefault();
            ev.stopPropagation();
            app.togglePlay();
        });

        speedUpButton.off();
        speedUpButton.click((ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            if (typeof app.setSpeed !== "function") { 
                console.error("Failed to set speed because the app does not have a setSpeed(number) function");
                return;
            }

            let speed = (app.speed || 0) + 0.25;
            if (speed > 3.0) speed = 0.25;
            
            app.setSpeed(speed);
        });

        resetButton.off();
        resetButton.click((ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            if (typeof app.reset !== "function") console.error("The app does not have a reset function");
            else app.reset();
        });

        if (needsToAppend === true) {
            const containerId = options.containerId || "main-header";           
            $('h1#' + containerId).append(controller);
        }
    }
}