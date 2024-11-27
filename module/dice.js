/*********************** 
 *** CARACTERISTIQUE ***
***********************/

/* ------------------------------------------------------------------
--- Jet de caractéristique avec affichage du message dans la chat ---
------------------------------------------------------------------ */
export async function jetCaracteristique({actor = null, 
    aspect = null,
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
        // formule a test "1d10xo1x10"

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
    let malusBlessureGrave = actor.getMalusBlessureGrave(actor.system.caracSecondaires.nbBlessureGrave);
    if(malusBlessureGrave < 0) {
        rollData.malusBlessureGrave = malusBlessureGrave;
        baseFormula += " + @malusBlessureGrave";
    }

    // Utilisation d'un point d'héroïsme
    if(utiliseHeroisme) {

        //actor.subirDommages(5);
        //actor.setD10Pdv(5);

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

    // Détails du pool de dés jetés à afficher dans le chat
    // (class css pour l'affichage et resulat du dé)
    var dices = [];

    // Jet du 1er dé
    let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
    if(rollResult.dice[0].results[0].result == 1) {
        // Si le 1er dé donne 1, c'est un Fumble
        rollData.isFumble = true;
        // Ajout du dé dans le pool
        dices.push({ classes: "die d10 min", result : 1});

        rollResult = await new Roll(rollFumbleFormula, rollData).roll({async: true});
        //Si le second dé donne 10, c'est un échec critique
        if(rollResult.dice[0].results[0].result == 10) {
            rollData.isEchecCritiqueJetDe = true;
            rollData.valeurCritique = rollResult.dice[0].total;
        }
    }

    // Total du jet
    rollData.total = rollResult.total;

    // Ajout de tous les dés dans le pool
    rollResult.dice[0].results.forEach( res => {
        let classes = "die d10"; 
        if (res.result == 10) { classes += " max"; }
        dices.push({ classes: classes, result : res.result});
    });

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

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos(aspect, rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-caracteristique.hbs"; 

    // Assignation des données au template
    let templateContext = {
        stats : rollStats,
        dices: dices
    }

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL // CONST.CHAT_MESSAGE_STYLES
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
        await suggestCritChatMessage(actor, suggestCritData);
    }
}

/****************** 
 *** COMPETENCE ***
******************/

/* ----------------------------------------
--- Jet de compétence, avec au choix :  ---
--- - affichage du message dans le chat ---
--- - renvoi du rollResult              ---
---------------------------------------- */
export async function jetCompetence({actor = null,
    rangComp = null,
    labelComp = null,
    familleComp = null,
    specialisation = false,
    labelSpecialisation = null,
    jetDefautInterdit = null,
    diffJetVieillesse = null,
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
    let malusBlessureGrave = actor.getMalusBlessureGrave(actor.system.caracSecondaires.nbBlessureGrave);
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

    // Détails du pool de dés jetés à afficher dans le chat
    // (class css pour l'affichage et resulat du dé)
    var dices = [];

    // Jet du 1er dé
    let rollResult = await new Roll(rollFormula, rollData).roll({async: true});
    if(rollResult.dice[0].results[0].result == 1) {
        // Si le 1er dé donne 1, c'est un Fumble
        rollData.isFumble = true;
        // Ajout du dé dans le pool
        dices.push({ classes: "die d10 min", result : 1});

        rollResult = await new Roll(rollFumbleFormula, rollData).roll({async: true});
        //Si le second dé donne 10, c'est un échec critique
        if(rollResult.dice[0].results[0].result == 10) {
            rollData.isEchecCritiqueJetDe = true;
            rollData.valeurCritique = rollResult.dice[0].total;
        }
    }

    // Total du jet
    rollData.total = rollResult.total;

    // Ajout de tous les dés dans le pool
    rollResult.dice[0].results.forEach( res => {
        let classes = "die d10"; 
        if (res.result == 10) { classes += " max"; }
        //else if (res.result == 1) { classes += " min"; }
        dices.push({ classes: classes, result : res.result});
    });

    if(envoiMessage) {
        // Construction du jeu de données pour alimenter le template
        let rollStats = {
            ...rollData,
            labelCarac: labelCarac,
            labelComp: labelComp,
            utiliseSpecialisation: utiliseSpecialisation,
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
            if(diffJetVieillesse) {
                difficulte += diffJetVieillesse;
            }
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

        // Assignation des données au template
        let templateContext = {
            stats : rollStats,
            dices: dices
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

    return [rollResult, dices];
}

/* --------------------------------------------------------------------------
--- Fonction de construction de la boite de dialogue de jet de compétence ---
-------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------------------------
--- Gestion des données renseignées dans la boite de dialogue de jet de compétence ---
----------------------------------------------------------------------------------- */
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

/************** 
 *** COMBAT ***
**************/

/* -----------------------------------------------------------
--- Gestion des jets d'attaque et de défense avec une arme ---
----------------------------------------------------------- */
export async function combatArme(actor, arme, type) {
    //console.log(game.combat, actor.estCombattantActif());

    // Vérification de l'utilisation d'une réaction le même round - uniquement en combat
    if(type == "Parade") {
        if(actor.reactionUtilisee() && game.settings.get("agone","gestionDesRencontres")) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnReactionUtilisee"));
            return;
        }
    }

    // Vérification que l'attaque à lieu durant le tour du personnage - uniquement en combat
    if(type == "Attaque" && actor.getCombatant()) {
        if(!actor.estCombattantActif() && game.settings.get("agone","gestionDesRencontres")) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnAttaqueTourCombat"));
            return;
        }
    }

    //Cibles - uniquement en combat
    let ciblesData;
    let nbCibles = 0;
    if(game.user.targets.size > 0 && actor.getCombatant()) {
        nbCibles = game.user.targets.size;
        let cibles = [];
        game.user.targets.forEach(token => {
            cibles.push({id: token.id, name: token.actor.name, combatant: token.combatant});
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

    // Calcul des données de combat
    let compData = new Object();
    // Competence
    if(arme.system.competence) {
        compData = actor.getCompData("epreuves", "armes", arme.system.competence);
    }
    else {
        compData.rangComp = -3;
        compData.labelComp = game.i18n.localize("agone.chat.combatSansCompArme");
        compData.specialisation = false;
        compData.labelSpecialisation = "";
        compData.isJetDefaut = true;
    }
    
    // Caractéristique
    const carac = arme.system.style == "trait" || arme.system.style == "jet" ? "tir" : "melee";
    let caracData = actor.getCaracData(carac);
    
    // Autres stats de combat
    let statsCombat = new Object();

    // Malus de maniement suivants prérequis AGI et FOR
    let reducMalusAgi = 0;
    let reducMalusFor = 0;
    if(arme.system.style == "melee" && arme.system.equipee == "deuxMains") {
        reducMalusAgi = 1;
        reducMalusFor = 2;
    }

    statsCombat.malusManiement = null;
    let malusAgilite = Math.min(actor.system.aspects.corps.caracteristiques.agilite.valeur - arme.system.minAgilite + reducMalusAgi, 0);
    let malusForce = Math.min(actor.system.aspects.corps.caracteristiques.force.valeur - arme.system.minForce + reducMalusFor, 0);
    if(malusAgilite + malusForce < 0) {
        statsCombat.malusManiement = malusAgilite + malusForce;
    }

    // Autres données de l'acteur
    statsCombat.malusBlessureGrave = actor.getMalusBlessureGrave(actor.system.caracSecondaires.nbBlessureGrave);
    statsCombat.bonusDommages = actor.system.caracSecondaires.bonusDommages;
    statsCombat.tai = actor.system.caracSecondaires.tai.valeur;
    statsCombat.seuilBlessureGrave = actor.system.caracSecondaires.seuilBlessureGrave;
    statsCombat.seuilBlessureCritique = actor.system.caracSecondaires.seuilBlessureCritique;

    // Construction des strutures de données pour l'affichage de la boite de dialogue
    let armeData = {
        nomArme: arme.name
    };

    let dialogOptions;
    if(type == "Attaque") {
        statsCombat.modifAttaque = arme.system.modifAttaque;
        armeData.distance = arme.system.style == "trait" || arme.system.style == "jet" ? "distance" : "contact";
        let attaquantData = {
            potAttaque: caracData.rangCarac + caracData.bonusAspect + compData.rangComp + statsCombat.malusManiement + arme.system.modifAttaque,
            specialisation : compData.specialisation,
            labelSpecialisation: compData.labelSpecialisation
        };

        dialogOptions = await getJetAttaqueOptions({attaquantData: attaquantData, armeData: armeData, cfgData: CONFIG.agone});
    }
    else if(type == "Parade") {
        statsCombat.modifParade = arme.system.modifParade;
        let defenseurData = {
            potDefense: caracData.rangCarac + caracData.bonusAspect + compData.rangComp + statsCombat.malusManiement + arme.system.modifParade,
            typeDefense: "parade",
            specialisation : compData.specialisation,
            labelSpecialisation: compData.labelSpecialisation
        };

        dialogOptions = await getJetDefenseOptions({defenseurData: defenseurData, armeData: armeData});
    }

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if(dialogOptions.annule) {
        return;
    }

    let modificateurs = 0;
    let utiliseHeroisme = false;
    let utiliseSpecialisation = false;
    // Récupération des données de la fenêtre de dialogue pour ce jet 
    
    let difficulte = null;

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

    const gererBonusAspect = actor.gererBonusAspect();

    let result = await jetCompetence({
        actor: actor,
        rangComp: compData.rangComp,
        labelComp: compData.labelComp,
        jetDefautInterdit: false,
        rangCarac: caracData.rangCarac,
        labelCarac: caracData.labelCarac,
        bonusAspect: gererBonusAspect ? caracData.bonusAspect : null,
        labelAspect: gererBonusAspect ? caracData.labelAspect: null,
        modifAttaque: statsCombat.modifAttaque,
        modifParade: statsCombat.modifParade,
        malusManiement: statsCombat.malusManiement,
        modificateurs: modificateurs,
        utiliseHeroisme: utiliseHeroisme,
        utiliseSpecialisation: utiliseSpecialisation,
        afficherDialog: false,
        envoiMessage: false
    });

    if(result == null) return;
    
    const rollResult = result[0];
    const dices = result[1];

    let rollStats = {
        ...rollResult.data,
        ...compData,
        ...caracData,
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
                let lienTableCritique = getTableCritique(rollStats.infosAttaque.typeArme);
                if(lienTableCritique) {
                    rollStats.lienTableCritique = lienTableCritique;
                }
            }
            else if (rollStats.dommagesRecus > statsCombat.seuilBlessureGrave) {
                rollStats.blessureGrave = true;
            }
        }
    }

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("epreuves", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // TO DO - Gestion de la difficulté sur la carte jet-arme
    if(difficulte) {
        rollStats.difficulte = difficulte;
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-arme.hbs";
    //let renderedRoll = await rollResult.render();

     // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        dices: dices,
        arme: arme,
        type: type,
        ciblesData : type == "Attaque" ? ciblesData : null
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
        await suggestCritChatMessage(actor, suggestCritData);
    }

    if(type == "Attaque" && nbCibles > 0) {
        let combattant = ciblesData.cibles[0].combatant;
        if(combattant) {
            let bd = statsCombat.bonusDommages + arme.system.modifDommages;
            combattant.setAttaqueCombattant(actor.name, arme.system.type, statsCombat.tai, rollResult.total, bd);
        }
    }

    if(type == "Parade") {
        actor.setDefense(true, rollResult.total);
        // Retirer les dommages aux PV, et appliquer les blessures graves
        if(rollStats.dommagesRecus) {
            actor.subirDommages(rollStats.dommagesRecus);
        }

        if(rollStats.blessureGrave) {
            actor.subirBlessureGrave();
        }
    }
}

/* ----------------------------------------------------------------------
--- Fonction de construction de la boite de dialogue de jet d'attaque ---
---------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------------
--- Gestion des données renseignées dans la boite de dialogue de jet d'attaque ---
------------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------------
--- Fonction de construction de la boite de dialogue de jet de defense ---
----------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------------------
--- Gestion des données renseignées dans la boite de dialogue de jet de defense ---
-------------------------------------------------------------------------------- */
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

/* -------------------------------------------------------
--- Gestion des jets de défense anturelle ou d'esquive ---
------------------------------------------------------- */
export async function jetDefense(defenseur, typeDef) {
    let compData;

    if(typeDef == "esquive") {
        if(defenseur.reactionUtilisee() && game.settings.get("agone","gestionDesRencontres")) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnReactionUtilisee"));
            return;
        }
        compData = defenseur.getCompData("epreuves", "esquive", null);
    }

    let caracData = defenseur.getCaracData("agilite");
    let gererBonusAspect = defenseur.gererBonusAspect();

    let titrePersonnalise;
    let defenseurData = {
        typeDefense: "esquive", // Pour gestion fenetre de dialogue
        seuilBlessureCritique: defenseur.system.caracSecondaires.seuilBlessureCritique,
        seuilBlessureGrave: defenseur.system.caracSecondaires.seuilBlessureGrave
    };

    if(typeDef == "esquive") {
        titrePersonnalise = game.i18n.localize("agone.actors.jetEsquive");
        defenseurData.potDefense = caracData.rangCarac + compData.rangComp + caracData.bonusAspect;
    }
    else if(typeDef == "defenseNat") {
        titrePersonnalise = game.i18n.localize("agone.actors.jetDefenseNat");
        defenseurData.potDefense = caracData.rangCarac + caracData.bonusAspect;
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

    let result = await jetCompetence({
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

    if(result == null) return;

    const rollResult = result[0];
    const dices = result[1];

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
    
    if(defenseur.estAttaquer()) {
        rollStats.infosAttaque = defenseur.getInfosAttaque();
        let diffTaiMR = defenseur.calcDiffTaiMR(rollStats.infosAttaque.taiAttaquant);
        rollStats.marge = rollResult.total - rollStats.infosAttaque.resultatJet - rollStats.infosAttaque.bonusDommages;

        if(rollStats.marge + diffTaiMR <= 0) {
            rollStats.attaqueTouche = true;
            rollStats.dommagesRecus = (rollStats.marge * -1) - defenseur.getProtectionArmure();

            if(rollStats.dommagesRecus > defenseurData.seuilBlessureCritique) {
                rollStats.blessureCritique = true;
                let lienTableCritique = getTableCritique(rollStats.infosAttaque.typeArme);
                if(lienTableCritique) {
                    rollStats.lienTableCritique = lienTableCritique;
                }
            }
            else if (rollStats.dommagesRecus > defenseurData.seuilBlessureGrave) {
                rollStats.blessureGrave = true;
            }
        }
    }

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("epreuves", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    const messageTemplate = "systems/agone/templates/partials/dice/jet-competence.hbs";

    let templateContext = {
        stats: rollStats,
        dices: dices
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
        await suggestCritChatMessage(defenseur, suggestCritData);
    }

    defenseur.setDefense(typeDef == "defenseNat" ? false : true, rollResult.total);
    // Retirer les dommages aux PV, et appliquer les blessures graves
    if(rollStats.dommagesRecus) {
        defenseur.subirDommages(rollStats.dommagesRecus);
    }

    if(rollStats.blessureGrave) {
        defenseur.subirBlessureGrave();
    }
}

/* -----------------------------------------------------
--- Détermination de la table des dommages critiques ---
----------------------------------------------------- */
function getTableCritique(typeArme) {
    switch(typeArme) {
        case "perforante":
        case "perftranch":
            return game.settings.get("agone","lienTableCritiquePerforation");
        case "tranchante":
            return game.settings.get("agone","lienTableCritiqueTaille");
        case "contondante":
            return game.settings.get("agone","lienTableCritiqueContusion");
    }
}

/*************** 
 *** EMPRISE ***
***************/

/* ------------------------------------------------------------------
--- Jet de sort d'Emprise, avec affichage du message dans le chat ---
------------------------------------------------------------------ */
export async function sortEmprise(mage, danseur, sort, isIntuitif = false) {
    let statsEmprise = mage.getStatsEmprise();

    // Pas de jet de sort si le Danseur n'a plus d'endurance
    if(danseur.system.endurance.value <= 0) {
        ui.notifications.warn(`${danseur.name} ${game.i18n.localize("agone.notifications.warnDanseurEpuise")}`);
        return;
    }

    let potEmprise;
    // Le sort est défini (magie non intuitive)
    if(!isIntuitif) {
        // Ajout sur le sort des données pour gérer le cas des sorts d'une obédience différente de celle du Mage
        sort.system.diffObedience = false;
        sort.system.seuilTotal = sort.system.seuil;

        if(sort.system.resonance != statsEmprise.resonance) {
            sort.system.diffObedience = true;
            sort.system.seuilTotal += 5;
        }

        potEmprise = statsEmprise.emprise + Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs) + statsEmprise.bonusEsprit + danseur.system.bonusEmprise; 
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
        nomDanseur: danseur.name
    };

    let sortData = {
        nomSort: isIntuitif ? game.i18n.localize("agone.items.sortIntuitif") : sort.name,
        seuil: isIntuitif ? 0 : sort.system.seuil,
        seuilTotal: isIntuitif ? 0 : sort.system.seuilTotal,
        diffObedience: isIntuitif ? false : sort.system.diffObedience,
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
            sort.system.seuilTotal = sort.system.diffObedience == true ? sort.system.seuil * 2 + 5 : (sort.system.seuil * 2);
        }
    }

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let result = await jetCompetence({
        actor: mage,
        rangComp:  isIntuitif ? Math.min(statsEmprise.rangResonance, danseur.system.empathie) : Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs),
        jetDefautInterdit: true,
        rangCarac: isIntuitif ? statsEmprise.creativite : statsEmprise.emprise,
        bonusAspect: isIntuitif ? statsEmprise.bonusAme : statsEmprise.bonusEsprit,
        bonusEmprise: isIntuitif ? null : danseur.system.bonusEmprise,
        danseurInvisible: dialogOptions.danseurInvisible,
        mouvImperceptibles: dialogOptions.mouvImperceptibles,
        utiliseHeroisme: dialogOptions.utiliseHeroisme,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        afficherDialog: false,
        envoiMessage: false
    });

    // Si le jet de compétence est annulé, on arrête le jet de sort (ex: compétence par défaut non autorisée)
    if(result == null) return;

    const rollResult = result[0];
    const dices = result[1];

    // On baisse l'endurance du danseur d'un point
    let valEndurance = danseur.system.endurance.value -1;
    danseur.update({"system.endurance.value": valEndurance});

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        specialisation: statsEmprise.specialisation,
        labelSpecialisation: statsEmprise.labelSpecialisation,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        difficulte: isIntuitif ? seuilTotalIntuitif : sort.system.seuilTotal,
        isIntuitif: isIntuitif
    }

    rollStats.marge = isIntuitif ? rollResult.total - seuilTotalIntuitif : rollResult.total - sort.system.seuilTotal;
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

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        dices: dices,
        mage: mageData,
        danseur: danseurData,
        sort:  isIntuitif ? null : sort
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
        await suggestCritChatMessage(mage, suggestCritData);
    }
}

/* ------------------------------------------------------------------------------
--- Fonction de construction de la boite de dialogue de jet de sort d'Emprise ---
------------------------------------------------------------------------------ */
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

/* ---------------------------------------------------------------------------------------
--- Gestion des données renseignées dans la boite de dialogue de jet de sort d'Emprise ---
--------------------------------------------------------------------------------------- */
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

/* -----------------------------------------------------------------
--- Jet de Contre-magie, avec affichage du messsage dans la chat ---
----------------------------------------------------------------- */
export async function contreMagie(mage, danseur, utiliseHeroisme) {
    let statsEmprise = mage.getStatsEmprise();

    // Construction des strutures de données pour l'affichage du message
    let mageData = {
        potEmprise: statsEmprise.emprise + Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs) + statsEmprise.bonusEsprit + danseur.system.bonusEmprise,
        resonance: statsEmprise.resonance
    };

    let danseurData = {
        nomDanseur: danseur.name
    };

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let result = await jetCompetence({
        actor: mage,
        rangComp:  Math.min(statsEmprise.rangResonance, statsEmprise.connDanseurs),
        jetDefautInterdit: true,
        rangCarac: statsEmprise.emprise,
        bonusAspect: statsEmprise.bonusEsprit,
        bonusEmprise: danseur.system.bonusEmprise,
        utiliseHeroisme: utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    if(result == null) return;

    const rollResult = result[0];
    const dices = result[1];

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

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        dices: dices,
        mage: mageData,
        danseur: danseurData
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
        await suggestCritChatMessage(mage, suggestCritData);
    }
}

/********************* 
 *** ARTS MAGIQUES ***
*********************/

/* ---------------------------------------------------------------------------
--- Jet d'une oeuvre d'Art magique, avec affichage du message dans le chat ---
--------------------------------------------------------------------------- */
export async function oeuvre(artiste, oeuvre, artMagiqueImpro = null, isArtImpro = false) {
    let artMagique = isArtImpro ? artMagiqueImpro : oeuvre.system.artMagique;
    let statsArtMagique;
    let potArtMagique;

    if(isArtImpro) {
        statsArtMagique = artiste.getStatsArtMagique(artMagique);
        potArtMagique = statsArtMagique.creativite + Math.min(statsArtMagique.rangArtMagique, statsArtMagique.rangCompetence) + statsArtMagique.bonusAme;
    }
    else {
        if(oeuvre.system.artMagique == "accord") {
            statsArtMagique = artiste.getStatsArtMagique(artMagique, oeuvre.system.instrument);
            
        }
        else {
            statsArtMagique = artiste.getStatsArtMagique(artMagique);
        }
        potArtMagique = statsArtMagique.art + Math.min(statsArtMagique.rangArtMagique, statsArtMagique.rangCompetence) + statsArtMagique.bonusAme;
        oeuvre.system.seuilTotal = oeuvre.system.seuil;
    }
    
    // Construction des strutures de données pour l'affichage de la boite de dialogue
    let artisteData = {
        potArtMagique: potArtMagique,
        specialisation: statsArtMagique.specialisation,
        labelSpecialisation: statsArtMagique.labelSpecialisation
    };

    let oeuvreData = {
        nomOeuvre: isArtImpro ? game.i18n.localize("agone.actors.oeuvreImprovisee") : oeuvre.name,
        seuil: isArtImpro ? 0 : oeuvre.system.seuil,
        artMagique: isArtImpro ? artMagiqueImpro : oeuvre.system.artMagique,
        saison: isArtImpro ? "" : oeuvre.system.saison,
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
            oeuvre.system.seuilTotal = oeuvre.data.data.seuil * 2;
        }
        oeuvre.system.seuilTotal += dialogOptions.margeQualite;
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
    let result = await jetCompetence({
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

    if(result == null) return;
    
    const rollResult = result[0];
    const dices = result[1];

    // Si le jet de compétence est annulé, on arrête le jet d'art magique (ex: compétence par défaut non autorisée)
    if(rollResult == null) return;

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        labelSpecialisation: statsArtMagique.labelSpecialisation,
        difficulte: isArtImpro ? seuilTotalImpro : oeuvre.system.seuilTotal,
        qualite: qualite,
        isArtImpro: isArtImpro
    }

    rollStats.marge = isArtImpro ? rollResult.total - seuilTotalImpro : rollResult.total - oeuvre.system.seuilTotal;
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

            // Ajout du dé dans le pool
            var diceRes = [];
            rollResistance.dice[0].results.forEach( res => {
                let classes = "die d10"; 
                if (res.result == 10) { classes += " max"; }
                diceRes.push({ classes: classes, result : res.result});
            });

            rollStats.resistDices = diceRes;
            rollStats.resistTotal = rollResistance.total;
        }
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-oeuvre.hbs";

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        dices: dices,
        artiste: artisteData,
        oeuvre: isArtImpro ? null : oeuvre
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
        await suggestCritChatMessage(artiste, suggestCritData);
    }
}

/* -------------------------------------------------------------------------
--- Fonction de construction de la boite de dialogue de jet d'une oeuvre ---
------------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------------------------------
--- Gestion des données renseignées dans la boite de dialogue de jet d'oeuvre d'art magique ---
-------------------------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------
--- Jet de désaccord, avec affichage du message dans le chat ---
------------------------------------------------------------- */
export async function desaccord(artiste, instrument, utiliseHeroisme) {
    
    let statsAccord = artiste.getStatsArtMagique("accord", instrument);

     // Construction des strutures de données pour l'affichage du message
     let artisteData = {
        potAccord: statsAccord.art + Math.min(statsAccord.rangArtMagique, statsAccord.rangCompetence) + statsAccord.bonusAme,
        instrument: statsAccord.labelCompetence
    };

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let result = await jetCompetence({
        actor: artiste,
        rangComp: Math.min(statsAccord.rangArtMagique, statsAccord.rangCompetence),
        jetDefautInterdit: true,
        rangCarac: statsAccord.art,
        bonusAspect: statsAccord.bonusAme,
        utiliseHeroisme: utiliseHeroisme,
        afficherDialog: false,
        envoiMessage: false
    });

    if(result == null) return;

    const rollResult = result[0];
    const dices = result[1];

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

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        dices: dices,
        artiste: artisteData
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
        await suggestCritChatMessage(artiste, suggestCritData);
    }
}

/* -----------------------------------------------------------------------------------------
--- Renvoi le niveau de qualité d'une oeuvre en fonction du malus que s'impose l'artiste ---
----------------------------------------------------------------------------------------- */
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

/******************* 
 *** CONJURATION ***
*******************/

/* ----------------------------------------------------------------
--- Jet de conjuration, avec affichage du messsage dans la chat ---
---------------------------------------------------------------- */
export async function conjurerDemon(conjurateur) {
    // Construction des strutures de données pour l'affichage de la boite de dialogue
    let conjurateurData = new Object();

    conjurateurData.potConjuration = conjurateur.system.caracSecondaires.noirceur + conjurateur.system.aspects.ame.bonus.valeur + conjurateur.system.familleCompetences.occulte.competences.demonologie.rang;
    conjurateurData.tenebre = conjurateur.system.caracSecondaires.tenebre.valeur;
    conjurateurData.specialisation = conjurateur.system.familleCompetences.occulte.competences.demonologie.specialisation;
    conjurateurData.labelSpecialisation = conjurateur.system.familleCompetences.occulte.competences.demonologie.labelSpecialisation;

    let dialogOptions = await getJetConjurationOptions({conjurateurData: conjurateurData, cfgData: CONFIG.agone});

    // On annule le jet sur les boutons 'Annuler' ou 'Fermeture'
    if(dialogOptions.annule) {
        return;
    }

    console.log(dialogOptions);

    // Récupération des données de la fenêtre de dialogue pour ce jet 
    let seuilDifficulte = 0;
    let cercleDemon = 0;
    switch(dialogOptions.cercleDemonInvoque) {
        case "opalin":
            seuilDifficulte = 10;
            cercleDemon = 1;
            break;        
        case "azurin": 
            seuilDifficulte = 15;
            cercleDemon = 2;
            break;
        case "safran":
            seuilDifficulte = 20;
            cercleDemon = 3;
            break;
        case "carmin":
            seuilDifficulte = 25;
            cercleDemon = 4;
            break;
        case "obsidien":
            seuilDifficulte = 30;
            cercleDemon = 5;
            break;
        default:
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnAucunCercleSelectionne"));
            return;
    }

    let modifJet = 0;
    let gainTenebre = 0;
    
    modifJet += CONFIG.agone.encrageApplique[dialogOptions.encrageApplique].modif;
    
    if (dialogOptions.encrageRapide) {
        modifJet -= 2;
    }
    
    if (dialogOptions.ombresClaires) {
        modifJet -= 1;
    }
    
    if (dialogOptions.ombresProfondes) {
        modifJet += 1;
    }
    
    modifJet += CONFIG.agone.melerSangEncre[dialogOptions.melerSangEncre].modif;
    gainTenebre += CONFIG.agone.melerSangEncre[dialogOptions.melerSangEncre].tenebre;

    if (dialogOptions.conseilDiablotin) {
        modifJet += 2;
        gainTenebre += 5;
    }

    if (dialogOptions.conseilDemon) {
        modifJet += 5;
        gainTenebre += cercleDemon * 2;
    }

    if (dialogOptions.presenceMinotaure) {
        modifJet += 1;
    }
    
    if (dialogOptions.presenceTenebreux) {
        modifJet += 1;
    }
    
    modifJet += dialogOptions.conseilTenebreux;
    gainTenebre += dialogOptions.conseilTenebreux;

    // On lance le jet de dé depuis la fonction de jet de compétence 
    // On récupère le rollResult
    let result = await jetCompetence({
        actor: conjurateur,
        rangComp:  conjurateur.system.familleCompetences.occulte.competences.demonologie.rang,
        jetDefautInterdit: true,
        rangCarac: conjurateur.system.caracSecondaires.noirceur,
        bonusAspect: conjurateur.system.aspects.ame.bonus.valeur,
        modificateurs: modifJet,
        utiliseHeroisme: dialogOptions.utiliseHeroisme,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        afficherDialog: false,
        envoiMessage: false
    });

    if(result == null) return;
    
    const rollResult = result[0];
    const dices = result[1];

    // Si le jet de compétence est annulé, on arrête le jet d'art magique (ex: compétence par défaut non autorisée)
    if(rollResult == null) return;

    // Construction du jeu de données pour alimenter le template
    let rollStats = {
        ...rollResult.data,
        utiliseSpecialisation: dialogOptions.utiliseSpecialisation,
        labelSpecialisation: conjurateur.system.familleCompetences.occulte.competences.demonologie.labelSpecialisation,
        difficulte: seuilDifficulte,
        cercleDemon: cercleDemon
    }

    rollStats.marge = rollResult.total - seuilDifficulte;
    if(rollStats.marge <= -15) {
        rollStats.isEchecCritiqueMarge = true;
        rollStats.valeurCritique = rollStats.valeurCritique ? Math.min(rollStats.valeurCritique, rollStats.marge + 5) : rollStats.marge + 5;
    }

    if(rollStats.valeurCritique) {
        let critInfos = getCritInfos("occulte", rollStats.valeurCritique);
        rollStats.nomCritique = critInfos.nom;
        rollStats.descCritique = critInfos.desc;
    }

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-conjuration.hbs";

    // Assignation des données au template
    let templateContext = {
        stats: rollStats,
        dices: dices,
        conjurateur: conjurateurData
    }

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: conjurateur }),
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
        await suggestCritChatMessage(conjurateur, suggestCritData);
    }
}

/* --------------------------------------------------------------------------
// Fonction de construction de la boite de dialogue de jet de conjuration ---
-------------------------------------------------------------------------- */
async function getJetConjurationOptions({conjurateurData = null, cfgData = null}) {
    // Recupération du template
    const template = "systems/agone/templates/partials/dice/dialog-jet-conjuration.hbs";
    const html = await renderTemplate(template, {conjurateurData: conjurateurData, cfgData: cfgData });

    return new Promise( resolve => {
        const data = {
            title: game.i18n.localize("agone.actors.jetConjuration"),
            content: html,
            buttons: {
                jet: { // Bouton qui lance le jet de dé
                    icon: '<i class="fas fa-dice"></i>',
                    label: game.i18n.localize("agone.common.jet"),
                    callback: html => resolve(_processJetConjurationOptions(html[0].querySelector("form")))
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

/* ------------------------------------------------------------------------------------
--- Gestion des données renseignées dans la boite de dialogue de jet de conjuration ---
------------------------------------------------------------------------------------ */
function _processJetConjurationOptions(form) {
    let utiliseSpecialisation = false;
    if(form.utiliseSpecialisation) {
        utiliseSpecialisation = form.utiliseSpecialisation.checked;
    }

    return {
        cercleDemonInvoque: form.cercleDemonInvoque.value,
        encrageApplique: form.encrageApplique.value,
        encrageRapide: form.encrageRapide.checked,
        ombresClaires: form.ombresClaires.checked,
        ombresProfondes: form.ombresProfondes.checked,
        melerSangEncre: form.melerSangEncre.value,
        conseilDiablotin: form.conseilDiablotin.checked,
        conseilDemon: form.conseilDemon.checked,
        presenceMinotaure: form.presenceMinotaure.checked,
        presenceTenebreux: form.presenceTenebreux.checked,
        conseilTenebreux: parseInt(form.conseilTenebreux.value),
        utiliseHeroisme : form.utiliseHeroisme.checked,
        utiliseSpecialisation : utiliseSpecialisation
    }
}

/*********************
 *** POINTS DE VIE ***
 ********************/

/*--------------------------
--- Jet de points de vie ---
------------------------- */
export async function jetPdv({actor = null} = {}) {
    let rollFormula = "1d10";

    // Détails du pool de dés jetés à afficher dans le chat
    // (class css pour l'affichage et resulat du dé)
    var dices = [];

    // Jet du dé et maj du personnage
    let rollResult = await new Roll(rollFormula, null).roll({async: true});
    actor.setD10Pdv(rollResult.total);

    // Ajout du dé dans le pool
    rollResult.dice[0].results.forEach( res => {
        let classes = "die d10"; 
        if (res.result == 1) { classes += " min"; }
        if (res.result == 10) { classes += " max"; }
        dices.push({ classes: classes, result : res.result});
    });

    // Recupération du template
    const messageTemplate = "systems/agone/templates/partials/dice/jet-pdv.hbs"; 

    // Assignation des données au template
    let templateContext = {
        dices: dices
    }

    // Construction du message
    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL // CONST.CHAT_MESSAGE_STYLES
    }

    // Affichage du message
    ChatMessage.create(chatData);
}

/************************
 *** ECHECS CRITIQUES ***
 ***********************/

 /* ---------------------------------------------------
--- Renvoi le niveau de gravite de l'échec critique ---
--- en fonction du résultat du dé ou de la marge    ---
---------------------------------------------------- */
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

    // Echec critique lors d'un test de caractéristique
    // TODO - Revoir l'affichage des critiques avec des tables dédiées aux caractéristiques
    if(familleComp == "corps") {
        familleComp = "epreuves";
    }
    else if(familleComp == "esprit") {
        familleComp = "savoir";
    }
    else if(familleComp == "ame")  {
        familleComp = "occulte";
    }

    let elem = CONFIG.agone.critInfos[familleComp][gravite];
    critInfos.nom = elem.nom;
    critInfos.desc = elem.description;

    return critInfos;
}

 /* ------------------------------------------------------------------
--- Envoi d'un message à l'EG pour lui proposer une interprétation ---
--- de l'échec critique en fonction de sa gravité                  ---
------------------------------------------------------------------- */
async function suggestCritChatMessage(actor, suggestCritData) {
    let suggestCritOption = game.settings.get("agone","suggestEchecCritEG");

    // Si l'option n'est pas activée, on quitte la fonction
    if(!suggestCritOption) return;

    // TODO trouver une méthode plus propre pour pousser le message au GM sans qu'il soit visible coté joueur
    // Peut-être retravailler le template de blind roll
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