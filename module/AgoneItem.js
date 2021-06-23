export default class AgoneItem extends Item {

    chatTemplate = {
        "Arme": "systems/agone/templates/partials/chat/carte-arme.hbs",
        "Armure": "systems/agone/templates/partials/chat/carte-armure.hbs",
        "Danseur": "systems/agone/templates/partials/chat/carte-danseur.hbs",
        "Sort": "systems/agone/templates/partials/chat/carte-sort.hbs",
        "Oeuvre": "systems/agone/templates/partials/chat/carte-oeuvre.hbs"        
    }

    async roll() {
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            ...this.data,
            owner: this.actor.id
        };

        //console.log(cardData);
        
        chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);
        chatData.roll = true;

        return ChatMessage.create(chatData);
    }
}