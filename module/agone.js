import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";
import AgoneActorSheet from "./sheets/AgoneActorSheet.js";

Hooks.once("init", function(){
    console.log("Agone | Initialisation du système Agone RPG");

    CONFIG.agone = agone;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("agone", AgoneActorSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("agone", AgoneItemSheet, {makeDefault: true});

});