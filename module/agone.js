import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";
import AgoneActorSheet from "./sheets/AgoneActorSheet.js";
import AgoneItem from "./AgoneItem.js";
import AgoneActor from "./AgoneActor.js";
import * as Chat from "./chat.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/agone/templates/partials/actors/bloc-aspect-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-infos-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-flamme-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-caracSec-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-competences-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-recap-combat-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-armes-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-armures-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-recap-emprise-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-danseurs-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-sorts-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-recap-artsmagiques-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-oeuvres-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-recap-conjuration-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-connivences-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-defauts-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-avantages-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-recap-equipement-personnage.hbs",
        "templates/dice/roll.html"
    ];

    return loadTemplates(templatePaths);
};

Hooks.once("init", function(){
    console.log("Agone | Initialisation du système Agone RPG");

    //CONFIG.debug.hooks = true;

    CONFIG.agone = agone;
    CONFIG.Item.documentClass = AgoneItem;
    CONFIG.Actor.documentClass = AgoneActor;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("agone", AgoneActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("agone", AgoneItemSheet, {makeDefault: true});

    preloadHandlebarsTemplates();

    Handlebars.registerHelper("configLocalize", function(liste, val) {
        return game.i18n.localize(agone[liste][val]);
    });
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));
Hooks.on("getChatLogEntryContext", Chat.addChatMessageContextOptions);

Hooks.on("updateItem", (item, modif, info, id) => console.log(item, modif));
