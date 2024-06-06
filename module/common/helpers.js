import { agone } from "../config.js";

export default function registerHandlebarsHelpers() {

    Handlebars.registerHelper("configLocalize", function(liste, val) {
        return game.i18n.localize(agone[liste][val]);
    });
    
    Handlebars.registerHelper("malusAGI", function(minArme, style, equipee, agi, options) {
        let diff = minArme - agi;
        if(equipee == "2mains" && style != "trait") diff -= 1;
        if(diff > 0)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    
    Handlebars.registerHelper("malusFOR", function(minArme, style, equipee, agi, options) {
        let diff = minArme - agi;
        if(equipee == "2mains" && style != "trait") diff -= 2;
        if(diff > 0)
            return options.fn(this);
        else
            return options.inverse(this);
    });
}