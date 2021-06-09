export default class AgoneActorSheet extends ActorSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 670,
            height: 870,
            classes: ["agone", "sheet", "actor"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" }]
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
        console.log(actorData);

        // Calcul des scores de bonus d'aspects
        if(actorData.aspects.corps.bonus == null) {
            actorData.aspects.corps.bonus = {};
        }
        actorData.aspects.corps.bonus.valeur = actorData.aspects.corps.positif.valeur - actorData.aspects.corps.negatif.valeur;

        if(actorData.aspects.esprit.bonus == null) {
            actorData.aspects.esprit.bonus = {};
        }
        actorData.aspects.esprit.bonus.valeur = actorData.aspects.esprit.positif.valeur - actorData.aspects.esprit.negatif.valeur;

        if(actorData.aspects.ame.bonus == null) {
        actorData.aspects.ame.bonus = {};
        }
        actorData.aspects.ame.bonus.valeur = actorData.aspects.ame.positif.valeur - actorData.aspects.ame.negatif.valeur;

        // Calcul des scores de Flamme, Flamme noire et de points d'heroisme
        actorData.caracSecondaires.flamme = Math.min(actorData.aspects.corps.positif.valeur, actorData.aspects.esprit.positif.valeur, actorData.aspects.ame.positif.valeur);
        actorData.caracSecondaires.flammeNoire = Math.min(actorData.aspects.corps.negatif.valeur, actorData.aspects.esprit.negatif.valeur, actorData.aspects.ame.negatif.valeur);
        actorData.caracSecondaires.heroisme.max = actorData.caracSecondaires.flamme * 2;

        // Calcul des caractéristiques secondaires
        actorData.caracSecondaires.seuilBlessureGrave = Math.floor(actorData.caracSecondaires.pdv.max / 3);
        actorData.caracSecondaires.seuilBlessureCritique = Math.floor(actorData.caracSecondaires.pdv.max / 2);
        if(actorData.peuple != "aucun" && actorData.peuple != "" && actorData.peuple != null)
        {
            actorData.caracSecondaires.tai = CONFIG.agone.peuple[actorData.peuple].tai;
            actorData.caracSecondaires.mouvement = CONFIG.agone.peuple[actorData.peuple].mv;
            actorData.caracSecondaires.chargeMax = (actorData.aspects.corps.caracteristiques.force.valeur + actorData.aspects.corps.caracteristiques.resistance.valeur) * CONFIG.agone.peuple[actorData.peuple].mpoids;
            actorData.caracSecondaires.demiCharge = Math.floor(actorData.caracSecondaires.chargeMax / 2);
            actorData.caracSecondaires.chargeQuotidienne = Math.floor(actorData.caracSecondaires.chargeMax / 4);
            actorData.caracSecondaires.bonusDommages = calcBonusDommages(actorData.aspects.corps.caracteristiques.force.valeur, actorData.caracSecondaires.tai);
        } else {
            actorData.caracSecondaires.tai = 0;
            actorData.caracSecondaires.mouvement = 0;
            actorData.caracSecondaires.chargeMax = 0;
            actorData.caracSecondaires.demiCharge = 0;
            actorData.caracSecondaires.chargeQuotidienne = 0;
            actorData.caracSecondaires.bonusDommages = 0;
        }
        
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

function calcBonusDommages(force, tai) {
    let total = force + tai;
    switch(total) {
        case -1:
            return -6;
        case 0:   
            return -4; 
        case 1:   
            return -2; 
        case 2:
        case 3:   
            return -1; 
        case 4:
        case 5:
        case 6:   
            return 0; 
        case 7:
        case 8:
            return 1;
        case 9:
            return 2;
        case 10:
            return 4;
        case 11:
            return 6;
        case 12:
            return 8;
        case 13:
            return 10;
        case 14:
            return 12;
        case 15:
            return 15;
        case 16:
            return 18;
        case 17:
            return 21;
        case 18:
            return 24;
        case 19:
            return 27;
        case 20:
            return 31;
        case 21:
            return 35;
        case 22:
            return 39;
        case 23:
            return 43;
             
    }
}