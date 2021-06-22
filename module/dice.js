export async function jetCompetence({actor = null,
    rangComp = null,
    labelComp = null,
    specialisation = null,
    labelSpecialisation = null,
    rangCarac = null,
    labelCarac = null,
    bonusAspect = null,
    labelAspect = null,
    modifAttaque = null,
    modifParade = null,
    envoiMessage = true} = {}) {
    
    let rollFormula = "1d10x + ";
    let rollFumbleFormula = "(1d10x * -1) + 1 + ";
    let baseFormula = "@rangComp + @rangCarac + @bonusAspect";

    let rollData = {
        rangComp: rangComp,
        rangCarac: rangCarac,
        bonusAspect: bonusAspect
    };

    if(modifAttaque) {
        rollData.modifAttaque = modifAttaque;
        baseFormula += " + @modifAttaque"; 
    }

    if(modifParade) {
        rollData.modifParade = modifParade;
        baseFormula += " + @modifParade"; 
    }

    rollFormula += baseFormula;
    rollFumbleFormula += baseFormula;

    let fumble = false;
    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
        fumble = true;
    }

    if(envoiMessage) {
        const messageTemplate = "systems/agone/templates/dice/jet-competence.hbs"; 
        let renderedRoll = await rollResult.render();

        let rollStats = {
            ...rollData,
            labelCarac: labelCarac,
            labelComp: labelComp,
            specialisation: specialisation,
            labelSpecialisation: labelSpecialisation,
            labelAspect: labelAspect,
            isFumble: fumble
        }

        if(modifAttaque) {
            rollStats.labelModifAttaque = game.i18n.localize("agone.arme.modifAttaque");
        }

        if(modifParade) {
            rollStats.labelModifParade = game.i18n.localize("agone.arme.modifParade");
        }

        let templateContext = {
            stats : rollStats,
            roll: renderedRoll
        }

        let chatData = {
            user: game.user._id,
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

export function jetCaracteristique({actor =null, 
    caracteristique = null} = {}) {

    let rollFormula = "1d10x + (@rangCarac * 2) + @bonusAspect";
    let rollFumbleFormula = "(1d10x * -1) + 1 + (@rangCarac * 2) + @bonusAspect";

    let caracteristiqueData = actor.getCaracData(caracteristique);

    let rollData = {
        rangCarac: caracteristiqueData.rangCarac,
        bonusAspect: caracteristiqueData.bonusAspect
    };

    let labelMsg = `Jet de caractéristique <b>${caracteristiqueData.labelCarac} x 2</b>`;

    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
        labelMsg = `${labelMsg} <br><b style="color: red">FUMBLE !!!</b>`;
    }

    let messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: labelMsg
    }

    rollResult.toMessage(messageData);
}

export async function attaque(attaquant, arme) {
    let statsAttaque = attaquant.getStatsAttaque(arme.data.data.competence);

    if(statsAttaque === null) {
        ui.notifications.error(`Impossible de retrouver les statistiques d'attaque pour l'arme ${arme.data.name}.`)
        return;
    }

    let rollResult = await jetCompetence({
        actor: attaquant,
        rangComp: statsAttaque.rangComp,
        labelComp: statsAttaque.labelComp,
        specialisation: statsAttaque.specialisation,
        labelSpecialisation: statsAttaque.labelSpecialisation,
        rangCarac: statsAttaque.rangCarac,
        labelCarac: statsAttaque.labelCarac,
        bonusAspect: statsAttaque.bonusAspect,
        labelAspect: statsAttaque.labelAspect,
        modifAttaque: arme.data.data.modifAttaque,
        envoiMessage: false
        });

    const messageTemplate = "systems/agone/templates/dice/jet-arme.hbs";
    let renderedRoll = await rollResult.render();

    let rollStats = {
        ...statsAttaque
    }

    console.log(rollResult);
    if(rollResult.terms[0] == "-") {
        rollStats.isFumble = true;
    }

    let templateContext = {
        stats : rollStats,
        arme : arme.data,
        roll: renderedRoll
    }

    console.log("Temp Arme", templateContext);

    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: attaquant }),
        roll: rollResult,
        content: await renderTemplate(messageTemplate, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    }

    ChatMessage.create(chatData);
}