export default class AgoneActorSheet extends ActorSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 650,
            height: 850,
            classes: ["agone", "sheet", "actor"]
        });
    }

    get template() {
        console.log(`Agone | loading systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html template`);
        return `systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;

        const actorData = data.data;
        
        // Calcul des scores de bonus d'aspects
        actorData.aspectsFlamme.aspectCorps.bonusCorps = actorData.aspectsFlamme.aspectCorps.corps - actorData.aspectsFlamme.aspectCorps.corpsNoir;
        actorData.aspectsFlamme.aspectEsprit.bonusEsprit = actorData.aspectsFlamme.aspectEsprit.esprit - actorData.aspectsFlamme.aspectEsprit.espritNoir;
        actorData.aspectsFlamme.aspectAme.bonusAme = actorData.aspectsFlamme.aspectAme.ame - actorData.aspectsFlamme.aspectAme.ameNoire;

        // Calcul des scores de Flamme et Flamme noire
        actorData.aspectsFlamme.flamme = Math.min(actorData.aspectsFlamme.aspectCorps.corps, actorData.aspectsFlamme.aspectEsprit.esprit, actorData.aspectsFlamme.aspectAme.ame);
        actorData.aspectsFlamme.flammeNoire = Math.min(actorData.aspectsFlamme.aspectCorps.corpsNoir, actorData.aspectsFlamme.aspectEsprit.espritNoir, actorData.aspectsFlamme.aspectAme.ameNoire);

        // Calcul des caractéristiques secondaires
        actorData.caracSecondaires.seuilBlessureGrave = 0;
        actorData.caracSecondaires.seuilBlessureCritique = 0;
        actorData.caracSecondaires.bonusDommages = 0;
        actorData.caracSecondaires.chargeMax = 0;
        actorData.caracSecondaires.demiCharge = 0;
        actorData.caracSecondaires.chargeQuotidienne = 0;
        actorData.caracSecondaires.emprise = 0;
        actorData.caracSecondaires.melee = Math.floor((actorData.caracPrimaires.corps.force.valeur + actorData.caracPrimaires.corps.agilite.valeur * 2) / 3);
        actorData.caracSecondaires.tir = Math.floor((actorData.caracPrimaires.corps.perception.valeur + actorData.caracPrimaires.corps.agilite.valeur) / 2);
        actorData.caracSecondaires.art = Math.floor((actorData.caracPrimaires.ame.charisme.valeur + actorData.caracPrimaires.ame.creativite.valeur) / 2);

        console.log(actorData);

        return data;
    }
}