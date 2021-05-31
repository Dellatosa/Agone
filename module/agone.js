import { agone } from "./config.js";
import AgoneItemSheet from "./sheets/AgoneItemSheet.js";

Hooks.once("init", function(){
    console.log("Agone | Initialising Agone RPG System");

    CONFIG.agone = agone;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("agone", AgoneItemSheet, {makeDefault: true});

});