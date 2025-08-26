import AgoneActiveEffectConfig from "./AgoneActiveEffectConfig.js";

export default class AgoneItemSheet extends foundry.appv1.sheets.ItemSheet {
     
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 550,
            height: 'auto', //370,
            classes: ["agone", "sheet", "item"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    get template() {
        console.log(`Agone | loading systems/agone/templates/sheets/items/${this.item.type.toLowerCase()}-sheet.html template`);
        return `systems/agone/templates/sheets/items/${this.item.type.toLowerCase()}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;
        const myItemData = data.data.system;

        if(this.item.type == "Danseur")
        {
            if(this.actor)
            {
                myItemData.sortsDispo = this.actor.items.filter(function (item) { return item.type == "Sort"});
                myItemData.sortsDispo.forEach( sortDisp => {
                    let sc = myItemData.sortsConnus.find( id => id == sortDisp.id);
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
            }
        }

        // Liste d'items dans la feuille
        // Création d'un item
        html.find('.creer-effet').click(this._onCreerEffet.bind(this));
        
        // Edition d'un item
        html.find('.editer-effet').click(this._onEditerEffet.bind(this));

        //Suppression d'un item
        html.find('.supprimer-effet').click(this._onSupprimerEffet.bind(this));
    }

    _onCreerEffet(event) {
        event.preventDefault();

        return this.item.createEmbeddedDocuments("ActiveEffect", [{
            name: "Nouvel effet",
            icon: "icons/svg/aura.svg",
            origin: this.item.uuid
          }]);
    }

    _onEditerEffet(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let effectId = element.closest(".effet").dataset.effectId;
        let effet = this.item.effects.get(effectId);

        new AgoneActiveEffectConfig(effet).render(true);
    }

    _onSupprimerEffet(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let effectId = element.closest(".effet").dataset.effectId;
        let effet = this.item.effects.get(effectId);

        effet.delete();
    }

    _onAjoutSortDanseur(event) {
        event.preventDefault();
        const element = event.currentTarget;
        
        let sortId = element.closest(".sort").dataset.itemId;
        const coutMemoire = this.getCoutMemoire(sortId);
        if(coutMemoire) {
            let memoireDispo = typeof(this.item.system.memoire.value) == "number" ? this.item.system.memoire.value : 0;
            if(memoireDispo >= coutMemoire) {
                let sortsConnus = this.item.system.sortsConnus;
                sortsConnus.push(sortId);
                this.item.update({"system.sortsConnus": sortsConnus});

                memoireDispo -= coutMemoire;
                this.item.update({"system.memoire.value": memoireDispo});
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
            let memoireDispo = typeof(this.item.system.memoire.value) == "number" ? this.item.system.memoire.value : 0;

            let sortsConnus = this.item.system.sortsConnus;
            sortsConnus.splice(sortsConnus.indexOf(sortId), 1);
            this.item.update({"system.sortsConnus": sortsConnus});

            memoireDispo += coutMemoire;
            this.item.update({"system.memoire.value": memoireDispo});
        }
        else {
            ui.notifications.error(game.i18n.localize("agone.notifications.errorDonneesSort"));
        }
    }

    getCoutMemoire(sortId) {
        const sort = this.actor.items.get(sortId);
        if(sort) {
            const seuil = typeof(sort.system.seuil) == "number" ? sort.system.seuil : 0;
            return Math.floor(seuil / 5);
        }
        else {
            return null;
        }
    }
}