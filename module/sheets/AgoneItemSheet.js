export default class AgoneItemSheet extends ItemSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
            height: 370,
            classes: ["agone", "sheet", "item"]
        });
    }

    get template() {
        console.log(`Agone | loading systems/agone/templates/sheets/items/${this.item.data.type}-sheet.html template`);
        return `systems/agone/templates/sheets/items/${this.item.data.type}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;

        return data;
    }
}