import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";
import AgoneActorSheet from "./sheets/AgoneActorSheet.js";
import AgoneDemonSheet from "./sheets/AgoneDemonSheet.js";
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
    //CONFIG.Combat.documentClass = AgoneCombat;
    //CONFIG.ui.Combat = AgoneCombatTracker;
    CONFIG.Combatant.documentClass = AgoneCombatant;
 
    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
    foundry.documents.collections.Actors.registerSheet("agone", AgoneActorSheet, {types: ["Personnage", "Damne", "Terne"], makeDefault: true});
    foundry.documents.collections.Actors.registerSheet("agone", AgoneDemonSheet, {types: ["Demon"], makeDefault: true});

    foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
    foundry.documents.collections.Items.registerSheet("agone", AgoneItemSheet, {makeDefault: true});

    registerSystemSettings();

    preloadHandlebarsTemplates();

    console.log(game);

    // Register custom Handlebars Helpers
	registerHandlebarsHelpers();
});

Hooks.once("setup", function() {
    // Indicates Migration Version
    CONFIG.agone.lastMigrationVer = game.settings.get("agone", "systemMigrationVersion");

    game.actors.forEach(actor => {
        actor.setFlag(game.system.id, "TabMagieActif", "emprise");
    });

    game.actors.forEach(actor => {
        actor.setFlag(game.system.id, "TabHistoActif", "avantagesDefauts");
    });
});

Hooks.once("ready", async function() {
    Hooks.on("hotbarDrop", (bar, data, slot) => { 
        createAgoneMacro(data, slot);
        return false;
    });

     // Determine whether a system migration is required and feasible
     if ( !game.user.isGM ) return;
     const currentVersion = game.settings.get("agone", "systemMigrationVersion");
     const NEEDS_MIGRATION_VERSION = "0.1.7";
     const needsMigration = !currentVersion || foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
     if ( !needsMigration ) return;
     Migrations.migrateWorld();
});

//Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));

Hooks.on("renderChatMessageHTML", (message, html, context) => Chat.addChatMessageListeners(html));

Hooks.on("getChatLogEntryContext", Chat.addChatMessageContextOptions);

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        // Entête
        "systems/agone/templates/partials/actors/bloc-infos-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-infos-personnage-unlocked.hbs",
        "systems/agone/templates/partials/actors/bloc-infos-demon.hbs",
        "systems/agone/templates/partials/actors/bloc-infos-demon-unlocked.hbs",
        "systems/agone/templates/partials/actors/bloc-flamme-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-personnage-unlocked.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-damne-unlocked.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-terne.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-terne-unlocked.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-demon.hbs",
        "systems/agone/templates/partials/actors/bloc-aspect-demon-unlocked.hbs",
        // Onglet Compétences
        "systems/agone/templates/partials/actors/bloc-competences-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-competences-demon.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-competences-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-competences-personnage-unlocked.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-competences-demon.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-competences-demon-unlocked.hbs",
        // Onglet Combat
        "systems/agone/templates/partials/actors/bloc-combat-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-combat-demon.hbs",
        "systems/agone/templates/partials/actors/bloc-armes-nat-demon.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-armes-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-armures-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-manoeuvres-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-bottesSecretes-personnage.hbs",
        // Onglet Magie
        "systems/agone/templates/partials/actors/bloc-magie-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-danseurs-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-sorts-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-oeuvres-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-connivences-personnage-v2.hbs",
        // Onglet Equipement
        "systems/agone/templates/partials/actors/bloc-equipement-personnage.hbs",
        "systems/agone/templates/partials/actors/ligne-equipement-base.hbs",
        "systems/agone/templates/partials/actors/ligne-equipement-charge.hbs",
        "systems/agone/templates/partials/actors/ligne-equipement-edition.hbs",
        "systems/agone/templates/partials/actors/ligne-equipement-porter.hbs",
        // Onglet Historique
        "systems/agone/templates/partials/actors/bloc-historique-personnage.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-defauts-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-avantages-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-pouvoirs-flamme-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-pouvoirs-saisonnin-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-peines-personnage-v2.hbs",
        "systems/agone/templates/partials/actors/bloc-liste-bienfaits-personnage-v2.hbs",
        // Jet de dés
        "systems/agone/templates/partials/dice/jet-resultat.hbs",
        "systems/agone/templates/partials/dice/jet-resultat-dommages.hbs",
        "systems/agone/templates/partials/dice/jet-dices-details.hbs"//,
        //"templates/dice/roll.html"
    ];

    return foundry.applications.handlebars.loadTemplates(templatePaths);
};

async function createAgoneMacro(data, slot) {

    if (data.type !== "Item") return;
    const actor = game.actors.get(foundry.utils.parseUuid(data.uuid).documentId);
    const item = actor.items.get(foundry.utils.parseUuid(data.uuid).embedded[1]);
    if (!(actor.isOwner && item.isOwner)) return ui.notifications.warn(game.i18n.localize("agone.notifications.warnErrCreaMacro"));

    // Create the macro command
    const command = `game.agone.rollItemMacro("${item.name}");`;
    let macro = game.macros.contents.find(m => (m.name === item.name) && (m.command === command));

    const ownMap = new Map();
    ownMap.set(game.userId, 3);
    ownMap.set("default", 3);

    if (!macro) {
        macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        ownership :  Object.fromEntries(ownMap) ,
        command: command,
        flags: { "agone.itemMacro": true }
      });
    }

    game.user.assignHotbarMacro(macro, slot);
}

function rollItemMacro(itemName) {
    let actor;

    // First choice - Actor linked to selected Token
    const speaker = ChatMessage.getSpeaker();
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    
    // Second choice - Actor linked to active player
    if (!actor) actor = game.actors.get(speaker.actor);
    
    if(!actor) return ui.notifications.warn(game.i18n.localize("agone.notifications.warnErrUseMacro"));
    
    const item = actor.items.find(i => i.name === itemName);
    if (!item) return ui.notifications.warn(`Le personnage '${actor.name}' ne possède pas d'objet nommé ${itemName}`);
  
    // Trigger the item roll
    return item.roll();
}