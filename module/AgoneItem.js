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