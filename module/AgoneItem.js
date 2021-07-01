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

        // if(this.type == "Danseur") {
        //     if(data.memoire.value > data.memoire.max) {
        //         data.memoire.value = data.memoire.max;
        //     }
        // }     
        
        //console.log(this);
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
        
        chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
        chatData.roll = true;

        return ChatMessage.create(chatData);
    }
}

Hooks.on("updateItem", (item, modif, info, id) => onUpdateItem(item, modif));

function onUpdateItem(item, modif) {
    if(item.type == "Danseur") {
        for(let[keyData, valData] of Object.entries(modif.data))
        {
            // Modification de la mémoire max
            if(keyData == "memoire") {
                for(let[keyValue, newVal] of Object.entries(valData)) {
                    if(keyValue == "max") {
                        let memVal = newVal;    // Calcul de la memoire disponible
                        if(item.data.data.sortsConnus.length > 0) {
                            // Le danseur a des sorts connus. On déduit leur valeur de la memoire max.
                            if(item.actor) {
                                // Le danseur est lié à un personnage, on cherche dans les sorts du personnage
                                let sortsPerso = item.actor.data.items.filter(function (item) { return item.type == "Sort"});
                                sortsPerso.forEach( sort => {
                                    let sc = item.data.data.sortsConnus.find( id => id == sort.id)
                                    if(sc !== undefined) memVal -= Math.floor(sort.data.data.seuil / 5);
                                });  
                            }
                        }
                        item.update({"data.memoire.value": memVal });
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
}