export default class AgoneActorSheet extends ActorSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 650,
            height: 850,
            classes: ["agone", "sheet", "actor"]
        });
    }

    get template() {
        console.log(`Agone | chargement du template systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html`);
        return `systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;

        const actorData = data.data;

        // Calcul des scores de bonus d'aspects
        if(actorData.aspects.corps.bonus == "undefined") {
            actorData.aspects.corps.bonus = Object;
        }
        actorData.aspects.corps.bonus.valeur = actorData.aspects.corps.positif.valeur - actorData.aspects.corps.negatif.valeur;

        if(actorData.aspects.esprit.bonus == "undefined") {
            actorData.aspects.esprit.bonus = Object;
        }
        actorData.aspects.esprit.bonus.valeur = actorData.aspects.esprit.positif.valeur - actorData.aspects.esprit.negatif.valeur;

        if(actorData.aspects.ame.bonus == "undefined") {
        actorData.aspects.ame.bonus = Object;
        }
        actorData.aspects.ame.bonus.valeur = actorData.aspects.ame.positif.valeur - actorData.aspects.ame.negatif.valeur;

        // Calcul des scores de Flamme et Flamme noire
        actorData.caracSecondaires.flamme = Math.min(actorData.aspects.corps.positif.valeur, actorData.aspects.esprit.positif.valeur, actorData.aspects.ame.positif.valeur);
        actorData.caracSecondaires.flammeNoire = Math.min(actorData.aspects.corps.negatif.valeur, actorData.aspects.esprit.negatif.valeur, actorData.aspects.ame.negatif.valeur);

        // Calcul des caractéristiques secondaires
        actorData.caracSecondaires.seuilBlessureGrave = 0;
        actorData.caracSecondaires.seuilBlessureCritique = 0;
        actorData.caracSecondaires.bonusDommages = 0;
        actorData.caracSecondaires.chargeMax = 0;
        actorData.caracSecondaires.demiCharge = 0;
        actorData.caracSecondaires.chargeQuotidienne = 0;
        actorData.caracSecondaires.emprise = 0;
        actorData.caracSecondaires.melee = Math.floor((actorData.aspects.corps.caracteristiques.force.valeur + actorData.aspects.corps.caracteristiques.agilite.valeur * 2) / 3);
        actorData.caracSecondaires.tir = Math.floor((actorData.aspects.corps.caracteristiques.perception.valeur + actorData.aspects.corps.caracteristiques.agilite.valeur) / 2);
        actorData.caracSecondaires.art = Math.floor((actorData.aspects.ame.caracteristiques.charisme.valeur + actorData.aspects.ame.caracteristiques.creativite.valeur) / 2);

        // Récupération des traductions pour les caractéristiues
        for (let [key, carac] of Object.entries(actorData.aspects.corps.caracteristiques)) {
            carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
            carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
        }
        
        for (let [key, carac] of Object.entries(actorData.aspects.esprit.caracteristiques)) {
               carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
            carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
        }
        
        for (let [key, carac] of Object.entries(actorData.aspects.ame.caracteristiques)) {
            carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
            carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
        }

         // Récupération des traductions pour les aspects
         for (let [key, aspect] of Object.entries(actorData.aspects)) {
            aspect.positif.label = game.i18n.localize(CONFIG.agone.aspects[key]);
            let keyNoir = key + "N";
            aspect.negatif.label = game.i18n.localize(CONFIG.agone.aspects[keyNoir]);
            let keyBonus = "B" + key;
            aspect.bonus.label = game.i18n.localize(CONFIG.agone.aspects[keyBonus]);
        }

        console.log(actorData);

        return data;
    }
}