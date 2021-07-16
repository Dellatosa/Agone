import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";
import AgoneActorSheet from "./sheets/AgoneActorSheet.js";
import AgoneItem from "./AgoneItem.js";
import AgoneActor from "./AgoneActor.js";
import * as Chat from "./chat.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/agone/templates/partials/actors/bloc-aspect-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-terne.hbs",
        "systems/agone/templates/partials/actors/bloc-infos-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-flamme-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-competences-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-recap-combat-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-armes-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-armures-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-manoeuvres-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-bottesSecretes-personnage.hbs",
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

    game.agone = {
        AgoneActor,
        AgoneItem,
        rollItemMacro
    };

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
});

Hooks.once("ready", async function() {
    Hooks.on("hotbarDrop", (bar, data, slot) => createAgoneMacro(data, slot));
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));
Hooks.on("getChatLogEntryContext", Chat.addChatMessageContextOptions);

async function createAgoneMacro(data, slot) {
    if (data.type !== "Item") return;
    if (!("data" in data)) return ui.notifications.warn("Vous pouvez créer des raccourçis de macros uniquement pour des objets liés à votre personnage");
    const item = data.data;
  
    // Create the macro command
    const command = `game.agone.rollItemMacro("${item.name}");`;
    let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command: command,
        flags: { "agone.itemMacro": true }
      });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
}

function rollItemMacro(itemName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find(i => i.name === itemName) : null;
    if (!item) return ui.notifications.warn(`Votre personnage ne possède pas d'objet nommé ${itemName}`);
  
    // Trigger the item roll
    return item.roll();
}