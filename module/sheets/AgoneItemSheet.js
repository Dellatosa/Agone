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

        if(this.item.type == "Danseur")
        {
            if(this.actor)
            {
                data.data.sortsDispo = this.actor.data.items.filter(function (item) { return item.type == "Sort"});
                console.log(data.data.sortsDispo);
                console.log(data);
                data.data.sortsDispo.forEach( sortDisp => {
                    let sc = data.data.sortsConnus.find( id => id == sortDisp._id);
                    sortDisp.connu = (sc !== undefined) 
                    console.log(sortDisp.name, sortDisp.connu);
                });
            }
        }
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Tout ce qui suit nécessite que la feuille soit éditable
        if (!this.options.editable) return;

        
        if(this.actor.owner) {
            // Ajouter un sort connu au danseur
            html.find('.check-sort-connu').click(this._onAjoutSortDanseur.bind(this));

            // Enlever un sort connu du danseur
            html.find('.uncheck-sort-connu').click(this._onSupprSortDanseur.bind(this));

        }
    }

    _onAjoutSortDanseur(event) {
        event.preventDefault();
        const element = event.currentTarget;
        let sortsConnus = this.item.data.data.sortsConnus;

        let sortId = element.closest(".sort").dataset.itemId;
        console.log("Ajout", sortId);

        sortsConnus.push(sortId);
        this.item.update(this.item.data);
    }

    _onSupprSortDanseur(event) {
        event.preventDefault();
        const element = event.currentTarget;
        let sortsConnus = this.item.data.data.sortsConnus;

        let sortId = element.closest(".sort").dataset.itemId;
        console.log("Suppr", sortId);

        sortsConnus.splice(sortsConnus.indexOf(sortId), 1);
        this.item.update(this.item.data);
    }
}