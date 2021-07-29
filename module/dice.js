// Jet de caractéristique avec affichage du message dans la chat
export async function jetCaracteristique({actor = null, 
    rangCarac = null,
    labelCarac = null,
    bonusAspect = null,
    labelAspect = null,
    utiliseHeroisme = null,
    difficulte = null,
    titrePersonnalise = null} = {}) {

    let gererBonusAspect = actor.gererBonusAspect();

    // Définition de la formule de base du jet, et de sa version fumble (avec 1d10 explosif retranché au 1 du dé initial)
    let rollFormula = "1d10x";
    let rollFumbleFormula = "-1d10x + 1";

    let rollData = {
        rangCarac: rangCarac
    };

    let baseFormula;
    if(gererBonusAspect) {
        baseFormula = "  + (@rangCarac * 2) + @bonusAspect";
        rollData.bonusAspect = bonusAspect;
    }
    else {
        baseFormula = "  + (@rangCarac * 2)";
    }

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
    
    // Malus de blessures graves
    let malusBlessureGrave = actor.getMalusBlessureGrave(actor.data.data.caracSecondaires.nbBlessureGrave);
    if(malusBlessureGrave < 0) {
        rollData.malusBlessureGrave = malusBlessureGrave;
        baseFormula += " + @malusBlessureGrave";
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

    // Variables de gestion des fumbles (1 au dé) // TODO : et des échecs critiques (1 au dé suivi de 10, ou MR <= -15)
    rollData.isFumble = false;
    rollData.isEchecCritique = false;

    // Jet du 1er dé
    let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
    if(rollResult.dice[0].results[0].result == 1) {
        // Si le 1er dé donne 1, c'est un Fumble
        rollResult = await new Roll(rollFumbleFormula, rollData).roll({async: true});
        rollData.isFumble = true;
        //Si le second dé donne 10, c'est un échec critique
        if(rollResult.dice[0].results[0].result == 10) {
            rollData.isEchecCritiqueJetDe = true;
            rollData.valeurCritique = rollResult.dice[0].total;
        }
    }

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollData,
        labelCarac: labelCarac
    }

    if(gererBonusAspect) {
        rollStats.labelAspect = labelAspect;
    }

    if(titrePersonnalise) {
        rollStats.titrePersonnalise = titrePersonnalise;
    }
    
    if(difficulte) {
        rollStats.difficulte = difficulte;
        rollStats.marge = rollResult.total - difficulte;
        //Si la marge est <= -15, c'est un échec critique
        if(rollStats.marge <= -15) {
            rollStats.isEchecCritiqueMarge = true;
            rollStats.valeurCritique = rollStats.valeurCritique ? Math.min(rollStats.valeurCritique, rollStats.marge + 5) : rollStats.marge + 5;
        }
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-caracteristique.hbs"; 
    let renderedRoll = await rollResult.render();

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
    familleComp = null,
    specialisation = false,
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
    utiliseSpecialisation = false,
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
        return null;
    }

    let gererBonusAspect = actor.gererBonusAspect();

    // Affichage de la fenêtre de dialogue (vrai par défaut)
    if(afficherDialog) {
        let dialogOptions = await getJetCompetenceOptions({cfgData: CONFIG.agone, defCarac: defCarac, specialisation: specialisation, labelSpecialisation: labelSpecialisation});

        // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
        if(dialogOptions.annule) {
            return null;
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
        utiliseSpecialisation = dialogOptions.utiliseSpecialisation;
    }
    
    // Définition de la formule de base du jet, et de sa version fumble (avec 1d10 explosif retranché au 1 du dé initial)
    let rollFormula = "1d10x";
    let rollFumbleFormula = "-1d10x + 1";

    let baseFormula;
    let isJetDefaut = false;

    // La formule de base varie
    // Jet avec (jet classique) ou sans rang de compétence (ex: défense naturelle)
    if(rangComp != null) {
        baseFormula = " + @rangComp + @rangCarac";

        // Si la compétence à le rang 0, il s'agit d'un jet par défaut avec un malus de -3
        if(rangComp == 0) {
            rangComp = -3;
            isJetDefaut = true;
        }
    }
    else {
        baseFormula = " + @rangCarac";
    }

    // Données de base du jet
    let rollData = {
        rangComp: rangComp,
        rangCarac: rangCarac
    };

    if(gererBonusAspect) {
        baseFormula += " + @bonusAspect";
        rollData.bonusAspect = bonusAspect;
    }

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

    // Malus de blessures graves
    let malusBlessureGrave = actor.getMalusBlessureGrave(actor.data.data.caracSecondaires.nbBlessureGrave);
    if(malusBlessureGrave < 0) {
        rollData.malusBlessureGrave = malusBlessureGrave;
        baseFormula += " + @malusBlessureGrave";
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

    // Bonus de spécialisation
    if(utiliseSpecialisation) {
        baseFormula += " + 1";
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
    rollData.isFumble = false;
    rollData.isEchecCritique = false;

    // Jet du 1er dé
    let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
    if(rollResult.dice[0].results[0].result == 1) {
        // Si le 1er dé donne 1, c'est un Fumble
        rollResult = await new Roll(rollFumbleFormula, rollData).roll({async: true});
        rollData.isFumble = true;
        //Si le second dé donne 10, c'est un échec critique
        if(rollResult.dice[0].results[0].result == 10) {
            rollData.isEchecCritiqueJetDe = true;
            rollData.valeurCritique = rollResult.dice[0].total;
        }
    }

    if(envoiMessage) {
        // Construction du jeu de données pour alimenter le template
        let rollStats = {
            ...rollData,
            labelCarac: labelCarac,
            labelComp: labelComp,
            utiliseSpecialisation: utiliseSpecialisation,
            //specialisation: specialisation,
            labelSpecialisation: labelSpecialisation,
            isJetDefaut: isJetDefaut
        }

        if(titrePersonnalise) {
            rollStats.titrePersonnalise = titrePersonnalise;
        }

        if(gererBonusAspect) {
            rollStats.labelAspect = labelAspect;
        }

        if(difficulte) {
            rollStats.difficulte = difficulte;
            rollStats.marge = rollResult.total - difficulte;
            //Si la marge est <= -15, c'est un échec critique
            if(rollStats.marge <= -15) {
                rollStats.isEchecCritiqueMarge = true;
                rollStats.valeurCritique = rollStats.valeurCritique ? Math.min(rollStats.valeurCritique, rollStats.marge + 5) : rollStats.marge + 5;
            }
        }

        if(rollStats.valeurCritique) {
            let critInfos = getCritInfos(familleComp, rollStats.valeurCritique);
            rollStats.nomCritique = critInfos.nom;
            rollStats.descCritique = critInfos.desc;
        }

        // Recupération du template
        const messageTemplate = "systems/agone/templates/partials/dice/jet-competence.hbs"; 
        let renderedRoll = await rollResult.render();

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
        await ChatMessage.create(chatData);

        // Message de suggestions si l'option est activée
        if(rollStats.valeurCritique) {
            let suggestCritData = {
                valeurCritique: rollStats.valeurCritique,
                nomCritique: rollStats.nomCritique,
                descCritique: rollStats.descCritique
            }
            await suggestCritChatMessage(actor, suggestCritData);
        }
    }

    return rollResult;
}

// Fonction de contsruction de la boite de dialogue de jet de compétence
async function getJetCompetenceOptions({cfgData = null, defCarac = null, specialisation = false, labelSpecialisation = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-competence.hbs";
    const html = await renderTemplate(template, {data: cfgData, defCarac: defCarac, specialisation: specialisation, labelSpecialisation: labelSpecialisation});

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
    let utiliseSpecialisation = false;
    if(form.utiliseSpecialisation) {
        utiliseSpecialisation = form.utiliseSpecialisation.checked;
    }

    return {
        caracteristique: form.caracteristique.value,
        difficulte: parseInt(form.difficulte.value),
        utiliseHeroisme : form.utiliseHeroisme.checked,
        utiliseSpecialisation: utiliseSpecialisation
    }
}

export async function combatArme(actor, arme, type) {
    let gererBonusAspect = actor.gererBonusAspect();

    let statsCombat = actor.getStatsCombat(arme.data.data.competence, arme.data.data.minForce, arme.data.data.minAgilite);

    if(statsCombat === null) {
        ui.notifications.error(`${game.i18n.localize("agone.notifications.errorDonnesArme")} ${arme.data.name}.`)
        return;
    }

    if(type == "Parade") {
        if(actor.reactionUtilisee()) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnReactionUtilisee"));
            return;
        }
    }

     // Construction des strutures de données pour l'affichage de la boite de dialogue
    let armeData = {
        nomArme: arme.data.name
    };

    //Cibles
    let ciblesData;
    let nbCibles = 0;
    if(game.user.targets.size > 0) {
        nbCibles = game.user.targets.size;
        let cibles = [];
        game.user.targets.forEach(token => {
            cibles.push({id: token.id, name: token.actor.data.name, combatant: token.combatant});
        });

        ciblesData = {
            nbCibles: nbCibles,
            cibles: cibles
        }
    }

    let ciblesMulti = game.settings.get("agone","ciblesMultiSurAttaque");
    if(nbCibles > 1 && !ciblesMulti) {
        ui.notifications.warn(`${game.i18n.localize("agone.notifications.warnCibleUnique")}`);
        return;
    }

    let dialogOptions;
    if(type == "Attaque") {
        statsCombat.modifAttaque = arme.data.data.modifAttaque;
        armeData.distance = arme.data.data.style == "trait" || arme.data.data.style == "jet" ? "distance" : "contact";
        let attaquantData = {
            potAttaque: statsCombat.rangCarac + statsCombat.rangComp + statsCombat.bonusAspect + statsCombat.malusManiement + arme.data.data.modifAttaque,
            specialisation : statsCombat.specialisation,
            labelSpecialisation: statsCombat.labelSpecialisation
        };

        dialogOptions = await getJetAttaqueOptions({attaquantData: attaquantData, armeData: armeData, cfgData: CONFIG.agone});
    }
    else if(type == "Parade") {
        statsCombat.modifParade = arme.data.data.modifParade;
        let defenseurData = {
            potDefense: statsCombat.rangCarac + statsCombat.rangComp + statsCombat.bonusAspect + statsCombat.malusManiement + arme.data.data.modifParade,
            typeDefense: "parade",
            specialisation : statsCombat.specialisation,
            labelSpecialisation: statsCombat.labelSpecialisation
        };

        dialogOptions = await getJetDefenseOptions({defenseurData: defenseurData, armeData: armeData});
    }

    
    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if(dialogOptions.annule) {
        return;
    }

    let modificateurs = 0;
    let difficulte;
    let utiliseHeroisme = false;
    let utiliseSpecialisation = false;
    // Récupération des données de la fenêtre de dialogue pour ce jet 
    if(type == "Attaque") {
        if(armeData.distance == "contact") {
            if(dialogOptions.mauvaiseMain) {
                modificateurs += -5;
            }
            if(dialogOptions.armeNonPrete) {
                modificateurs += -4;
            }
            if(dialogOptions.attaquantAuSol) {
                modificateurs += -3;
            }
            if(dialogOptions.attaquantsSimultanes > 1) {
                modificateurs += dialogOptions.attaquantsSimultanes > 1 ? dialogOptions.attaquantsSimultanes * 2 : 0;
            }
        }
        else if(armeData.distance == "distance") {
            if(dialogOptions.viser) {
                modificateurs += 2;
            }
            if(dialogOptions.armeNonPreteDist) {
                modificateurs += -5;
            }
            if(dialogOptions.tireurEnMelee) {
                modificateurs += -4;
            }
            modificateurs += dialogOptions.mouvementTireur;
            modificateurs += dialogOptions.taiCible;
            modificateurs += dialogOptions.visibiliteCible;
            modificateurs += dialogOptions.mouvementCible;
            difficulte = dialogOptions.difficulte;
        }
    }
    else if(type == "Parade") {
        if(dialogOptions.mauvaiseMain) {
            modificateurs += -5;
        }
        if(dialogOptions.armeNonPreteDist) {
            modificateurs += -5;
        }
        if(dialogOptions.attParMemeArme) {
            modificateurs += -1;
        }
        if(dialogOptions.defenseurAuSol) {
            modificateurs += -3;
        }
        if(dialogOptions.attaqueCote) {
            modificateurs += -1;
        }
        if(dialogOptions.attaqueDos) {
            modificateurs += -8;
        }
        if(dialogOptions.defenseurSureleve) {
            modificateurs += 2;
        }
    }

    utiliseHeroisme = dialogOptions.utiliseHeroisme;
    utiliseSpecialisation = dialogOptions.utiliseSpecialisation;

    let rollResult = await jetCompetence({
        actor: actor,
        rangComp: statsCombat.rangComp,
        labelComp: statsCombat.labelComp,
        jetDefautInterdit: false,
        rangCarac: statsCombat.rangCarac,
        labelCarac: statsCombat.labelCarac,
        bonusAspect: gererBonusAspect ? statsCombat.bonusAspect : null,
        labelAspect: gererBonusAspect ? statsCombat.labelAspect: null,
        modifAttaque: statsCombat.modifAttaque,
        modifParade: statsCombat.modifParade,
        malusManiement: statsCombat.malusManiement,
        modificateurs: modificateurs,
        utiliseHeroisme: utiliseHeroisme,
        utiliseSpecialisation: utiliseSpecialisation,
        afficherDialog: false,
        envoiMessage: false
    });

    let rollStats = {
        ...rollResult.data,
        ...statsCombat,
        modificateurs: modificateurs,
        utiliseHeroisme: utiliseHeroisme,
        utiliseSpecialisation: utiliseSpecialisation
    }

    if(!gererBonusAspect) {
        rollStats.labelAspect = null;
    }

    if(actor.estAttaquer() && type == "Parade") {
        rollStats.infosAttaque = actor.getInfosAttaque();
        let diffTaiMR = actor.calcDiffTaiMR(rollStats.infosAttaque.taiAttaquant);
        rollStats.marge = rollResult.total - rollStats.infosAttaque.resultatJet - rollStats.infosAttaque.bonusDommages;

        if(rollStats.marge + diffTaiMR <= 0) {
            rollStats.attaqueTouche = true;
            rollStats.dommagesRecus = (rollStats.marge * -1) - actor.getProtectionArmure();

            if(rollStats.dommagesRecus > statsCombat.seuilBlessureCritique) {
                rollStats.blessureCritique = true;
            }
            else if (rollStats.dommagesRecus > statsCombat.seuilBlessureGrave) {
                rollStats.blessureGrave = true;
            }
        }
    }

    /*if(difficulte) {
        rollStats.difficulte = difficulte;
        rollStats.marge = rollResult.total - difficulte;
        if(rollStats.marge <= -15) {
            rollStats.isEchecCritiqueMarge = true;
            rollStats.valeurCritique = rollStats.valeurCritique ? Math.min(rollStats.valeurCritique, rollStats.marge + 5) : rollStats.marge + 5;
        }
    }*/

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("epreuves", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-arme.hbs";
    let renderedRoll = await rollResult.render();

     // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        arme: arme.data,
        type: type,
        ciblesData : type == "Attaque" ? ciblesData : null,
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

    // Message de suggestions si l'option est activée
    if(rollStats.valeurCritique) {
        let suggestCritData = {
            valeurCritique: rollStats.valeurCritique,
            nomCritique: rollStats.nomCritique,
            descCritique: rollStats.descCritique
        }
        suggestCritChatMessage(actor, suggestCritData);
    }

    if(type == "Attaque" && nbCibles > 0) {
        let combattant = ciblesData.cibles[0].combatant;
        if(combattant) {
            let bd = statsCombat.bonusDommages + arme.data.data.modifDommages;
            combattant.setAttaqueCombattant(actor.data.name, statsCombat.tai, rollResult.total, bd);
        }
    }

    if(type == "Parade") {
        actor.setDefense(true, rollResult.total);
        // TODO - Retirer les dommages aux PV, et appliquer les blessures graves
    }
}

// Fonction de construction de la boite de dialogue de jet d'attaque
async function getJetAttaqueOptions({attaquantData = null, armeData = null, cfgData = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-combat-attaque.hbs";
    const html = await renderTemplate(template, {attaquantData: attaquantData, armeData: armeData, cfgData: cfgData});

    return new Promise( resolve => {
        const data = {
            title: game.i18n.localize("agone.actors.jetAttaque"),
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: game.i18n.localize("agone.common.jet"),
                    callback: html => resolve(_processJetAttaqueOptions(html[0].querySelector("form"), armeData.distance))
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

// Gestion des données renseignées dans la boite de dialogue de jet d'attaque
function _processJetAttaqueOptions(form, distance) {
    let utiliseSpecialisation = false;
    if(form.utiliseSpecialisation) {
        utiliseSpecialisation = form.utiliseSpecialisation.checked;
    }
    // On récupère les valeurs selon le type d'arme - au contact ou à distance 
    if(distance == "contact") {
        return {
            mauvaiseMain: form.mauvaiseMain.checked,
            armeNonPrete: form.armeNonPrete.checked,
            attaquantAuSol: form.attaquantAuSol.checked,
            attaquantsSimultanes: parseInt(form.attaquantsSimultanes.value),
            utiliseHeroisme : form.utiliseHeroisme.checked,
            utiliseSpecialisation: utiliseSpecialisation
        }
    }
    else if(distance == "distance") {
        return {
            viser: form.viser.checked,
            armeNonPreteDist: form.armeNonPreteDist.checked,
            tireurEnMelee: form.tireurEnMelee.checked,
            mouvementTireur: parseInt(form.mouvementTireur.value),
            taiCible: parseInt(form.taiCible.value),
            visibiliteCible: parseInt(form.visibiliteCible.value),
            mouvementCible: parseInt(form.mouvementCible.value),
            difficulte: parseInt(form.difficulte.value),
            utiliseHeroisme : form.utiliseHeroisme.checked,
            utiliseSpecialisation: utiliseSpecialisation
        }
    }
}

// Fonction de construction de la boite de dialogue de jet de defense
async function getJetDefenseOptions({defenseurData = null, armeData = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-combat-defense.hbs";
    const html = await renderTemplate(template, {defenseurData: defenseurData, armeData: armeData});

    return new Promise( resolve => {
        const data = {
            title: game.i18n.localize("agone.actors.jetDefense"),
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: game.i18n.localize("agone.common.jet"),
                    callback: html => resolve(_processJetDefenseOptions(html[0].querySelector("form"), defenseurData.typeDefense))
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

// Gestion des données renseignées dans la boite de dialogue de jet d'attaque
function _processJetDefenseOptions(form, typeDefense) {
    let utiliseSpecialisation = false;
    if(form.utiliseSpecialisation) {
        utiliseSpecialisation = form.utiliseSpecialisation.checked;
    }
    // On récupère les valeurs selon le type d'arme - au contact ou à distance 
    if(typeDefense == "parade") {
        return {
            mauvaiseMain: form.mauvaiseMain.checked,
            armeNonPreteDist: form.armeNonPreteDist.checked,
            attParMemeArme: form.attParMemeArme.checked,
            defenseurAuSol: form.defenseurAuSol.checked,
            attaqueCote: form.attaqueCote.checked,
            attaqueDos: form.attaqueDos.checked,
            defenseurSureleve: form.defenseurSureleve.checked,
            utiliseHeroisme : form.utiliseHeroisme.checked,
            utiliseSpecialisation: utiliseSpecialisation
        }
    }
    else if(typeDefense == "esquive") {
        return {
            defenseurEnSelle: form.defenseurEnSelle.checked,
            defenseurAuSol: form.defenseurAuSol.checked,
            attaqueCote: form.attaqueCote.checked,
            attaqueDos: form.attaqueDos.checked,
            defenseurSureleve: form.defenseurSureleve.checked,
            utiliseHeroisme : form.utiliseHeroisme.checked,
            utiliseSpecialisation: utiliseSpecialisation
        }
    }
}

// Jet de sort d'Emprise, avec affichage du message dans le chat
export async function sortEmprise(mage, danseur, sort, isIntuitif = false) {
    let statsEmprise = mage.getStatsEmprise();

    // Pas de jet de sort si le Danseur n'a plus d'endurance
    if(danseur.data.data.endurance.value <= 0) {
        ui.notifications.warn(`${danseur.data.name} ${game.i18n.localize("agone.notifications.warnDanseurEpuise")}`);
        return;
    }

    let potEmprise;
    // Le sort est défini (magie non intuitive)
    if(!isIntuitif) {
        // Ajout sur le sort des données pour gérer le cas des sorts d'une obédience différente de celle du Mage
        sort.data.data.diffObedience = false;
        sort.data.data.seuilTotal = sort.data.data.seuil;

        if(sort.data.data.resonance != statsEmprise.resonance) {
            sort.data.data.diffObedience = true;
            sort.data.data.seuilTotal += 5;
        }

        potEmprise = statsEmprise.emprise + Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs) + statsEmprise.bonusEsprit + danseur.data.data.bonusEmprise; 
    }
    else {
        potEmprise = statsEmprise.creativite + Math.min(statsEmprise.rangResonance,  danseur.data.data.empathie) + statsEmprise.bonusAme; 
    }

    // Construction des strutures de données pour l'affichage de la boite de dialogue
    let mageData = {
        potEmprise: potEmprise,
        resonance: statsEmprise.resonance,
        specialisation: statsEmprise.specialisation,
        labelSpecialisation: statsEmprise.labelSpecialisation
    };

    let danseurData = {
        nomDanseur: danseur.data.name
    };

    let sortData = {
        nomSort: isIntuitif ? game.i18n.localize("agone.items.sortIntuitif") : sort.data.name,
        seuil: isIntuitif ? 0 : sort.data.data.seuil,
        seuilTotal: isIntuitif ? 0 : sort.data.data.seuilTotal,
        diffObedience: isIntuitif ? false : sort.data.data.diffObedience,
        isIntuitif: isIntuitif
    };

    let dialogOptions = await getJetSortEmpriseOptions({mageData: mageData, danseurData: danseurData, sortData: sortData, cfgData: CONFIG.agone});

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if(dialogOptions.annule) {
        return;
    }

    // Récupération des données de la fenêtre de dialogue pour ce jet 
    let seuilTotalIntuitif;
    if(isIntuitif) {
        seuilTotalIntuitif = dialogOptions.seuilEstime * 2;
        let modifObedience = dialogOptions.resonanceEstimee != statsEmprise.resonance ? 5 : 0;
        seuilTotalIntuitif = dialogOptions.magieInstantanee ? seuilTotalIntuitif = (seuilTotalIntuitif * 2) + modifObedience : seuilTotalIntuitif = seuilTotalIntuitif + modifObedience;
    }
    else {
        if(dialogOptions.magieInstantanee) {
            sort.data.data.seuilTotal = sort.data.data.diffObedience == true ? sort.data.data.seuil * 2 + 5 : (sort.data.data.seuil * 2);
        }
    }

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let rollResult = await jetCompetence({
        actor: mage,
        rangComp:  isIntuitif ? Math.min(statsEmprise.rangResonance, danseur.data.data.empathie) : Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs),
        jetDefautInterdit: true,
        rangCarac: isIntuitif ? statsEmprise.creativite : statsEmprise.emprise,
        bonusAspect: isIntuitif ? statsEmprise.bonusAme : statsEmprise.bonusEsprit,
        bonusEmprise: isIntuitif ? null : danseur.data.data.bonusEmprise,
        danseurInvisible: dialogOptions.danseurInvisible,
        mouvImperceptibles: dialogOptions.mouvImperceptibles,
        utiliseHeroisme: dialogOptions.utiliseHeroisme,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        afficherDialog: false,
        envoiMessage: false
    });

    // Si le jet de compétence est annulé, on arrête le jet de sort (ex: compétence par défaut non autorisée)
    if(rollResult == null) return;

    // On baisse l'endurance du danseur d'un point
    let valEndurance = danseur.data.data.endurance.value -1;
    danseur.update({"data.endurance.value": valEndurance});

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsEmprise.specialisation,
        labelSpecialisation: statsEmprise.labelSpecialisation,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        difficulte: isIntuitif ? seuilTotalIntuitif : sort.data.data.seuilTotal,
        isIntuitif: isIntuitif
    }

    rollStats.marge = isIntuitif ? rollResult.total - seuilTotalIntuitif : rollResult.total - sort.data.data.seuilTotal;
    if(rollStats.marge <= -15) {
        rollStats.isEchecCritiqueMarge = true;
        rollStats.valeurCritique = rollStats.valeurCritique ? Math.min(rollStats.valeurCritique, rollStats.marge + 5) : rollStats.marge + 5;
    }

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("emprise", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-sort-emprise.hbs";
    let renderedRoll = await rollResult.render();

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        mage: mageData,
        danseur: danseurData,
        sort:  isIntuitif ? null : sort.data,
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

    // Message de suggestions si l'option est activée
    if(rollStats.valeurCritique) {
        let suggestCritData = {
            valeurCritique: rollStats.valeurCritique,
            nomCritique: rollStats.nomCritique,
            descCritique: rollStats.descCritique
        }
        suggestCritChatMessage(mage, suggestCritData);
    }
}

// Fonction de construction de la boite de dialogue de jet de sort d'Emprise
async function getJetSortEmpriseOptions({mageData = null, danseurData = null, sortData = null, cfgData = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-sort-emprise.hbs";
    const html = await renderTemplate(template, {mageData: mageData, danseurData: danseurData, sortData: sortData, cfgData: cfgData });

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

    let seuilEstime = 0;
    if(form.seuilEstime) {
        seuilEstime = parseInt(form.seuilEstime.value);
    }

    let resonanceEstimee = "";
    if(form.resonanceEstimee) {
        resonanceEstimee = form.resonanceEstimee.value;
    }

    let utiliseSpecialisation = false;
    if(form.utiliseSpecialisation) {
        utiliseSpecialisation = form.utiliseSpecialisation.checked;
    }

    return {
        magieInstantanee: form.magieInstantanee.checked,
        danseurInvisible: form.danseurInvisible.checked,
        mouvImperceptibles: mouvImp,
        utiliseHeroisme : form.utiliseHeroisme.checked,
        seuilEstime: seuilEstime,
        resonanceEstimee: resonanceEstimee,
        utiliseSpecialisation: utiliseSpecialisation
    }
}

// Jet d'une oeuvre d'Art magique, avec affichage du message dans le chat
export async function oeuvre(artiste, oeuvre, artMagiqueImpro = null, isArtImpro = false) {
    let artMagique = isArtImpro ? artMagiqueImpro : oeuvre.data.data.artMagique;
    let statsArtMagique;
    let potArtMagique;

    if(isArtImpro) {
        statsArtMagique = artiste.getStatsArtMagique(artMagique);
        potArtMagique = statsArtMagique.creativite + Math.min(statsArtMagique.rangArtMagique, statsArtMagique.rangCompetence) + statsArtMagique.bonusAme;
    }
    else {
        if(oeuvre.data.data.artMagique == "accord") {
            statsArtMagique = artiste.getStatsArtMagique(artMagique, oeuvre.data.data.instrument);
        }
        else {
            statsArtMagique = artiste.getStatsArtMagique(artMagique);
        }
        potArtMagique = statsArtMagique.art + Math.min(statsArtMagique.rangArtMagique, statsArtMagique.rangCompetence) + statsArtMagique.bonusAme;
        oeuvre.data.data.seuilTotal = oeuvre.data.data.seuil;
    }
    
    // Construction des strutures de données pour l'affichage de la boite de dialogue
    let artisteData = {
        potArtMagique: potArtMagique,
        specialisation: statsArtMagique.specialisation,
        labelSpecialisation: statsArtMagique.labelSpecialisation
    };

    let oeuvreData = {
        nomOeuvre: isArtImpro ? game.i18n.localize("agone.actors.oeuvreImprovisee") : oeuvre.data.name,
        seuil: isArtImpro ? 0 : oeuvre.data.data.seuil,
        artMagique: isArtImpro ? artMagiqueImpro : oeuvre.data.data.artMagique,
        saison: isArtImpro ? "" : oeuvre.data.data.saison,
        instruments: isArtImpro ? artiste.getInstrumentsPratiques() : null,
        isArtImpro: isArtImpro
    };

    let dialogOptions = await getJetOeuvreOptions({artisteData: artisteData, oeuvreData: oeuvreData, cfgData: CONFIG.agone});

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if(dialogOptions.annule) {
        return;
    }

     // Récupération des données de la fenêtre de dialogue pour ce jet 
    let seuilTotalImpro;
    if(isArtImpro) {
        // Dans le cas d'une eouvre iprovisée d'Accord, on recalcule les stats
        if(artMagiqueImpro == "accord") {
            statsArtMagique = artiste.getStatsArtMagique(artMagiqueImpro,dialogOptions.instrumentSel);
            artisteData.potArtMagique = statsArtMagique.creativite + Math.min(statsArtMagique.rangArtMagique, statsArtMagique.rangCompetence) + statsArtMagique.bonusAme;
        }

        seuilTotalImpro = dialogOptions.seuilEstime * 2;
        if(dialogOptions.magieInstantanee) {
            seuilTotalImpro = seuilTotalImpro * 2;
        }
        seuilTotalImpro += dialogOptions.margeQualite;
    }
    else {
        if(dialogOptions.magieInstantanee) {
            oeuvre.data.data.seuilTotal = oeuvre.data.data.seuil * 2;
        }
        oeuvre.data.data.seuilTotal += dialogOptions.margeQualite;
    }

    let qualite = getNiveauQualite(dialogOptions.margeQualite);

    let modificateurs = 0;
    let resistance = 0;
    switch(artMagique) {
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
        rangCarac: isArtImpro ? statsArtMagique.creativite : statsArtMagique.art,
        bonusAspect: statsArtMagique.bonusAme,
        modificateurs: modificateurs,
        utiliseHeroisme: dialogOptions.utiliseHeroisme,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        afficherDialog: false,
        envoiMessage: false
    });

    // Si le jet de compétence est annulé, on arrête le jet d'art magique (ex: compétence par défaut non autorisée)
    if(rollResult == null) return;

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        //specialisation: statsArtMagique.specialisation,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        labelSpecialisation: statsArtMagique.labelSpecialisation,
        difficulte: isArtImpro ? seuilTotalImpro : oeuvre.data.data.seuilTotal,
        qualite: qualite,
        isArtImpro: isArtImpro
    }

    rollStats.marge = isArtImpro ? rollResult.total - seuilTotalImpro : rollResult.total - oeuvre.data.data.seuilTotal;
    if(rollStats.marge <= -15) {
        rollStats.isEchecCritiqueMarge = true;
        rollStats.valeurCritique = rollStats.valeurCritique ? Math.min(rollStats.valeurCritique, rollStats.marge + 5) : rollStats.marge + 5;
    }

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos(artMagique, rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // Dans le cas de la Cyse, gestion de la résistance des matériaux
    if(artMagique == "cyse") {
        let rollResistance = await new Roll("1d10 + @resistance", {resistance: resistance}).roll({async: true});
        if(rollResistance.total >= artisteData.potArtMagique) {
            rollStats.echecResistance = true;
            rollStats.rollResistance = await rollResistance.render();
        }
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-oeuvre.hbs";
    let renderedRoll = await rollResult.render();

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        artiste: artisteData,
        oeuvre: isArtImpro ? null : oeuvre.data,
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

    // Message de suggestions si l'option est activée
    if(rollStats.valeurCritique) {
        let suggestCritData = {
            valeurCritique: rollStats.valeurCritique,
            nomCritique: rollStats.nomCritique,
            descCritique: rollStats.descCritique
        }
        suggestCritChatMessage(artiste, suggestCritData);
    }
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
    let seuilEstime = 0;
    let instrumentSel = null;

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

    if(form.seuilEstime) {
        seuilEstime = parseInt(form.seuilEstime.value);
    }

    if(form.instrumentSel) {
        instrumentSel = form.instrumentSel.value;
    }

    let utiliseSpecialisation = false;
    if(form.utiliseSpecialisation) {
        utiliseSpecialisation = form.utiliseSpecialisation.checked;
    }

    return {
        magieInstantanee: form.magieInstantanee.checked,
        qualiteInstrument: qualiteInstrument,
        bruitEnviron: bruitEnviron,
        saisonOeuvre: saisonOeuvre,
        materiaux: materiaux,
        seuilEstime: seuilEstime,
        instrumentSel: instrumentSel,
        margeQualite: parseInt(form.margeQualite.value),
        utiliseHeroisme : form.utiliseHeroisme.checked,
        utiliseSpecialisation : utiliseSpecialisation
    }
}

// Jet de Contre-magie, avec affichage du messsage dans la chat
export async function contreMagie(mage, danseur, utiliseHeroisme) {
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
        utiliseHeroisme: utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    // Si le jet de compétence est annulé, on arrête le jet de contre magie (ex: compétence par défaut non autorisée)
    if(rollResult == null) return;

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsEmprise.specialisation,
        labelSpecialisation: statsEmprise.labelSpecialisation
    }

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("emprise", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-contre-magie.hbs";
    let renderedRoll = await rollResult.render();

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

    // Message de suggestions si l'option est activée
    if(rollStats.valeurCritique) {
        let suggestCritData = {
            valeurCritique: rollStats.valeurCritique,
            nomCritique: rollStats.nomCritique,
            descCritique: rollStats.descCritique
        }
        suggestCritChatMessage(mage, suggestCritData);
    }
}

export async function desaccord(artiste, instrument, utiliseHeroisme) {
    
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
        utiliseHeroisme: utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    // Si le jet de compétence est annulé, on arrête le jet de désaccord (ex: compétence par défaut non autorisée)
    if(rollResult == null) return;

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsAccord.specialisation,
        labelSpecialisation: statsAccord.labelSpecialisation
    }

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("accord", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-desaccord.hbs";
    let renderedRoll = await rollResult.render();

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

    // Message de suggestions si l'option est activée
    if(rollStats.valeurCritique) {
        let suggestCritData = {
            valeurCritique: rollStats.valeurCritique,
            nomCritique: rollStats.nomCritique,
            descCritique: rollStats.descCritique
        }
        suggestCritChatMessage(artiste, suggestCritData);
    }
}

export async function jetDefense(defenseur, typeDef) {
    let compData;

    if(typeDef == "esquive") {
        if(defenseur.reactionUtilisee()) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnReactionUtilisee"));
            return;
        }
        compData = defenseur.getCompData("epreuves", "esquive", null);
    }

    let caracData = defenseur.getCaracData("agilite");
    let gererBonusAspect = defenseur.gererBonusAspect();

    let defenseurData;
    let titrePersonnalise;
    if(typeDef == "esquive") {
        titrePersonnalise = game.i18n.localize("agone.actors.jetEsquive");
        defenseurData = {
            potDefense: caracData.rangCarac + compData.rangComp + caracData.bonusAspect,
            typeDefense: "esquive"
        };
    }
    else if(typeDef == "defenseNat") {
        titrePersonnalise = game.i18n.localize("agone.actors.jetDefenseNat");
        defenseurData = {
            potDefense: caracData.rangCarac + caracData.bonusAspect,
            typeDefense: "esquive"
        };
    }

    let dialogOptions = await getJetDefenseOptions({defenseurData: defenseurData, armeData: null});

     // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
     if(dialogOptions.annule) {
        return;
    }

    
    let modificateurs = 0;
    if(dialogOptions.defenseurEnSelle) {
        modificateurs += -5;
    }
    if(dialogOptions.defenseurAuSol) {
        modificateurs += -3;
    }
    if(dialogOptions.attaqueCote) {
        modificateurs += -1;
    }
    if(dialogOptions.attaqueDos) {
        modificateurs += -8;
    }
    if(dialogOptions.defenseurSureleve) {
        modificateurs += 2;
    }

    let utiliseHeroisme = dialogOptions.utiliseHeroisme;

    let rollResult = await jetCompetence({
        actor: defenseur,
        rangComp: typeDef == "esquive" ? compData.rangComp : null,
        labelComp: typeDef == "esquive" ? compData.labelComp: null,
        specialisation: typeDef == "esquive" ? compData.specialisation : null,
        labelSpecialisation: typeDef == "esquive" ? compData.labelSpecialisation : null,
        jetDefautInterdit: typeDef == "esquive" ? compData.jetDefautInterdit : false,
        rangCarac: caracData.rangCarac,
        labelCarac: caracData.labelCarac,
        bonusAspect: gererBonusAspect ? caracData.bonusAspect : null,
        labelAspect: gererBonusAspect ? caracData.labelAspect: null,
        modificateurs: modificateurs,
        utiliseHeroisme: utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    let rollStats = {
        ...rollResult.data,
        labelCarac: caracData.labelCarac,
        labelAspect: caracData.labelAspect,
        labelComp: typeDef == "esquive" ? compData.labelComp : null,
        modificateurs: modificateurs,
        utiliseHeroisme: utiliseHeroisme,
        titrePersonnalise: titrePersonnalise
    }

    if(!gererBonusAspect) {
        rollStats.labelAspect = null;
    }
    
    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("epreuves", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    const messageTemplate = "systems/agone/templates/partials/dice/jet-competence.hbs";
    let renderedRoll = await rollResult.render();

    let templateContext = {
        stats: rollStats,
        roll: renderedRoll
    }

    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: defenseur }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    ChatMessage.create(chatData);

    // Message de suggestions si l'option est activée
    if(rollStats.valeurCritique) {
        let suggestCritData = {
            valeurCritique: rollStats.valeurCritique,
            nomCritique: rollStats.nomCritique,
            descCritique: rollStats.descCritique
        }
        suggestCritChatMessage(defenseur, suggestCritData);
    }

    defenseur.setDefense(typeDef == "defenseNat" ? false : true, rollResult.total);
}

// Renvoi le niveau de qualité d'une oeuvre en fonction du malus que s'impose l'artiste
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

// Renvoi le niveau de gravite de l'échec critique en fonction du résultat du dé ou de la marge
function getCritInfos(familleComp, valeurCritique) {
    let critInfos = {};

    let gravite;
    if(valeurCritique >= -14) {
        gravite = 1;
    }
    else if(valeurCritique >= -19) {
        gravite = 2;
    }
    else if(valeurCritique >= -24) {
        gravite = 3;
    }
    else if(valeurCritique >= -29) {
        gravite = 4;
    }
    else {
        gravite = 5;
    }

    let elem = CONFIG.agone.critInfos[familleComp][gravite];
    critInfos.nom = elem.nom;
    critInfos.desc = elem.description;

    return critInfos;
}

// Envoi d'un message à l'EG pour lui proposer une interprétation de l'échec critique en fonction de sa gravité
async function suggestCritChatMessage(actor, suggestCritData) {
    let suggestCritOption = game.settings.get("agone","suggestEchecCritEG");

    // Si l'option n'est pas activée, on quitte la fonction
    if(!suggestCritOption) return;

    // TODO trouver une méthode plus propre pour pousser le message au GM sans q'uil soit visible coté joueur
    // Peux-être retravailler le template de blind roll
    let roll = await new Roll("0", null).roll({async : true});

    let chatCritData = {
        user: game.user.id,
        roll: roll,
        blind: true,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        whisper: game.users.filter(user => user.isGM == true), // Whisper à l'EG
        content: await renderTemplate("systems/agone/templates/partials/dice/suggestion-critique.hbs", suggestCritData),
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    await ChatMessage.create(chatCritData);  
}