import { agone } from "./config.js";

export const registerSystemSettings = function() {
    
    // Suggestions des échecs ctitiques envoyées à l'EG
    game.settings.register("agone","suggestEchecCritEG", {
        config: true,
        scope: "world",
        name: "parametres.suggestEchecCritEG.nom",
        hint: "parametres.suggestEchecCritEG.label",
        type: Boolean,
        default: true
    });

    // Activer la gestion des rencontres
    game.settings.register("agone","gestionDesRencontres", {
        config: false,
        scope: "world",
        name: "parametres.gestionDesRencontres.nom",
        hint: "parametres.gestionDesRencontres.label",
        type: Boolean,
        default: false
    });

    // Autoriser la sélection de cibles multiples sur un jet d'Attaque
    game.settings.register("agone","ciblesMultiSurAttaque", {
        config: game.settings.get("agone","gestionDesRencontres"),
        scope: "world",
        name: "parametres.ciblesMultiSurAttaque.nom",
        hint: "parametres.ciblesMultiSurAttaque.label",
        type: Boolean,
        default: false
    });

    game.settings.register("agone","lienTableCritiqueContusion", {
        config: true,
        scope: "world",
        name: "parametres.lienTableCritiqueContusion.nom",
        hint: "parametres.lienTableCritiqueContusion.label",
        type:String,
        default: ""
    });

    game.settings.register("agone","lienTableCritiquePerforation", {
        config: true,
        scope: "world",
        name: "parametres.lienTableCritiquePerforation.nom",
        hint: "parametres.lienTableCritiquePerforation.label",
        type:String,
        default: ""
    });

    game.settings.register("agone","lienTableCritiqueTaille", {
        config: true,
        scope: "world",
        name: "parametres.lienTableCritiqueTaille.nom",
        hint: "parametres.lienTableCritiqueTaille.label",
        type:String,
        default: ""
    });

    /**
    * Track the system version upon which point a migration was last applied
    */
    game.settings.register("agone", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: 0,
        onChange: () => agone.lastMigrationVer = game.settings.get("agone", "systemMigrationVersion")
    });
}