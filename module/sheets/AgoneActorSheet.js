export default class AgoneActorSheet extends ActorSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 600,
            height: 700,
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

        //console.log(game);
        //console.log(data);

        return data;
    }
}