import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', 'button.attaque', onAttaque);
}

function onAttaque(event) {
    const card = event.currentTarget.closest(".arme");
    let attaquant = game.actors.get(card.dataset.ownerId);
    let arme = attaquant.getOwnedItem(card.dataset.itemId); 

    Dice.attaque(attaquant, arme);
}

// Pour test - on Reload
function onReload(event) {
    const card = event.currentTarget.closest(".arme");
    let attaquant = game.actors.get(card.dataset.ownerId);
    let weapon = attaquant.getOwnedItem(card.dataset.itemId);

    Dice.reloadCheck(weapon);
}