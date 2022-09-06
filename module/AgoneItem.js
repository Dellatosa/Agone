export default class AgoneItem extends Item {

    chatTemplate = {
        "Arme": "systems/agone/templates/partials/chat/carte-arme.hbs",
        "Armure": "systems/agone/templates/partials/chat/carte-armure.hbs",
        "Danseur": "systems/agone/templates/partials/chat/carte-danseur.hbs",
        "Sort": "systems/agone/templates/partials/chat/carte-sort.hbs",
        "Oeuvre": "systems/agone/templates/partials/chat/carte-oeuvre.hbs",
        "Defaut": "systems/agone/templates/partials/chat/carte-defaut.hbs",
        "Avantage": "systems/agone/templates/partials/chat/carte-avantage.hbs",
        "PouvoirFlamme":"systems/agone/templates/partials/chat/carte-pouvoir-flamme.hbs",
        "PouvoirSaison":"systems/agone/templates/partials/chat/carte-pouvoir-saisonnin.hbs"
    }

    prepareData() {
        super.prepareData();
        let data = this.system;
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
            this.system.sortsConnus.forEach(id => {
                let sort = this.actor.items.get(id);
                if(sort) {
                    if(sort.system.resonance != this.actor.system.caracSecondaires.resonance) {
                        sort.system.diffObedience = true;
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
        if(this.system.sortsConnus.length > 0) {
            // Le danseur a des sorts connus. On déduit leur valeur de la memoire max.
            if(this.actor) {
                // Le danseur est lié à un personnage, on cherche dans les sorts du personnage
                let sortsPerso = this.actor.items.filter(function (item) { return item.type == "Sort"});
                sortsPerso.forEach( sort => {
                    let sc = this.system.sortsConnus.find( id => id == sort.id)
                    if(sc !== undefined) memMax -= Math.floor(sort.system.seuil / 5);
                });  
            }
        }
        this.update({"data.memoire.value": memMax });
    }
}

Hooks.on("closeAgoneItemSheet", (itemSheet, html) => onCloseAgoneItemSheet(itemSheet));
Hooks.on("updateItem", (item, modif, info, id) => onUpdateItem(item, modif));
Hooks.on("deleteItem", (item, render, id) => onDeleteItem(item));
Hooks.on("createItem", (item, render, id) => onCreateItem(item));

function onCloseAgoneItemSheet(itemSheet) {

    // Modification sur une arme
    if(itemSheet.item.type == "Arme" && itemSheet.actor) {
        // Calcul de la différence de TAI entre l'arme et le personnage qui l'utilise
        let diff = itemSheet.item.system.tai - itemSheet.actor.system.caracSecondaires.tai;
        itemSheet.item.update({"system.diffTai": diff });
        if(diff < -1 || diff > 1) {
            itemSheet.item.update({"system.nonUtilisable": true});
        } else {
            itemSheet.item.update({"system.nonUtilisable": false});
        }
    }

    // Modification sur un Danseur
    if(itemSheet.item.type == "Danseur") {
        // Modification de la mémoire max
        itemSheet.item.updateMemoireDispo(itemSheet.item.system.memoire.max);
        // Modification de l'endurance max
        itemSheet.item.update({"system.endurance.value": itemSheet.item.system.endurance.max});
    }

    // Modification sur une armure
    if(itemSheet.item.type == "Armure") {
        // Le malus de perception dépend du type d'armure
        itemSheet.item.update({"system.malusPerception": CONFIG.agone.typesArmureMalusPer[itemSheet.item.system.type]});
    }
}

function onCreateItem(item) {
    if (item.img == "icons/svg/item-bag.svg") {
        console.log(item.type);
        let image = CONFIG.agone.itemDefImage[item.type] ? CONFIG.agone.itemDefImage[item.type] : "icons/svg/mystery-man-black.svg";
        item.img = image;
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
        let lstDanseurs = item.actor.items.filter(function (item) { return item.type == "Danseur" });
        lstDanseurs.forEach(danseur => {
            danseur.updateMemoireDispo(danseur.system.memoire.max)
            danseur.system.sortsConnus.splice(danseur.system.sortsConnus.indexOf(item.id), 1);
            danseur.update({"system.sortsConnus": danseur.system.sortsConnus});
        });
    }
}