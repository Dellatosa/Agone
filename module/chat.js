import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', 'button.attaque', onAttaque);
    html.on('click', 'button.parade', onParade);
    html.on('click', 'button.initiative', onInitiative);
    html.on('click', 'button.jet-sort', onJetSort);
    html.on('click', 'button.jet-sort-intuitif', onJetSortIntuitif);
    html.on('click', 'a.editer-item-sort', onEditItemSort)
    html.on('click', 'button.jet-contre-magie', onJetContreMagie);
    html.on('click', 'a.editer-item-ctr-magie', onEditItemContreMagie);
    html.on('click', 'button.jet-reconn-oeuvre', onJetReconnOeuvre);
    html.on('click', 'button.jet-desaccord', onJetDesaccord);
    html.on('click', 'button.jet-oeuvre', onJetOeuvre);
    html.on('click', 'button.jet-art-improvise', onJetArtImprovise);
}

function onJetSort(event) {
    const card = event.currentTarget.closest(".danseur");
    const sortCard = event.currentTarget.closest(".sort");
    let mage = getCardActor(card);
    let danseur = mage.items.get(card.dataset.itemId);
    let sort = mage.items.get(sortCard.dataset.sortId);

    if(sort.system.resonance == "" || sort.system.resonance == "aucun" || sort.system.seuil <= 0) {
        ui.notifications.warn(game.i18n.localize("agone.notifications.errorDonneesSort"));
        return;
    }

    Dice.sortEmprise(mage, danseur, sort);
}

function onJetSortIntuitif(event) {
    const card = event.currentTarget.closest(".danseur");
    let mage = getCardActor(card);
    let danseur = mage.items.get(card.dataset.itemId);

    Dice.sortEmprise(mage, danseur, null, true);
}

function onJetOeuvre(event) {
    const card = event.currentTarget.closest(".oeuvre");
    let artiste = getCardActor(card);
    let oeuvre = artiste.items.get(card.dataset.itemId);

    if(oeuvre.system.artMagique == "" || oeuvre.system.artMagique == "aucun" || oeuvre.system.seuil <= 0) {
        ui.notifications.warn(game.i18n.localize("agone.notifications.errorDonneesOeuvre"));
        return;
    }

    Dice.oeuvre(artiste, oeuvre);
}

function onJetContreMagie(event) {
    const card = event.currentTarget.closest(".ctr-magie");
    const danseurCard = event.currentTarget.closest(".danseur");
    let utiliseHeroisme = event.currentTarget.ownerDocument.getElementsByClassName('util-hero').utiliseHeroisme.checked;
    let mage = getCardActor(card);
    let danseur = mage.items.get(danseurCard.dataset.danseurId);

    Dice.contreMagie(mage, danseur, utiliseHeroisme);
}

function onJetReconnOeuvre(event) {
    const card = event.currentTarget.closest(".reconn-oeuvre");
    const artCard = event.currentTarget.closest(".jet-reconn-oeuvre");
    let utiliseHeroisme = event.currentTarget.closest(".reconn-oeuvre").getElementsByClassName('util-hero').utiliseHeroisme.checked;
    let artiste = getCardActor(card);
    let artId =  artCard.dataset.artId;

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
        utiliseHeroisme: utiliseHeroisme,
        titrePersonnalise: game.i18n.localize("agone.actors.jetReconnOeuvre"),
        afficherDialog: false
    });
}

function onJetDesaccord(event) {
    const card = event.currentTarget.closest(".instrument-desaccord");
    const instrumentCard = event.currentTarget.closest(".jet-desaccord");
    let utiliseHeroisme = event.currentTarget.closest(".instrument-desaccord").getElementsByClassName('util-hero').utiliseHeroisme.checked;
    let artiste = getCardActor(card);
    let instrument =  instrumentCard.dataset.instrument;

    Dice.desaccord(artiste, instrument, utiliseHeroisme);
}

function onJetArtImprovise(event) {
    const card = event.currentTarget.closest(".art-improvise");
    const artCard = event.currentTarget.closest(".jet-art-improvise");
    let artiste = getCardActor(card);
    let artId =  artCard.dataset.artId;

    Dice.oeuvre(artiste, null, artId, true);
}

function onEditItemSort(event) {
    const card = event.currentTarget.closest(".danseur");
    const sortCard = event.currentTarget.closest(".sort");
    let mage = getCardActor(card);
    let sortItem = mage.items.get(sortCard.dataset.sortId);

    sortItem.sheet.render(true);
}

function onEditItemContreMagie(event) {
    const card = event.currentTarget.closest(".ctr-magie");
    const danseurCard = event.currentTarget.closest(".danseur");
    let mage = getCardActor(card);
    let danseurItem = mage.items.get(danseurCard.dataset.danseurId);

    danseurItem.sheet.render(true);
}

function onAttaque(event) {
    const card = event.currentTarget.closest(".arme");
    let attaquant = getCardActor(card);
    let arme = attaquant.items.get(card.dataset.itemId); 

    Dice.combatArme(attaquant, arme, "Attaque");
}

function onParade(event) {
    const card = event.currentTarget.closest(".arme");
    let defenseur = getCardActor(card);
    let arme = defenseur.items.get(card.dataset.itemId);

    Dice.combatArme(defenseur, arme, "Parade");
}

function onInitiative(event) {
    const card = event.currentTarget.closest(".arme");
    let combattant = getCardActor(card);
    let arme = combattant.items.get(card.dataset.itemId); 

    combattant.rollInitiative({createCombatants: true});
}

function getCardActor(card) {
    let actor;
    if(card.dataset.isToken == 1) {     
        actor = game.actors.tokens[card.dataset.ownerId];
    }
    else {
        actor = game.actors.get(card.dataset.ownerId);
    }

    return actor;
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
    //chatData.roll = true;

    return ChatMessage.create(chatData);
}

export async function selArtMagiqueImprovise(actor, arts) {
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    };

    let cardData = {
        arts: arts,
        owner: actor.id
    };

    chatData.content = await renderTemplate("systems/agone/templates/partials/chat/carte-art-improvise.hbs", cardData);
    //chatData.roll = true;

    return ChatMessage.create(chatData);
}

export async function selInstrumentDesaccord(actor, instruments) {
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor })
    };

    let cardData = {
        instruments: instruments,
        owner: actor.id
    };

    chatData.content = await renderTemplate("systems/agone/templates/partials/chat/carte-instrument-desaccord.hbs", cardData);
    //chatData.roll = true;

    return ChatMessage.create(chatData);
}

// Pour test Menu click droit sur Chat Message
export function addChatMessageContextOptions(html, options) {

    let condOK = li => li.find(".jet-arme.dommages").length && canvas.tokens.controlled.length;

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

    const cibleId = attaque.find(".cible").attr("data-cible-id");
    let res = canvas.tokens.controlled.find(elem => elem.id == cibleId);
    //console.log(canvas.tokens.controlled);
    //console.log(res, cibleId);

}