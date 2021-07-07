// Jet de caractéristique avec affichage du message dans la chat
export async function jetCaracteristique({actor = null, 
    rangCarac = null,
    labelCarac = null,
    bonusAspect = null,
    labelAspect = null,
    difficulte = null,
    titrePersonnalise = null} = {}) {

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

    if(titrePersonnalise) {
        rollStats.titrePersonnalise = titrePersonnalise;
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
    malusManiement = null,
    utiliseHeroisme = null,
    bonusEmprise = null,
    modificateurs = null,
    danseurInvisible = null,
    mouvImperceptibles = null,
    titrePersonnalise = null,
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

    let baseFormula;
    let isJetDefaut = false;

    // La formule de base varie
    // Jet avec (jet classique) ou sans rang de compétence (ex: défense naturelle)
    if(rangComp) {
        baseFormula = "@rangComp + @rangCarac + @bonusAspect";

        // Si la compétence à le rang 0, il s'agit d'un jet par défaut avec un malus de -3
        if(rangComp == 0) {
            rangComp = -3;
            isJetDefaut = true;
        }
    }
    else {
        baseFormula = "@rangCarac + @bonusAspect";
    }

     // Données de base du jet
     let rollData = {
        rangComp: rangComp,
        rangCarac: rangCarac,
        bonusAspect: bonusAspect
    };

    // On alimente ensuite la formule de base avec les différentes options
    // Malus d'armure sur les jets d'Agilité
    if(labelCarac == game.i18n.localize(CONFIG.agone.caracteristiques.agilite))
    {
        let malusArmure = actor.getMalusArmure("agilite");
        if(malusArmure) {
            rollData.malusArmure = malusArmure;
            baseFormula += " + @malusArmure"; 
        }
    }

    // Malus d'armure sur les jets de Perception
    if(labelCarac == game.i18n.localize(CONFIG.agone.caracteristiques.perception))
    {
        let malusArmure = actor.getMalusArmure("perception");
        if(malusArmure) {
            rollData.malusArmure = malusArmure;
            baseFormula += " + @malusArmure"; 
        }
    }

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

    // Malus de maniement si Agilite ou Force insuffisante (jet d'arme)
    if(malusManiement) {
        rollData.malusManiement = malusManiement;
        baseFormula += " + @malusManiement";
    }

    // Somme des modificateurs d'art magique
    if(modificateurs) {
        rollData.modificateurs = modificateurs;
        baseFormula += " + @modificateurs";
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
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnHeroismeEpuise"));
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

        if(titrePersonnalise) {
            rollStats.titrePersonnalise = titrePersonnalise;
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
            title: game.i18n.localize("agone.actors.jetComp"),
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: game.i18n.localize("agone.common.jet"),
                    callback: html => resolve(_processJetCompetenceOptions(html[0].querySelector("form")))
                },
                annuler: { // Bouton d'annulation
                    label: game.i18n.localize("agone.common.annuler"),
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

export async function combatArme(actor, arme, type) {
    let statsCombat = actor.getStatsCombat(arme.data.data.competence, arme.data.data.minForce, arme.data.data.minAgilite);

    if(statsCombat === null) {
        ui.notifications.error(`${game.i18n.localize("agone.notifications.errorDonnesArme")} ${arme.data.name}.`)
        return;
    }

    if(type == "Attaque") {
        statsCombat.modifAttaque = arme.data.data.modifAttaque;
    }
    else if(type == "Parade") {
        statsCombat.modifParade = arme.data.data.modifParade;
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
        modifAttaque: statsCombat.modifAttaque,
        modifParade: statsCombat.modifParade,
        malusManiement: statsCombat.malusManiement,
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

    console.log(templateContext);

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

// Jet de sort d'Emprise, avec affichage du message dans le chat
export async function sortEmprise(mage, danseur, sort) {
    let statsEmprise = mage.getStatsEmprise();

    // Pas de jet de sort si le Danseur n'a plus d'endurance
    if(danseur.data.data.endurance.value <= 0) {
        ui.notifications.warn(`${danseur.data.name} ${game.i18n.localize("agone.notifications.warnDanseurEpuise")}`);
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

    // On baisse l'endurance du danseur d'un point
    let valEndurance = danseur.data.data.endurance.value -1;
    danseur.update({"data.endurance.value": valEndurance});

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
            title: game.i18n.localize("agone.actors.jetEmprise"),
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: game.i18n.localize("agone.common.jet"),
                    callback: html => resolve(_processJetSortEmpriseOptions(html[0].querySelector("form")))
                },
                annuler: { // Bouton d'annulation
                    label: game.i18n.localize("agone.common.annuler"),
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

// Jet d'une oeuvre d'Art magique, avec affichage du message dans le chat
export async function oeuvre(artiste, oeuvre) {
    const artMagique = oeuvre.data.data.artMagique;
    let statsArtMagique;
    
    if(artMagique == "accord") {
        statsArtMagique = artiste.getStatsArtMagique(artMagique, oeuvre.data.data.instrument);
    }
    else {
        statsArtMagique = artiste.getStatsArtMagique(artMagique);
    }

    oeuvre.data.data.seuilTotal = oeuvre.data.data.seuil;

     // Construction des strutures de données pour l'affichage de la boite de dialogue
     let artisteData = {
        potArtMagique: statsArtMagique.art + Math.min(statsArtMagique.rangArtMagique, statsArtMagique.rangCompetence) + statsArtMagique.bonusAme
    };

    let oeuvreData = {
        nomOeuvre: oeuvre.data.name,
        seuil: oeuvre.data.data.seuil,
        //seuil: oeuvre.data.data.seuilTotal,
        artMagique: oeuvre.data.data.artMagique,
        saison: oeuvre.data.data.saison
    };

    let dialogOptions = await getJetOeuvreOptions({artisteData: artisteData, oeuvreData: oeuvreData, cfgData: CONFIG.agone});

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if(dialogOptions.annule) {
        return;
    }

    // Récupération des données de la fenêtre de dialogue pour ce jet 
    if(dialogOptions.magieInstantanee) {
        oeuvre.data.data.seuilTotal = oeuvre.data.data.seuil * 2;
    }

    oeuvre.data.data.seuilTotal += dialogOptions.margeQualite;
    let qualite = getNiveauQualite(dialogOptions.margeQualite);

    let modificateurs = 0;
    let resistance = 0;
    switch(oeuvre.data.data.artMagique) {
        case "accord":
            modificateurs += dialogOptions.qualiteInstrument;
            break;
        case "decorum":
            modificateurs += dialogOptions.saisonOeuvre;
            break;
        case "geste":
            modificateurs += dialogOptions.bruitEnviron;
            break;
        case "cyse":
            resistance = dialogOptions.materiaux;
            break;
    }

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let rollResult = await jetCompetence({
        actor: artiste,
        rangComp:  Math.min(statsArtMagique.rangArtMagique, statsArtMagique.rangCompetence),
        jetDefautInterdit: true,
        rangCarac: statsArtMagique.art,
        bonusAspect: statsArtMagique.bonusAme,
        modificateurs: modificateurs,
        utiliseHeroisme: dialogOptions.utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-oeuvre.hbs";
    let renderedRoll = await rollResult.render();

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsArtMagique.specialisation,
        labelSpecialisation: statsArtMagique.labelSpecialisation,
        difficulte: oeuvre.data.data.seuilTotal,
        qualite: qualite
    }

    // Gestion du Fumble et de l'échec critique
    if(rollResult.result[0] == "-") {
        rollStats.isFumble = true;
        if(rollResult.dice[0].results[0].result == 10) {
            rollStats.isEchecCritique = true;
        }
    }

    rollStats.marge = rollResult.total - oeuvre.data.data.seuilTotal;
    if(rollStats.marge <= -15) {
        rollStats.isEchecCritique = true;
    }

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        artiste: artisteData,
        oeuvre: oeuvre.data,
        roll: renderedRoll
    }

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: artiste }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    // Affichage du message
    ChatMessage.create(chatData);
}

// Fonction de construction de la boite de dialogue de jet d'une oeuvre
async function getJetOeuvreOptions({artisteData = null, oeuvreData = null, cfgData = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-oeuvre.hbs";
    const html = await renderTemplate(template, {artisteData: artisteData, oeuvreData: oeuvreData, cfgData: cfgData});

    return new Promise( resolve => {
        const data = {
            title: game.i18n.localize("agone.actors.jetOeuvre"),
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: game.i18n.localize("agone.common.jet"),
                    callback: html => resolve(_processJetOeuvreOptions(html[0].querySelector("form")))
                },
                annuler: { // Bouton d'annulation
                    label: game.i18n.localize("agone.common.annuler"),
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

// Gestion des données renseignées dans la boite de dialogue de jet d'oeuvre d'art magique
function _processJetOeuvreOptions(form) {
    // L'affichage des options suivantes dépend de l'Art Magique de l'oeuvre
    // On récupère la valeur des options si elles sont affichées 
    let qualiteInstrument = 0;
    let bruitEnviron = 0
    let saisonOeuvre = 0;
    let materiaux = 0;

    if(form.qualiteInstrument) {
        qualiteInstrument = parseInt(form.qualiteInstrument.value);
    }
    
    if(form.bruitEnviron) {
        bruitEnviron = parseInt(form.bruitEnviron.value);
    }

    if(form.saisonOeuvre) {
        saisonOeuvre = parseInt(form.saisonOeuvre.value);
    }

    if(form.materiaux) {
        materiaux = parseInt(form.materiaux.value);
    }

    return {
        magieInstantanee: form.magieInstantanee.checked,
        qualiteInstrument: qualiteInstrument,
        bruitEnviron: bruitEnviron,
        saisonOeuvre: saisonOeuvre,
        materiaux: materiaux,
        margeQualite: parseInt(form.margeQualite.value),
        utiliseHeroisme : form.utiliseHeroisme.checked
    }
}

function getNiveauQualite(margeQualite) {
    if(margeQualite == 0) {
        return 1;
    }
    else if(margeQualite <= 4) {
        return 2;
    }
    else if(margeQualite <= 9) {
        return 5;
    }
    else if(margeQualite <= 15) {
        return 10;
    }
    else if(margeQualite <= 20) {
        return 30;
    }
    else if(margeQualite >= 21) {
        return 100;
    }
}

// Jet de Contre-magie, avec affichage du messsage dans la chat
export async function contreMagie(mage, danseur) {
    let statsEmprise = mage.getStatsEmprise();

    // Construction des strutures de données pour l'affichage du message
    let mageData = {
        potEmprise: statsEmprise.emprise + Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs) + statsEmprise.bonusEsprit + danseur.data.data.bonusEmprise,
        resonance: statsEmprise.resonance
    };

    let danseurData = {
        nomDanseur: danseur.data.name
    };

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let rollResult = await jetCompetence({
        actor: mage,
        rangComp:  Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs),
        jetDefautInterdit: true,
        rangCarac: statsEmprise.emprise,
        bonusAspect: statsEmprise.bonusEsprit,
        bonusEmprise: danseur.data.data.bonusEmprise,
        //utiliseHeroisme: dialogOptions.utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-contre-magie.hbs";
    let renderedRoll = await rollResult.render();

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsEmprise.specialisation,
        labelSpecialisation: statsEmprise.labelSpecialisation
    }

    // Gestion du Fumble et de l'échec critique
    if(rollResult.result[0] == "-") {
        rollStats.isFumble = true;
        if(rollResult.dice[0].results[0].result == 10) {
            rollStats.isEchecCritique = true;
        }
    }

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        mage: mageData,
        danseur: danseurData,
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

export async function desaccord(artiste, instrument) {
    
    let statsAccord = artiste.getStatsArtMagique("accord", instrument);

     // Construction des strutures de données pour l'affichage du message
     let artisteData = {
        potAccord: statsAccord.art + Math.min(statsAccord.rangArtMagique, statsAccord.rangCompetence) + statsAccord.bonusAme,
        instrument: statsAccord.labelCompetence
    };

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let rollResult = await jetCompetence({
        actor: artiste,
        rangComp: Math.min(statsAccord.rangArtMagique, statsAccord.rangCompetence),
        jetDefautInterdit: true,
        rangCarac: statsAccord.art,
        bonusAspect: statsAccord.bonusAme,
        afficherDialog: false,
        envoiMessage: false
    });

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-desaccord.hbs";
    let renderedRoll = await rollResult.render();

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsAccord.specialisation,
        labelSpecialisation: statsAccord.labelSpecialisation
    }

    // Gestion du Fumble et de l'échec critique
    if(rollResult.result[0] == "-") {
        rollStats.isFumble = true;
        if(rollResult.dice[0].results[0].result == 10) {
            rollStats.isEchecCritique = true;
        }
    }

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        artiste: artisteData,
        roll: renderedRoll
    }

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: artiste }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    // Affichage du message
    ChatMessage.create(chatData);
}