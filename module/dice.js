// Jet de caractéristique avec affichage du message dans la chat
export async function jetCaracteristique({actor = null, 
    rangCarac = null,
    labelCarac = null,
    bonusAspect = null,
    labelAspect = null,
    difficulte = null} = {}) {

    // Définition de la formule de base du jet, et de sa version fumble (avec 1d10 explosif retranché au 1 du dé initial)
    let rollFormula = "1d10x + (@rangCarac * 2) + @bonusAspect";
    let rollFumbleFormula = "(1d10x * -1) + 1 + (@rangCarac * 2) + @bonusAspect";

    let rollData = {
        rangCarac: rangCarac,
        bonusAspect: bonusAspect
    };

    // Variables de gestion des fumbles (1 au dé) // TODO : et des échecs critiques (1 au dé suivi de 10, ou MR <= -15)
    let fumble = false;
    let echecCritique = false;

    // Jet du 1er dé
    let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
    if(rollResult.dice[0].results[0].result == 1) {
        // Si le 1er dé donne 1, c'est un Fumble
        rollResult = await new Roll(rollFumbleFormula, rollData).roll({async: true});
        fumble = true;
        //Si le second dé donne 10, c'est un échec critique
        if(rollResult.dice[0].results[0].result == 10) {
            echecCritique = true;
        }
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-caracteristique.hbs"; 
    let renderedRoll = await rollResult.render();

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollData,
        labelCarac: labelCarac,
        labelAspect: labelAspect,
        isFumble: fumble,
        isEchecCritique: echecCritique
    }

    if(difficulte) {
        rollStats.difficulte = difficulte;
        rollStats.marge = rollResult.total - difficulte;
        //Si la marge est <= -15, c'est un échec critique
        if(rollStats.marge <= -15) {
            rollStats.isEchecCritique = true;
        }
    }

    // Assignation des données au template
    let templateContext = {
        stats : rollStats,
        roll: renderedRoll
    }

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    // Affichage du message
    ChatMessage.create(chatData);
}

// Jet de compétence, avec au choix :
// - affichage du message dans le chat
// - renvoi du rollResult
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
    utiliseHeroisme = null,
    bonusEmprise = null,
    danseurInvisible = null,
    mouvImperceptibles = null,
    afficherDialog = true,
    envoiMessage = true} = {}) {

    // Si la famille de la compétence n'autorise pas le jet par défaut (Savoir et Occulte), on gènere le message d'erreur et on annule le jet
    if(jetDefautInterdit && rangComp == 0) {
        ui.notifications.warn(`Le jet par défaut (rang de compétence à zéro) n'est pas autorisé pour cette famille de compétences.`)
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

    // Bonus d'emprise du Danseur
    if(bonusEmprise) {
        rollData.bonusEmprise = bonusEmprise;
        baseFormula += " + @bonusEmprise";
    }

    // Malus de l'option Danseur invisible
    if(danseurInvisible) {
        rollData.danseurInvisible = danseurInvisible;
        baseFormula += " - 2";
    }

    // Malus de l'option Mouvements imperceptibles
    if(mouvImperceptibles) {
        rollData.mouvImperceptibles = mouvImperceptibles;
        baseFormula += " - 3";
    }

    // Utilisation d'un point d'héroïsme
    if(utiliseHeroisme) {
        // On teste s'il reste des points d'héroïsme sur l'Actor
        if(actor.depenserHeroisme()) {
            rollData.utiliseHeroisme = true,
            baseFormula += " + 5";
        }
        else {
            ui.notifications.warn("Le personnage n'a plus de point d'héroïsme disponible. Le jet se fera sans bonus.");
        }    
    }

    // Construction des formules de jets définitives (jet initial et fumble)
    rollFormula += baseFormula;
    rollFumbleFormula += baseFormula;

    // Variables de gestion des fumbles (1 au dé) et des échecs critiques (1 au dé suivi de 10, ou MR <= -15)
    let fumble = false;
    let echecCritique = false;

    // Jet du 1er dé
    let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
    if(rollResult.dice[0].results[0].result == 1) {
        // Si le 1er dé donne 1, c'est un Fumble
        rollResult = await new Roll(rollFumbleFormula, rollData).roll({async: true});
        fumble = true;
        //Si le second dé donne 10, c'est un échec critique
        if(rollResult.dice[0].results[0].result == 10) {
            echecCritique = true;
        }
    }

    if(envoiMessage) {
        // Recupération du template
        const messageTemplate = "systems/agone/templates/partials/dice/jet-competence.hbs"; 
        let renderedRoll = await rollResult.render();

        // Construction du jeu de données pour alimenter le template
        let rollStats = {
            ...rollData,
            labelCarac: labelCarac,
            labelComp: labelComp,
            specialisation: specialisation,
            labelSpecialisation: labelSpecialisation,
            labelAspect: labelAspect,
            isFumble: fumble,
            isEchecCritique: echecCritique,
            isJetDefaut: isJetDefaut
        }

        if(modifAttaque) {
            rollStats.labelModifAttaque = game.i18n.localize("agone.items.modifAttaque");
        }

        if(modifParade) {
            rollStats.labelModifParade = game.i18n.localize("agone.items.modifParade");
        }

        if(difficulte) {
            rollStats.difficulte = difficulte;
            rollStats.marge = rollResult.total - difficulte;
            //Si la marge est <= -15, c'est un échec critique
            if(rollStats.marge <= -15) {
                rollStats.isEchecCritique = true;
            }
        }

        // Assignation des données au template
        let templateContext = {
            stats : rollStats,
            roll: renderedRoll
        }

        // Construction du message
        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            roll: rollResult,
            content: await renderTemplate(messageTemplate, templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        }

        // Affichage du message
        ChatMessage.create(chatData);
    }

    return rollResult;
}

// Fonction de contsruction de la boite de dialogue de jet de compétence
async function getJetCompetenceOptions({cfgData = null, defCarac = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-competence.hbs";
    const html = await renderTemplate(template, {data: cfgData, defCarac: defCarac});

    return new Promise( resolve => {
        const data = {
            title: "Jet de compétence",
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: "Jet",
                    callback: html => resolve(_processJetCompetenceOptions(html[0].querySelector("form")))
                },
                annuler: { // Bouton d'annulation
                    label: "Annuler",
                    callback: html => resolve({annule: true})
                }
            },
            default: "jet",
            close: () => resolve({annule: true}) // Annulation sur fermeture de la boite de dialogue
        }

        // Affichage de la boite de dialogue
        new Dialog(data, null).render(true);
    });
}

// Gestion des données renseignées dans la boite de dialogue de jet de compétence
function _processJetCompetenceOptions(form) {
    return {
        caracteristique: form.caracteristique.value,
        difficulte: parseInt(form.difficulte.value),
        utiliseHeroisme : form.utiliseHeroisme.checked
    }
}

export async function actionArme(actor, arme, type) {
    let statsCombat = actor.getStatsCombat(arme.data.data.competence);

    if(statsCombat === null) {
        ui.notifications.error(`Impossible de retrouver les statistiques de combat pour l'arme ${arme.data.name}.`)
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
        rangComp: statsCombat.rangComp,
        labelComp: statsCombat.labelComp,
        jetDefautInterdit: false,
        rangCarac: statsCombat.rangCarac,
        labelCarac: statsCombat.labelCarac,
        bonusAspect: statsCombat.bonusAspect,
        labelAspect: statsCombat.labelAspect,
        modifAttaque: modAtt,
        modifParade: modPar,
        afficherDialog: false,
        envoiMessage: false
    });

    const messageTemplate = "systems/agone/templates/partials/dice/jet-arme.hbs";
    let renderedRoll = await rollResult.render();

    let rollStats = {
        ...statsCombat
    }

    if(rollResult.result[0] == "-") {
        rollStats.isFumble = true;
        if(rollResult.dice[0].results[0].result == 10) {
            rollStats.isEchecCritique = true;
        }
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

// Jet de sort d'Emprise, avec affichage du messsage dans la chat
export async function sortEmprise(mage, danseur, sort) {
    let statsEmprise = mage.getStatsEmprise();

    // Pas de jet de sort si le Danseur n'a plus d'endurance
    if(danseur.data.data.endurance.value <= 0) {
        ui.notifications.warn(`Le danseur ${danseur.data.name} est épuisé. Il ne peut plus lancer de sort tant qu'il n'aura pas récupéré son endurance.`);
        return;
    }

    // Ajout sur le sort des données pour gérer le cas des sorts d'une obédience différente de celle du Mage
    sort.data.data.diffObedience = false;
    sort.data.data.seuilTotal = sort.data.data.seuil;

    if(sort.data.data.resonance != statsEmprise.resonance) {
        sort.data.data.diffObedience = true;
        sort.data.data.seuilTotal += 5;
    }

    // Construction des strutures de données pour l'affichage de la boite de dialogue
    let mageData = {
        potEmprise: statsEmprise.emprise + Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs) + statsEmprise.bonusEsprit + danseur.data.data.bonusEmprise,
        resonance: statsEmprise.resonance
    };

    let danseurData = {
        nomDanseur: danseur.data.name
    };

    let sortData = {
        nomSort: sort.data.name,
        seuil: sort.data.data.seuil,
        seuilTotal: sort.data.data.seuilTotal,
        diffObedience: sort.data.data.diffObedience
    };

    let dialogOptions = await getJetSortEmpriseOptions({mageData: mageData, danseurData: danseurData, sortData: sortData});

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if(dialogOptions.annule) {
        return;
    }

    // Récupération des données de la fenêtre de dialogue pour ce jet 
    if(dialogOptions.magieInstantanee) {
        sort.data.data.seuilTotal = sort.data.data.diffObedience == true ? sort.data.data.seuil * 2 + 5 : (sort.data.data.seuil * 2);
    }

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let rollResult = await jetCompetence({
        actor: mage,
        rangComp:  Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs),
        jetDefautInterdit: true,
        rangCarac: statsEmprise.emprise,
        bonusAspect: statsEmprise.bonusEsprit,
        bonusEmprise: danseur.data.data.bonusEmprise,
        danseurInvisible: dialogOptions.danseurInvisible,
        mouvImperceptibles: dialogOptions.mouvImperceptibles,
        utiliseHeroisme: dialogOptions.utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-sort-emprise.hbs";
    let renderedRoll = await rollResult.render();

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsEmprise.specialisation,
        labelSpecialisation: statsEmprise.labelSpecialisation,
        difficulte: sort.data.data.seuilTotal
    }

    // Gestion du Fumble et de l'échec critique
    if(rollResult.result[0] == "-") {
        rollStats.isFumble = true;
        if(rollResult.dice[0].results[0].result == 10) {
            rollStats.isEchecCritique = true;
        }
    }

    rollStats.marge = rollResult.total - sort.data.data.seuilTotal;
    if(rollStats.marge <= -15) {
        rollStats.isEchecCritique = true;
    }

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        mage: mageData,
        danseur: danseurData,
        sort: sort.data,
        roll: renderedRoll
    }

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: mage }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    // Affichage du message
    ChatMessage.create(chatData);
}

// Fonction de construction de la boite de dialogue de jet de sort d'Emprise
async function getJetSortEmpriseOptions({mageData = null, danseurData = null, sortData = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-sort-emprise.hbs";
    const html = await renderTemplate(template, {mageData: mageData, danseurData: danseurData, sortData: sortData});

    return new Promise( resolve => {
        const data = {
            title: "Jet de sort d'Emprise",
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: "Jet",
                    callback: html => resolve(_processJetSortEmpriseOptions(html[0].querySelector("form")))
                },
                annuler: { // Bouton d'annulation
                    label: "Annuler",
                    callback: html => resolve({annule: true})
                }
            },
            default: "jet",
            close: () => resolve({annule: true}) // Annulation sur fermeture de la boite de dialogue
        }

        // Affichage de la boite de dialogue
        new Dialog(data, null).render(true);
    });
}

// Gestion des données renseignées dans la boite de dialogue de jet de sort d'Emprise
function _processJetSortEmpriseOptions(form) {
    // L'affichage de l'option Mouvements imperceptibles est conditionelle
    // On récupère la valeur de la case à cocher uniquement si l'option était affichée 
    let mouvImp = false;
    if(form.mouvImperceptibles) {
        mouvImp = form.mouvImperceptibles.checked;
    }

    return {
        magieInstantanee: form.magieInstantanee.checked,
        danseurInvisible: form.danseurInvisible.checked,
        mouvImperceptibles: mouvImp,
        utiliseHeroisme : form.utiliseHeroisme.checked
    }
}