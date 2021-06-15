import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";
import AgoneActorSheet from "./sheets/AgoneActorSheet.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/agone/templates/partials/bloc-aspect-personnage.hbs",
        "systems/agone/templates/partials/bloc-infos-personnage.hbs",
        "systems/agone/templates/partials/bloc-caracSec-personnage.hbs",
        "systems/agone/templates/partials/bloc-listearmes-personnage.hbs"
    ];

    return loadTemplates(templatePaths);
};

Hooks.once("init", function(){
    console.log("Agone | Initialisation du système Agone RPG");

    CONFIG.agone = agone;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("agone", AgoneActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("agone", AgoneItemSheet, {makeDefault: true});

    preloadHandlebarsTemplates();
});