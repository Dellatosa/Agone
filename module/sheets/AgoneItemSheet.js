export default class AgoneItemSheet extends ItemSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 550,
            height: 370,
            classes: ["agone", "sheet", "item"]
        });
    }

    get template() {
        return `systems/agone/templates/sheets/${this.item.data.type}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;
        return data;
    }
}