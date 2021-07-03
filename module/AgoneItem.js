export default class AgoneItem extends Item {

    chatTemplate = {
        "Arme": "systems/agone/templates/partials/chat/carte-arme.hbs",
        "Armure": "systems/agone/templates/partials/chat/carte-armure.hbs",
        "Danseur": "systems/agone/templates/partials/chat/carte-danseur.hbs",
        "Sort": "systems/agone/templates/partials/chat/carte-sort.hbs",
        "Oeuvre": "systems/agone/templates/partials/chat/carte-oeuvre.hbs"        
    }

    prepareData() {
        super.prepareData();
        let data = this.data.data;
    }

    async roll() {
        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor })
        };

        let cardData = {
            ...this.data,
            owner: this.actor.id
        };

        if(this.type == "Danseur") {
            let sorts = [];
            this.data.data.sortsConnus.forEach(id => {
                let sort = this.actor.items.get(id);
                if(sort.data.data.resonance != this.actor.data.data.caracSecondaires.resonance) {
                    sort.data.data.diffObedience = true;
                }
                sorts.push(sort);
            });

            cardData.data.sorts = sorts;
        }

        if(this.type == "Arme") {
            let diff = this.data.data.tai - this.actor.data.data.caracSecondaires.tai;
            if(diff < -1 || diff > 1) {
                cardData.data.warnTaiArme = true;
            }

        }
        
        chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
        chatData.roll = true;

        return ChatMessage.create(chatData);
    }

    updateMemoireDispo(memMax) {
        if(this.data.data.sortsConnus.length > 0) {
            // Le danseur a des sorts connus. On déduit leur valeur de la memoire max.
            if(this.actor) {
                // Le danseur est lié à un personnage, on cherche dans les sorts du personnage
                let sortsPerso = this.actor.data.items.filter(function (item) { return item.type == "Sort"});
                sortsPerso.forEach( sort => {
                    let sc = this.data.data.sortsConnus.find( id => id == sort.id)
                    if(sc !== undefined) memMax -= Math.floor(sort.data.data.seuil / 5);
                });  
            }
        }
        this.update({"data.memoire.value": memMax });
    }
}

Hooks.on("updateItem", (item, modif, info, id) => onUpdateItem(item, modif));
Hooks.on("deleteItem", (item, render, id) => onDeleteItem(item));

function onUpdateItem(item, modif) {

    // Modification sur un Danseur
    if(item.type == "Danseur") {
        for(let[keyData, valData] of Object.entries(modif.data))
        {
            // Modification de la mémoire max
            if(keyData == "memoire") {
                for(let[keyValue, newVal] of Object.entries(valData)) {
                    if(keyValue == "max") {
                        // Calcul de la memoire disponible
                        item.updateMemoireDispo(newVal);
                    }
                }
            }

            // Modification de l'endurance max
            if(keyData == "endurance") {
                for(let[keyValue, newVal] of Object.entries(valData)) {
                    if(keyValue == "max") {
                        item.update({"data.endurance.value": newVal });
                    }
                }
            }
        }          
    }

    // Modification sur une armure
    if(item.type == "Armure") {
        for(let[keyData, valData] of Object.entries(modif.data))
        {
            // Le malus de perception dépend du type d'armure
            if(keyData == "type") {
                item.update({"data.malusPerception": CONFIG.agone.typesArmureMalusPer[valData]});
            }
        }
    }
}

function onDeleteItem(item) {
    // TODO - en cas de suppression d'un sort, recalcul de la memoire des danseurs
    if(item.type == "Sort" && item.actor) {
        let lstDanseurs = item.actor.data.items.filter(function (item) { return item.type == "Danseur" });
        lstDanseurs.forEach(danseur => {
            console.log(danseur.data.data.memoire.max);
            danseur.updateMemoireDispo(danseur.data.data.memoire.max)
        });
    }
}