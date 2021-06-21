export async function jetCompetence({actor = null,
    famille = null,
    competence = null,
    domaine = null,
    caracteristique = null,
    envoiMessage = true} = {}) {
    
    let rollFormula = "1d10x + @rangComp + @rangCarac + @bonusAspect";
    let rollFumbleFormula = "(1d10x * -1) + 1 + @rangComp + @rangCarac + @bonusAspect";

    let competenceData = actor.getCompData(famille, competence, domaine);
    let caracteristiqueData = actor.getCaracData(caracteristique);

    let rollData = {
        rangComp: competenceData.rangComp,
        rangCarac: caracteristiqueData.rangCarac,
        bonusAspect: caracteristiqueData.bonusAspect
    };

    let labelMsg = `Jet de compétence <b>${competenceData.labelComp} + ${caracteristiqueData.labelCarac}</b>`;
    if(competenceData.spe == true) {
        labelMsg = `${labelMsg}<br>Spécialisation <b>${competenceData.labelSpe}</b>`;
    }

    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
        labelMsg = `${labelMsg} <br><b style="color: red">FUMBLE !!!</b>`;
    }

    //console.log(rollResult);

    const messageTemplate = "systems/agone/templates/dice/jet-competence.hbs"; 
    let renderedRoll = await rollResult.render({template: messageTemplate});

    if(envoiMessage) {
        let messageData = {
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: labelMsg,
            content: renderedRoll
        }

        rollResult.toMessage(messageData);
    }
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

    let rollFormula = "1d10x + @rangComp + @rangCarac + @bonusAspect + @modifAttaque";
    let rollFumbleFormula = "(1d10x * -1) + 1 + @rangComp + @rangCarac + @bonusAspect + @modifAttaque";

    let rollData = {
        rangComp: statsAttaque.rangComp,
        rangCarac: statsAttaque.rangCarac,
        bonusAspect: statsAttaque.bonusAspect,
        modifAttaque: arme.data.data.modifAttaque
    };

    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
    }

    const messageTemplate = "systems/agone/templates/dice/jet-arme.hbs";
    let renderedRoll = await rollResult.render();

    let templateContext = {
        arme : arme.data,
        roll: renderedRoll
    }

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