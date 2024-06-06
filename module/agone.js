import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";
import AgoneActorSheet from "./sheets/AgoneActorSheet.js";
import AgoneItem from "./AgoneItem.js";
import AgoneActor from "./AgoneActor.js";
import AgoneCombat from "./combat/AgoneCombat.js";
import AgoneCombatTracker from "./combat/AgoneCombatTracker.js";
import AgoneCombatant from "./combat/AgoneCombatant.js";
import { registerSystemSettings } from "./settings.js";
import registerHandlebarsHelpers from "./common/helpers.js"
import * as Chat from "./chat.js";
import * as Migrations from "./migration.js";

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
    CONFIG.Combat.documentClass = AgoneCombat;
    //CONFIG.ui.Combat = AgoneCombatTracker;
    CONFIG.Combatant.documentClass = AgoneCombatant;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("agone", AgoneActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("agone", AgoneItemSheet, {makeDefault: true});

    registerSystemSettings();

    preloadHandlebarsTemplates();

    console.log(game);

    // Register custom Handlebars Helpers
	registerHandlebarsHelpers();
});

Hooks.once("setup", function() {
    // Indicates Migration Version
    CONFIG.agone.lastMigrationVer = game.settings.get("agone", "systemMigrationVersion")
});

Hooks.once("ready", async function() {
    Hooks.on("hotbarDrop", (bar, data, slot) => createAgoneMacro(data, slot));

     // Determine whether a system migration is required and feasible
     if ( !game.user.isGM ) return;
     const currentVersion = game.settings.get("agone", "systemMigrationVersion");
     const NEEDS_MIGRATION_VERSION = "0.1.0";
     const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
     if ( !needsMigration ) return;
     Migrations.migrateWorld();
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));

Hooks.on("getChatLogEntryContext", Chat.addChatMessageContextOptions);

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
        "systems/agone/templates/partials/actors/bloc-liste-pouvoirs-flamme-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-pouvoirs-saisonnin-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-peines-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-bienfaits-personnage.hbs",
        "systems/agone/templates/partials/dice/jet-resultat.hbs",
        "systems/agone/templates/partials/dice/jet-resultat-dommages.hbs",
        "templates/dice/roll.html"
    ];

    return loadTemplates(templatePaths);
};

async function createAgoneMacro(data, slot) {
    if (data.type !== "Item") return;
    if (!("data" in data)) return ui.notifications.warn("Vous pouvez créer des raccourçis de macros uniquement pour des objets liés à votre personnage");
    const item = data.data;
  
    // Create the macro command
    const command = `game.agone.rollItemMacro("${item.name}");`;
    let macro = game.macros.contents.find(m => (m.name === item.name) && (m.command === command));
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