class ParticleLegend {
    static createUi = (app, containerElementId = "color-matrix") => {
        if (!app || !app.attractionMatrix) { 
            console.error("Failed to create particle legend. App or attraction matrix is null.");
            return null;
        }

        const table = $('<table class="matrix"></table>');

        const colors = ParticleConfig.colors;
        const colorCount = Math.min(app.colorCount, app.attractionMatrix.length);

        if (!Array.isArray(colors)) { 
            console.error("Failed to create particle legend. No colors available.");
            return null;
        }

        const header = $('<tr></tr>');
        header.append($('<td></td>'));

        for (let i = 0; i < colorCount; i++) {
            const color = colors[i].color;
            const colorCell = $('<span x-data="' + i + '" style="background-color:' + color + ';" class="legend-color"></span>');

            colorCell.click((e) => { 
                const result = (typeof app.onCellClick === "function") ?
                    app.onCellClick({ type: "color", index: i, color: colors[i], colorName: colors[i].name, location: "top" }) :
                    undefined;
                console.log("Color Clicked with result: " + result);
            });
            
            header.append($('<td></td>').append(colorCell));
        }

        table.append(header);

        for (let i = 0; i < colorCount; i++) {
            // [<td key={"color-matrix-row" + i}><span style={style} className="legend-color"></span></td>];
            const tr = $('<tr></tr>');
            const td = $('<td></td>');
            const colorCell = $('<span x-data="' + i + '" style="background-color:' + colors[i].color + '" class="legend-color"></span>');

            colorCell.click((e) => { 
                const result = (typeof app.onCellClick === "function") ?
                    app.onCellClick({ type: "color", index: i, color: colors[i], colorName: colors[i].name, location: "left" }) :
                    undefined;
                console.log("Color Clicked: " + result);
            });

            td.append(colorCell);
            tr.append(td);

            for (let j = 0; j < colorCount; j++) {
                const value = app.attractionMatrix[i][j];
                const cell = $('<td>' + value.toFixed(2) + '</td>');
                
                cell.click((e) => {
                    const result = (typeof app.onCellClick === "function") ? app.onCellClick({ type: "cell", row: i, col: j, value: value }) : undefined;
                    if (typeof result === "undefined") console.warn("Cell Clicked: (" + i + ", " + j + "): " + value.toFixed(2) + " - No app.onCellClick handler method found.");

                    if (result === false) return;
                    if (result === true) {
                        //
                        if (!!app.ui && typeof app.ui.closeMenus === "function")
                            app.ui.closeMenus();
                    }
                    // Do something with the value
                });

                tr.append(cell);
            }

            table.append(tr);
            //table.push(<tr key={"color-matrix-row-" + i}>{row}</tr>);
        }

        const container = $('#' + containerElementId);

        if (!container.get(0)) { 
            container = $('<span id="' + containerElementId + '"></span>');
        }

        container.html('');
        container.append(table);

        return container;
    }
}
            