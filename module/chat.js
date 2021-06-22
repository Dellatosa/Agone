import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', 'button.attaque', onAttaque);
    html.on('click', 'button.parade', onParade);
}

function onAttaque(event) {
    const card = event.currentTarget.closest(".arme");
    let attaquant = game.actors.get(card.dataset.ownerId);
    let arme = attaquant.getOwnedItem(card.dataset.itemId); 

    Dice.attaque(attaquant, arme);
}

function onParade(event) {
    const card = event.currentTarget.closest(".arme");
    let defenseur = game.actors.get(card.dataset.ownerId);
    let arme = defenseur.getOwnedItem(card.dataset.itemId);

    Dice.parade(defenseur, arme);
}

// Pour test
export function addChatMessageContextOptions(html, options) {
    let condOK = li => li.find(".jet-comp.attaque").length;

    options.push( 
        {
            name:  "Test",//game.i18n.localize("agone.chat.menu"),
            icon: '<i class="fas fa-shield-alt"></i>',
            condition: condOK,
            callback: li => Test(li)
        }
    );

    return options;
}

async function Test(attaque) {
    const dommagesArme = parseInt(attaque.find(".attaque").attr("data-arme-dommages"));
    const rollResult = parseInt(attaque.find(".dice-total").text());

    console.log("TEST dommagesArme", dommagesArme);
    console.log("TEST rollResult", rollResult);
}