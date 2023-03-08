class Ui { 
    constructor(elementId = "ui-container") {
        this.menuStates = {};

        const menuItems = $('.menu-item > span.title');

        menuItems.off();
        menuItems.click((ev) => this.toggleMenuItem(ev, this));
    }

    closeMenus() { 
        $('.menu-item').removeClass('show');
    }

    toggleMenuItem(ev, app) {
        ev.preventDefault();
        ev.stopPropagation();

        let menuItem = $(ev.target);
        let i = 0;

        while (!!menuItem.get(0) && !menuItem.attr("id") && i < 10) {
            menuItem = menuItem.parent();
            i++;
        }

        menuItem = menuItem.parent();
        const isOpen = menuItem.hasClass('show');

        app.closeMenus();

        if (isOpen) menuItem.removeClass('show');
        else menuItem.addClass('show');

        return true;
    }

    isMenuItemOpen(id = null) { 
        const menuItems = typeof id === "string" && !!id ? $('#' + id) : $('.menu-item');
        return menuItems.hasClass('show');
    }

    updateValue(value, elementId) { 
        if (typeof value !== "string" && typeof value !== "number") return false;
        $('#' + elementId).val(value);
        
        return true;
    }

    updateHtml(value, elementId) {
        if (typeof value !== "string" && typeof value !== "number") { 
            console.error("Failed to update Html with value: " + value);
            return false;
        }

        value = value.toString();

        $('#' + elementId).html(value);
        return true;
    }

    getElement(id) {
        const elements = this.container.querySelector(`#${id}`);
        return (Array.isArray(elements) && elements.length > 0) ? elements[0] : elements;
    }
}

const ui = new Ui();

