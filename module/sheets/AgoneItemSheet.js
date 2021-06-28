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
        const myItemData = data.data;

        if(this.item.type == "Danseur")
        {
            if(this.actor)
            {
                myItemData.sortsDispo = this.actor.data.items.filter(function (item) { return item.type == "Sort"});
                console.log(data.data.sortsDispo);
                console.log(data);
                myItemData.sortsDispo.forEach( sortDisp => {
                    let sc = myItemData.data.sortsConnus.find( id => id == sortDisp._id);
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

        
        if(this.actor) {
            if(this.actor.isOwner) {
                // Ajouter un sort connu au danseur
                html.find('.check-sort-connu').click(this._onAjoutSortDanseur.bind(this));

                // Enlever un sort connu du danseur
                html.find('.uncheck-sort-connu').click(this._onSupprSortDanseur.bind(this));

                // test activeEffect
                html.find('.activeEffect').click(this._onActiveEffect.bind(this));
            }
        }
    }

    _onActiveEffect(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let effectData = {
            _id: "myActEffect",
            label: "nouvel effet",
            changes: []
        }
        //let activeEffect = new ActiveEffect(effectData, this.actor);
        //let actEffCfg = new ActiveEffectConfig(activeEffect).render();

        let activeEffect = ActiveEffect.create(effectData, this.item);
        activeEffect.sheet.render(true);
        console.log(activeEffect);
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