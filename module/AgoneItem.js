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
            isToken: this.actor.isToken ? 1 : 0,
            owner: this.actor.isToken ? this.actor.token.id : this.actor.id
        };

        if(this.type == "Danseur") {
            let sorts = [];
            this.data.data.sortsConnus.forEach(id => {
                let sort = this.actor.items.get(id);
                if(sort) {
                    if(sort.data.data.resonance != this.actor.data.data.caracSecondaires.resonance) {
                        sort.data.data.diffObedience = true;
                    }
                    sorts.push(sort);
                }
            });

            cardData.data.sorts = sorts;
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

Hooks.on("closeAgoneItemSheet", (itemSheet, html) => onCloseAgoneItemSheet(itemSheet));
Hooks.on("updateItem", (item, modif, info, id) => onUpdateItem(item, modif));
Hooks.on("deleteItem", (item, render, id) => onDeleteItem(item));

function onCloseAgoneItemSheet(itemSheet) {

    // Modification sur une arme
    if(itemSheet.item.type == "Arme" && itemSheet.actor) {
        // Calcul de la différence de TAI entre l'arme et le personnage qui l'utilise
        let diff = itemSheet.item.data.data.tai - itemSheet.actor.data.data.caracSecondaires.tai;
        itemSheet.item.update({"data.diffTai": diff });
        if(diff < -1 || diff > 1) {
            itemSheet.item.update({"data.nonUtilisable": true});
        } else {
            itemSheet.item.update({"data.nonUtilisable": false});
        }
    }

    // Modification sur un Danseur
    if(itemSheet.item.type == "Danseur") {
        // Modification de la mémoire max
        itemSheet.item.updateMemoireDispo(itemSheet.item.data.data.memoire.max);
        // Modification de l'endurance max
        itemSheet.item.update({"data.endurance.value": itemSheet.item.data.data.endurance.max});
    }

    // Modification sur une armure
    if(itemSheet.item.type == "Armure") {
        // Le malus de perception dépend du type d'armure
        itemSheet.item.update({"data.malusPerception": CONFIG.agone.typesArmureMalusPer[itemSheet.item.data.data.type]});
    }
}

function onUpdateItem(item, modif) {
    //if(item.parent.isToken) return;

    // Modification sur un Danseur
    /* if(item.type == "Danseur" && modif.data) {
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
    } */

    // Modification sur une arme
     if(item.type == "Arme" && item.actor && modif.data) {
        for(let[keyData, valData] of Object.entries(modif.data))
        {
            /*if(keyData == "tai" && valData != null) {
                let diff = valData - item.actor.data.data.caracSecondaires.tai;
                item.update({"data.diffTai": diff });
                if(diff < -1 || diff > 1) {
                    item.update({"data.nonUtilisable": true});
                } else {
                    item.update({"data.nonUtilisable": false});
                }
            }*/

            // Si on equipe une arme, les autres ne doivent plus être équipées
            if(keyData == "equipee" && item.actor) {
                item.actor.desequipeArmes(item.id, valData);
            }
        }
    }

    // Modification sur une armure
    /* if(item.type == "Armure" && modif.data) {
        for(let[keyData, valData] of Object.entries(modif.data))
        {
            // Le malus de perception dépend du type d'armure
            if(keyData == "type") {
                item.update({"data.malusPerception": CONFIG.agone.typesArmureMalusPer[valData]});
            }
        }
    } */
}

function onDeleteItem(item) {
    // En cas de suppression d'un sort, recalcul de la memoire des danseurs
    if(item.type == "Sort" && item.actor) {
        let lstDanseurs = item.actor.data.items.filter(function (item) { return item.type == "Danseur" });
        lstDanseurs.forEach(danseur => {
            danseur.updateMemoireDispo(danseur.data.data.memoire.max)
            danseur.data.data.sortsConnus.splice(danseur.data.data.sortsConnus.indexOf(item.id), 1);
            danseur.update({"data.sortsConnus": danseur.data.data.sortsConnus});
        });
    }
}