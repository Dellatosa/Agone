export default class AgoneItem extends Item {

    chatTemplate = {
        "Arme": "systems/agone/templates/chat/carte-arme.hbs",
        "Armure": "systems/agone/templates/chat/carte-armure.hbs",
        "Danseur": "systems/agone/templates/chat/carte-danseur.hbs",
        "Sort": "systems/agone/templates/chat/carte-sort.hbs",
        "Oeuvre": "systems/agone/templates/chat/carte-oeuvre.hbs",
        "Defaut": "systems/agone/templates/chat/carte-defaut.hbs",
        "Avantage": "systems/agone/templates/chat/carte-avantage.hbs",
        "PouvoirFlamme":"systems/agone/templates/chat/carte-pouvoir-flamme.hbs",
        "PouvoirSaison":"systems/agone/templates/chat/carte-pouvoir-saisonnin.hbs",
        "Connivence":"systems/agone/templates/chat/carte-connivence.hbs",
        "Equipement": "systems/agone/templates/chat/carte-equipement.hbs",
        "Peine": "systems/agone/templates/chat/carte-peine.hbs",
        "Bienfait": "systems/agone/templates/chat/carte-bienfait.hbs"
    }

    prepareData() {
        super.prepareData();
        let data = this.system;

        if(this.type == "Danseur") {
            const memUtilisee = this.getMemoireUtilisee();

            if(data.memoire.max < memUtilisee) {
                this.update({"system.memoire.max": memUtilisee });
                data.memoire.value = 0;
            }
            else {
                data.memoire.value = data.memoire.max - memUtilisee;
            }
        }
    }

    static getDefaultArtwork(itemData) {
        return { img: CONFIG.agone.itemDefImage[itemData.type] ? CONFIG.agone.itemDefImage[itemData.type] : "icons/svg/mystery-man-black.svg" };
    }

    async roll(msgVisible) {
        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        };

        if(!msgVisible) {
            chatData.whisper = game.user.id;
        }
        
        let cardData = {
            ...this,
            isToken: this.actor.isToken ? 1 : 0,
            owner: this.actor.isToken ? this.actor.token.id : this.actor.id,
            _id: this._id
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

            cardData.system.sorts = sorts;
        }

        chatData.content = await foundry.applications.handlebars.renderTemplate(this.chatTemplate[this.type], cardData);

        return ChatMessage.create(chatData);
    }

    updateMemoireDispo(memMax) {
        this.update({"data.memoire.value": memMax - this.getMemoireUtilisee()});
    }

    // Calcul du total de memoire utilisée par les sorts connus
    getMemoireUtilisee() {
        let memUtilisee = 0;

        if(this.system.sortsConnus.length > 0) {
            if(this.actor) {
                // Le danseur est lié à un personnage, on cherche dans les sorts du personnage
                let sortsPerso = this.actor.items.filter(function (item) { return item.type == "Sort"});
                sortsPerso.forEach( sort => {
                    let sc = this.system.sortsConnus.find( id => id == sort.id)
                    if(sc !== undefined) memUtilisee += Math.floor(sort.system.seuil / 5);
                });  
            }
        }

        return memUtilisee;
    }
}

Hooks.on("closeAgoneItemSheet", (itemSheet, html) => onCloseAgoneItemSheet(itemSheet));
Hooks.on("updateItem", (item, modif, info, id) => onUpdateItem(item, modif));
Hooks.on("deleteItem", (item, render, id) => onDeleteItem(item));

function onCloseAgoneItemSheet(itemSheet) {
    // Modification sur une armure
    if(itemSheet.item.type == "Armure") {
        // Le malus de perception dépend du type d'armure
        itemSheet.item.update({"system.malusPerception": CONFIG.agone.typesArmureMalusPer[itemSheet.item.system.type]});
    }
}

function onUpdateItem(item, modif) {
    //if(item.parent.isToken) return;

    // Modification sur une arme
    if(item.type == "Arme" && item.actor && modif.system) {
        for(let[keyData, valData] of Object.entries(modif.system))
        {
            // Si on equipe une arme, les autres ne doivent plus être équipées
            if(keyData == "equipee" && item.actor) {
                item.actor.desequipeArmes(item.id, valData);
            }
        }
    }

    // Modification sur une arme
    if(item.type == "Armure" && item.actor && modif.system) {
        for(let[keyData, valData] of Object.entries(modif.system))
        {
            // Si on equipe une arme, les autres ne doivent plus être équipées
            if(keyData == "equipee" && item.actor) {
                item.actor.desequipeArmures(item.id, valData);
            }
        }
    }
}

function onDeleteItem(item) {
    // En cas de suppression d'un sort, recalcul de la memoire des danseurs
    if(item.type == "Sort" && item.actor) {
        let lstDanseurs = item.actor.items.filter(function (item) { return item.type == "Danseur" });
        lstDanseurs.forEach(danseur => {
            danseur.updateMemoireDispo(danseur.system.memoire.max);
            danseur.system.sortsConnus.splice(danseur.system.sortsConnus.indexOf(item.id), 1);
            danseur.update({"system.sortsConnus": danseur.system.sortsConnus});
        });
    }
}