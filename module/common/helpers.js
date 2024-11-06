import { agone } from "../config.js";

export default function registerHandlebarsHelpers() {

    Handlebars.registerHelper("times", function (n, block) {
        var accum = "";
        for (var i = 1; i <= n; ++i) {
          block.data.index = i;
          block.data.first = i === 0;
          block.data.last = i === n - 1;
          accum += block.fn(this);
        }
        return accum;
    });

    Handlebars.registerHelper("configLocalize", function(liste, val) {
        return game.i18n.localize(agone[liste][val]);
    });

    Handlebars.registerHelper("configPeupleLocalize", function(val) {
        return val != "" ? game.i18n.localize(agone.peuple[val].label) : "";
    });

    Handlebars.registerHelper("configSymbole", function(val) {
        return game.i18n.localize(agone.symboles[val]);
    });
    
    Handlebars.registerHelper("malusAGI", function(minArme, style, equipee, agi, options) {
        let diff = minArme - agi;
        if(equipee == "deuxMains" && style != "trait") diff -= 1;
        if(diff > 0)
            return options.fn(this);
        else
            return options.inverse(this);
    });
    
    Handlebars.registerHelper("malusFOR", function(minArme, style, equipee, agi, options) {
        let diff = minArme - agi;
        if(equipee == "deuxMains" && style != "trait") diff -= 2;
        if(diff > 0)
            return options.fn(this);
        else
            return options.inverse(this);
    });

    Handlebars.registerHelper("nomSort", function(sorts, id) {
        let result;
        sorts.forEach(sort => {
            if(sort._id == id) result = sort.name;
        });
        return result;
    });

    Handlebars.registerHelper("symboleResonance", function(sorts, id) {
        let result;
        sorts.forEach(sort => {
            if(sort._id == id) result = game.i18n.localize(agone.symboles[sort.system.resonance]);
        });
        return result;
    });
}