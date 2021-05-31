export default class AgoneItemSheet extends ItemSheet {
     
    get template() {
        return `systems/agone/templates/sheets/${this.item.data.type}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;
        return data;
    }
}