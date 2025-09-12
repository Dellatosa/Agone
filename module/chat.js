import * as Dice from "./dice.js";

export function addChatMessageListeners(html) {
    let query = html.querySelector('button.attaque');
    if(query) { query.addEventListener('click', onAttaque); }

    query = html.querySelector('button.att-arme-nat');
    if(query) { query.addEventListener('click', onAttaqueArmeNat); }

    query = html.querySelector('button.parade');
    if(query) { query.addEventListener('click', onParade); }

    query = html.querySelector('button.par-arme-nat');
    if(query) { query.addEventListener('click', onParadeArmeNat); }

    query = html.querySelector('button.initiative');
    if(query) { query.addEventListener('click', onInitiative); }

    query = html.querySelector('button.init-arme-nat');
    if(query) { query.addEventListener('click', onInitiativeArmeNat); }

    query = html.querySelector('button.jet-sort');
    if(query) { query.addEventListener('click', onJetSort); }

    query = html.querySelector('button.jet-sort-intuitif');
    if(query) { query.addEventListener('click', onJetSortIntuitif); }

    query = html.querySelector('button.jet-contre-magie');
    if(query) { query.addEventListener('click', onJetContreMagie); }

    query = html.querySelectorAll('button.jet-reconn-oeuvre');
    query.forEach( element => { element.addEventListener('click', onJetReconnOeuvre); });

    query = html.querySelector('button.jet-desaccord');
    if(query) { query.addEventListener('click', onJetDesaccord); }

    query = html.querySelector('button.jet-oeuvre');
    if(query) { query.addEventListener('click', onJetOeuvre); }

    query = html.querySelectorAll('button.jet-art-improvise');
    query.forEach( element => { element.addEventListener('click', onJetArtImprovise); }); 

    query = html.querySelector('button.jet-pouvoir');
    if(query) { query.addEventListener('click', onJetPouvoir); }

    query = html.querySelector('a.editer-item-sort');
    if(query) { query.addEventListener('click', onEditItemSort); }

    query = html.querySelector('a.editer-item-ctr-magie');
    if(query) { query.addEventListener('click', onEditItemContreMagie); }
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

async function onJetPouvoir(event) {
    const card = event.currentTarget.closest(".pouvoir");
    let inspire = getCardActor(card);
    let pouvoir = inspire.items.get(card.dataset.itemId);

    if(pouvoir.system.coutHeroisme > 0) {
        if(!inspire.depenserHeroisme()) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnHeroismeEpuisePouv"));
            return;
        }
    }
    
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: inspire })
    };

    let cardData = {
        pouvoir: pouvoir,
        owner: inspire.id
    };

    chatData.content = await foundry.applications.handlebars.renderTemplate("systems/agone/templates/partials/chat/carte-utiliser-pouvoir.hbs", cardData);

    return ChatMessage.create(chatData);
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
    const mage = getCardActor(card);
    const danseurItem = mage.items.get(danseurCard.dataset.danseurId);

    danseurItem.sheet.render(true);
}

function onAttaque(event) {
    const card = event.currentTarget.closest(".arme");
    const attaquant = getCardActor(card);
    const arme = attaquant.items.get(card.dataset.itemId); 

    Dice.combatArme(attaquant, arme, "Attaque");
}

function onAttaqueArmeNat(event) {
    const card = event.currentTarget.closest(".arme-nat");
    const attaquant = getCardActor(card);

    Dice.combatArme(attaquant, card.dataset.armeNat, "Attaque");
}

function onParade(event) {
    const card = event.currentTarget.closest(".arme");
    const defenseur = getCardActor(card);
    const arme = defenseur.items.get(card.dataset.itemId);

    Dice.combatArme(defenseur, arme, "Parade");
}

function onParadeArmeNat(event) {
    const card = event.currentTarget.closest(".arme-nat");
    const defenseur = getCardActor(card);

    Dice.combatArme(defenseur, card.dataset.armeNat, "Parade");
}

function onInitiative(event) {
    const card = event.currentTarget.closest(".arme");
    const combattant = getCardActor(card);
    const arme = combattant.items.get(card.dataset.itemId); 

    combattant.rollInitiative({rerollInitiative: true, initiativeOptions: { formula:  combattant.getInitiativeFormula(arme) }});
}

function onInitiativeArmeNat(event) {
    const card = event.currentTarget.closest(".arme-nat");
    const combattant = getCardActor(card);

    console.log(card.dataset);

    combattant.rollInitiative({rerollInitiative: true, initiativeOptions: { formula:  combattant.getInitiativeFormula(card.dataset.armeNat) }});
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

    chatData.content = await foundry.applications.handlebars.renderTemplate("systems/agone/templates/partials/chat/carte-contre-magie.hbs", cardData);

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

    chatData.content = await foundry.applications.handlebars.renderTemplate("systems/agone/templates/partials/chat/carte-reconn-oeuvre.hbs", cardData);
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

    chatData.content = await foundry.applications.handlebars.renderTemplate("systems/agone/templates/partials/chat/carte-art-improvise.hbs", cardData);
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

    chatData.content = await foundry.applications.handlebars.renderTemplate("systems/agone/templates/partials/chat/carte-instrument-desaccord.hbs", cardData);
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