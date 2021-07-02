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
                myItemData.sortsDispo.forEach( sortDisp => {
                    let sc = myItemData.data.sortsConnus.find( id => id == sortDisp.id);
                    sortDisp.connu = (sc !== undefined) 
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
        
        let sortId = element.closest(".sort").dataset.itemId;
        const coutMemoire = this.getCoutMemoire(sortId);
        if(coutMemoire) {
            let memoireDispo = typeof(this.item.data.data.memoire.value) == "number" ? this.item.data.data.memoire.value : 0;
            if(memoireDispo >= coutMemoire) {
                let sortsConnus = this.item.data.data.sortsConnus;
                sortsConnus.push(sortId);
                this.item.update({"data.sortsConnus": sortsConnus});

                memoireDispo -= coutMemoire;
                this.item.update({"data.memoire.value": memoireDispo});
            }
            else {
                ui.notifications.warn(game.i18n.localize("agone.notifications.warnMemoireDanseur"));
            }
        } 
        else {
            ui.notifications.error(game.i18n.localize("agone.notifications.errorDonneesSort"));
        }
    }

    _onSupprSortDanseur(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let sortId = element.closest(".sort").dataset.itemId;
        const coutMemoire = this.getCoutMemoire(sortId);
        if(coutMemoire) {
            let memoireDispo = typeof(this.item.data.data.memoire.value) == "number" ? this.item.data.data.memoire.value : 0;

            let sortsConnus = this.item.data.data.sortsConnus;
            sortsConnus.splice(sortsConnus.indexOf(sortId), 1);
            this.item.update({"data.sortsConnus": sortsConnus});

            memoireDispo += coutMemoire;
            this.item.update({"data.memoire.value": memoireDispo});
        }
        else {
            ui.notifications.error(game.i18n.localize("agone.notifications.errorDonneesSort"));
        }
    }

    getCoutMemoire(sortId) {
        const sort = this.actor.items.get(sortId);
        if(sort) {
            const seuil = typeof(sort.data.data.seuil) == "number" ? sort.data.data.seuil : 0;
            return Math.floor(seuil / 5);
        }
        else {
            return null;
        }
    }
}