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
        actorData.flamme.aspectCorps.bonusCorps = actorData.flamme.aspectCorps.corps - actorData.flamme.aspectCorps.corpsNoir;
        actorData.flamme.aspectEsprit.bonusEsprit = actorData.flamme.aspectEsprit.esprit - actorData.flamme.aspectEsprit.espritNoir;
        actorData.flamme.aspectAme.bonusAme = actorData.flamme.aspectAme.ame - actorData.flamme.aspectAme.ameNoire;

        // Calcul des scores de Flamme et Flamme noire
        actorData.flamme.scoreFlamme = Math.min(actorData.flamme.aspectCorps.corps, actorData.flamme.aspectEsprit.esprit, actorData.flamme.aspectAme.ame);
        actorData.flamme.scoreFlammeNoire = Math.min(actorData.flamme.aspectCorps.corpsNoir, actorData.flamme.aspectEsprit.espritNoir, actorData.flamme.aspectAme.ameNoire);

        console.log(actorData);

        return data;
    }
}