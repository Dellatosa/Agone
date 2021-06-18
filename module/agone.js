import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";
import AgoneActorSheet from "./sheets/AgoneActorSheet.js";
import AgoneItem from "./AgoneItem.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/agone/templates/partials/bloc-aspect-personnage.hbs",
        "systems/agone/templates/partials/bloc-infos-personnage.hbs",
        "systems/agone/templates/partials/bloc-caracSec-personnage.hbs",
        "systems/agone/templates/partials/bloc-competences-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-armes-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-armures-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-danseurs-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-sorts-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-connivences-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-oeuvres-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-defauts-personnage.hbs",
        "systems/agone/templates/partials/bloc-liste-avantages-personnage.hbs",
        "templates/dice/roll.html"
    ];

    return loadTemplates(templatePaths);
};

Hooks.once("init", function(){
    console.log("Agone | Initialisation du système Agone RPG");

    CONFIG.agone = agone;
    CONFIG.Item.entityClass = AgoneItem;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("agone", AgoneActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("agone", AgoneItemSheet, {makeDefault: true});

    preloadHandlebarsTemplates();

    Handlebars.registerHelper("configLocalize", function(liste, val) {
        return game.i18n.localize(agone[liste][val]);
    });
});