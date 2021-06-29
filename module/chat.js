import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', 'button.attaque', onAttaque);
    html.on('click', 'button.parade', onParade);
    html.on('click', 'button.jet-sort', onSort);
    html.on('click', 'a.editer-item', onEditItem)
}

function onSort(event) {
    const card = event.currentTarget.closest(".danseur");
    const sortCard = event.currentTarget.closest(".sort");
    let mage = game.actors.get(card.dataset.ownerId)
    let danseur = mage.items.get(card.dataset.itemId);
    let sort = mage.items.get(sortCard.dataset.sortId);

    Dice.sortEmprise(mage, danseur, sort);
}

function onEditItem(event) {
    const card = event.currentTarget.closest(".danseur");
    const sortCard = event.currentTarget.closest(".sort");
    let mage = game.actors.get(card.dataset.ownerId);
    let sortItem = mage.items.get(sortCard.dataset.sortId);

    sortItem.sheet.render(true);
}

function onAttaque(event) {
    const card = event.currentTarget.closest(".arme");
    let attaquant = game.actors.get(card.dataset.ownerId);
    let arme = attaquant.items.get(card.dataset.itemId); 

    Dice.actionArme(attaquant, arme, "Attaque");
}

function onParade(event) {
    const card = event.currentTarget.closest(".arme");
    let defenseur = game.actors.get(card.dataset.ownerId);
    let arme = defenseur.items.get(card.dataset.itemId);

    Dice.actionArme(defenseur, arme, "Parade");
}

// Pour test
export function addChatMessageContextOptions(html, options) {
    let condOK = li => li.find(".jet-arme.dommages").length;

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
    const dommagesArme = parseInt(attaque.find(".dommages").attr("data-arme-dommages"));
    const rollResult = parseInt(attaque.find(".dice-total").text());
}