export async function jetCompetence({actor = null,
    rangComp = null,
    labelComp = null,
    specialisation = null,
    labelSpecialisation = null,
    jetDefautInterdit = null,
    rangCarac = null,
    labelCarac = null,
    bonusAspect = null,
    labelAspect = null,
    defCarac = null,
    difficulte = null,
    modifAttaque = null,
    modifParade = null,
    afficherDialog = true,
    envoiMessage = true} = {}) {
    
    let utiliseHeroisme;

    // Si la famille de la compétence n'autorise pas le jet par défaut (Savoir et Occulte), on gènere le message d'erreur et on annule le jet
    if(jetDefautInterdit && rangComp == 0) {
        ui.notifications.error(`Le jet par défaut (rang de compétence à zéro) n'est pas autorisé pour cette famille de compétences.`)
        return;
    }

    // Affichage de la fenêtre de dialogue (vrai par défaut)
    if(afficherDialog) {
        let dialogOptions = await getJetCompetenceOptions({cfgData: CONFIG.agone, defCarac: defCarac});

        // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
        if(dialogOptions.annule) {
            return;
        }

        // Récupération des données de la fenêtre de dialogue pour ce jet 
        let carac = dialogOptions.caracteristique;
        let carData = actor.getCaracData(carac);
        rangCarac = carData.rangCarac;
        labelCarac = carData.labelCarac;
        bonusAspect = carData.bonusAspect;
        labelAspect = carData.labelAspect;
        difficulte = dialogOptions.difficulte;
        utiliseHeroisme = dialogOptions.utiliseHeroisme;
    }

    // Définition de la formule de base du jet, et de sa version fumble (avec 1d10 explosif retranché au 1 du dé initial)
    let rollFormula = "1d10x + ";
    let rollFumbleFormula = "(1d10x * -1) + 1 + ";
    let baseFormula = "@rangComp + @rangCarac + @bonusAspect";

    // On alimente ensuite la formule de base avec les différentes options
    // Si la compétence à le rang 0, il s'agit d'un jet par défaut avec un malus de -3
    let isJetDefaut = false;
    if(rangComp == 0) {
        rangComp = -3;
        isJetDefaut = true;
    }

    // Données de base du jet
    let rollData = {
        rangComp: rangComp,
        rangCarac: rangCarac,
        bonusAspect: bonusAspect
    };

    // Modificateur d'attaque (jet d'arme)
    if(modifAttaque) {
        rollData.modifAttaque = modifAttaque;
        baseFormula += " + @modifAttaque"; 
    }

    // Modificateur de parade (jet d'arme)
    if(modifParade) {
        rollData.modifParade = modifParade;
        baseFormula += " + @modifParade"; 
    }

    // Utilisation d'un point d'héroïsme
    if(utiliseHeroisme) {
        // On teste s'il reste des points d'héroïsme sur l'Actor
        if(actor.depenserHeroisme()) {
            baseFormula += " + 5";
        }
        else {
            utiliseHeroisme = false;
        }    
    }

    // Construction des formules de jets définitives (jet initial et fumble)
    rollFormula += baseFormula;
    rollFumbleFormula += baseFormula;

    let fumble = false;
    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
        fumble = true;
    }

    if(envoiMessage) {
        const messageTemplate = "systems/agone/templates/partials/dice/jet-competence.hbs"; 
        let renderedRoll = await rollResult.render();

        let rollStats = {
            ...rollData,
            labelCarac: labelCarac,
            labelComp: labelComp,
            specialisation: specialisation,
            labelSpecialisation: labelSpecialisation,
            labelAspect: labelAspect,
            isFumble: fumble,
            isJetDefaut: isJetDefaut
        }


        if(modifAttaque) {
            rollStats.labelModifAttaque = game.i18n.localize("agone.items.modifAttaque");
        }

        if(modifParade) {
            rollStats.labelModifParade = game.i18n.localize("agone.items.modifParade");
        }

        if(utiliseHeroisme) {
            rollStats.utiliseHeroisme = true;
        }

        if(difficulte) {
            rollStats.difficulte = difficulte;
            rollStats.marge = rollResult.total - difficulte;
        }

        let templateContext = {
            stats : rollStats,
            roll: renderedRoll
        }

        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            roll: rollResult,
            content: await renderTemplate(messageTemplate, templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        }

        ChatMessage.create(chatData);
    }

    return rollResult;
}

async function getJetCompetenceOptions({cfgData = null, defCarac = null}) {
    const template = "systems/agone/templates/partials/dice/dialog-jet-competence.hbs";
    const html = await renderTemplate(template, {data: cfgData, defCarac: defCarac});

    return new Promise( resolve => {
        const data = {
            title: "Jet de compétence",
            content: html,
            buttons: {
                jet: {
                    icon: '<i class="fas fa-dice"></i>',
                    label: "Jet",
                    callback: html => resolve(_processJetCompetenceOptions(html[0].querySelector("form")))
                },
                annuler: {
                    label: "Annuler",
                    callback: html => resolve({annule: true})
                }
            },
            default: "jet",
            close: () => resolve({annule: true})
        }
        new Dialog(data, null).render(true);
    });
}

function _processJetCompetenceOptions(form) {
    return {
        caracteristique: form.caracteristique.value,
        difficulte: parseInt(form.difficulte.value),
        utiliseHeroisme : form.utiliseHeroisme.checked
    }
}

export async function jetCaracteristique({actor = null, 
    rangCarac = null,
    labelCarac = null,
    bonusAspect = null,
    labelAspect = null,
    difficulte = null} = {}) {

    let rollFormula = "1d10x + (@rangCarac * 2) + @bonusAspect";
    let rollFumbleFormula = "(1d10x * -1) + 1 + (@rangCarac * 2) + @bonusAspect";

    let rollData = {
        rangCarac: rangCarac,
        bonusAspect: bonusAspect
    };

    let fumble = false;
    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
        fumble = true;
    }

    const messageTemplate = "systems/agone/templates/partials/dice/jet-caracteristique.hbs"; 
    let renderedRoll = await rollResult.render();

    let rollStats = {
        ...rollData,
        labelCarac: labelCarac,
        labelAspect: labelAspect,
        isFumble: fumble
    }

    if(difficulte) {
        rollStats.difficulte = difficulte;
        rollStats.marge = rollResult.total - difficulte;
    }

    let templateContext = {
        stats : rollStats,
        roll: renderedRoll
    }

    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    ChatMessage.create(chatData);
}

export async function actionArme(actor, arme, type) {
    let statsAttaque = actor.getStatsAttaque(arme.data.data.competence);

    if(statsAttaque === null) {
        ui.notifications.error(`Impossible de retrouver les statistiques d'attaque pour l'arme ${arme.data.name}.`)
        return;
    }

    let modAtt;
    let modPar;

    if(type == "Attaque") {
         modAtt = arme.data.data.modifAttaque;
    }
    else if(type == "Parade") {
        modPar = arme.data.data.modifParade;
    }

    let rollResult = await jetCompetence({
        actor: actor,
        rangComp: statsAttaque.rangComp,
        labelComp: statsAttaque.labelComp,
        specialisation: statsAttaque.specialisation,
        labelSpecialisation: statsAttaque.labelSpecialisation,
        jetDefautInterdit: false,
        rangCarac: statsAttaque.rangCarac,
        labelCarac: statsAttaque.labelCarac,
        bonusAspect: statsAttaque.bonusAspect,
        labelAspect: statsAttaque.labelAspect,
        modifAttaque: modAtt,
        modifParade: modPar,
        afficherDialog: false,
        envoiMessage: false
    });

    const messageTemplate = "systems/agone/templates/partials/dice/jet-arme.hbs";
    let renderedRoll = await rollResult.render();

    let rollStats = {
        ...statsAttaque
    }

    if(rollResult.terms[0] == "-") {
        rollStats.isFumble = true;
    }

    let templateContext = {
        stats: rollStats,
        arme: arme.data,
        type: type,
        roll: renderedRoll
    }

    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    ChatMessage.create(chatData);
}