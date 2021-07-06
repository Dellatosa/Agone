import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', 'button.attaque', onAttaque);
    html.on('click', 'button.parade', onParade);
    html.on('click', 'button.initiative', onInitiative);
    html.on('click', 'button.jet-sort', onJetSort);
    html.on('click', 'a.editer-item-sort', onEditItemSort)
    html.on('click', 'button.jet-contre-magie', onJetContreMagie);
    html.on('click', 'a.editer-item-ctr-magie', onEditItemContreMagie);
    html.on('click', 'button.jet-reconn-oeuvre', onJetReconnOeuvre);
}

function onJetSort(event) {
    const card = event.currentTarget.closest(".danseur");
    const sortCard = event.currentTarget.closest(".sort");
    let mage = game.actors.get(card.dataset.ownerId)
    let danseur = mage.items.get(card.dataset.itemId);
    let sort = mage.items.get(sortCard.dataset.sortId);

    Dice.sortEmprise(mage, danseur, sort);
}

function onJetContreMagie(event) {
    const card = event.currentTarget.closest(".ctr-magie");
    const danseurCard = event.currentTarget.closest(".danseur");
    let mage = game.actors.get(card.dataset.ownerId)
    let danseur = mage.items.get(danseurCard.dataset.danseurId);

    Dice.contreMagie(mage, danseur);
}

function onJetReconnOeuvre(event) {
    const card = event.currentTarget.closest(".reconn-oeuvre");
    const artCard = event.currentTarget.closest(".jet-reconn-oeuvre");
    let artiste = game.actors.get(card.dataset.ownerId);
    let artId =  artCard.dataset.artId;

    console.log("Artiste", artiste, "artId", artId);

    let caracData = artiste.getCaracData("art");
    let compData = artiste.getCompData("occulte", "artsMagiques", artId);

    Dice.jetCompetence({
        actor: artiste,
        rangComp: compData.rangComp,
        labelComp: compData.labelComp,
        specialisation: compData.specialisation,
        labelSpecialisation: compData.labelSpecialisation,
        jetDefautInterdit: compData.jetDefautInterdit,
        rangCarac: caracData.rangCarac,
        labelCarac: caracData.labelCarac,
        bonusAspect: caracData.bonusAspect,
        labelAspect: caracData.labelAspect,
        titrePersonnalise: game.i18n.localize("agone.actors.jetReconnOeuvre"),
        afficherDialog: false
    });
}

function onEditItemSort(event) {
    const card = event.currentTarget.closest(".danseur");
    const sortCard = event.currentTarget.closest(".sort");
    let mage = game.actors.get(card.dataset.ownerId);
    let sortItem = mage.items.get(sortCard.dataset.sortId);

    sortItem.sheet.render(true);
}

function onEditItemContreMagie(event) {
    const card = event.currentTarget.closest(".ctr-magie");
    const danseurCard = event.currentTarget.closest(".danseur");
    let mage = game.actors.get(card.dataset.ownerId);
    let danseurItem = mage.items.get(danseurCard.dataset.danseurId);

    danseurItem.sheet.render(true);
}

function onAttaque(event) {
    const card = event.currentTarget.closest(".arme");
    let attaquant = game.actors.get(card.dataset.ownerId);
    let arme = attaquant.items.get(card.dataset.itemId); 

    Dice.combatArme(attaquant, arme, "Attaque");
}

function onParade(event) {
    const card = event.currentTarget.closest(".arme");
    let defenseur = game.actors.get(card.dataset.ownerId);
    let arme = defenseur.items.get(card.dataset.itemId);

    Dice.combatArme(defenseur, arme, "Parade");
}

function onInitiative(event) {
    const card = event.currentTarget.closest(".arme");
    let combattant = game.actors.get(card.dataset.ownerId);
    let arme = combattant.items.get(card.dataset.itemId);

    combattant.rollInitiativePerso(arme);
}

export async function selDanseurContreMagie(actor, danseurs) {
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    };

    let cardData = {
        danseurs: danseurs,
        owner: actor.id
    };

    chatData.content = await renderTemplate("systems/agone/templates/partials/chat/carte-contre-magie.hbs", cardData);
    chatData.roll = true;

    return ChatMessage.create(chatData);
}

export async function selArtMagiqueReconnOeuvre(actor, arts) {
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    };

    let cardData = {
        arts: arts,
        owner: actor.id
    };

    chatData.content = await renderTemplate("systems/agone/templates/partials/chat/carte-reconn-oeuvre.hbs", cardData);
    chatData.roll = true;

    return ChatMessage.create(chatData);
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