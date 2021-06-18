export async function jetCompetence({actorId =null, 
    actorData = null,
    famille = null,
    competence = null,
    domaine = null,
    caracteristique = null} = {}) {
    
    let rollFormula = "1d10x + @rangComp + @rangCarac + @bonusAspect";
    let rollFumbleFormula = "(1d10x * -1) + 1 + @rangComp + @rangCarac + @bonusAspect";

    let rangComp;
    let labelComp;
    let spe;
    let labelSpe;
    if(domaine) {
        rangComp = actorData.familleCompetences[famille].competences[competence].domaines[domaine].rang;
        labelComp = actorData.familleCompetences[famille].competences[competence].domaines[domaine].label;
        spe = actorData.familleCompetences[famille].competences[competence].domaines[domaine].specialisation;
        labelSpe = actorData.familleCompetences[famille].competences[competence].domaines[domaine].labelSpecialisation;
    }
    else {
        rangComp = actorData.familleCompetences[famille].competences[competence].rang;
        labelComp = actorData.familleCompetences[famille].competences[competence].label;
        spe = actorData.familleCompetences[famille].competences[competence].specialisation;
        labelSpe = actorData.familleCompetences[famille].competences[competence].labelSpecialisation;
    }
    
    let aspect;
    if(actorData.aspects.corps.caracteristiques.hasOwnProperty(caracteristique)) {
        aspect = "corps";
    }
    else if (actorData.aspects.esprit.caracteristiques.hasOwnProperty(caracteristique)) {
        aspect = "esprit";
    }
    else if (actorData.aspects.ame.caracteristiques.hasOwnProperty(caracteristique)) {
        aspect = "ame";
    }

    let bonusAspect = actorData.aspects[aspect].bonus.valeur;
    let rangCarac = actorData.aspects[aspect].caracteristiques[caracteristique].valeur;
    let labelCarac = actorData.aspects[aspect].caracteristiques[caracteristique].label;

    let rollData = {
        rangComp: rangComp,
        rangCarac: rangCarac,
        bonusAspect: bonusAspect
    };

    let labelMsg = `Jet de compétence <b>${labelComp} + ${labelCarac}</b>`;
    if(spe == true) {
        labelMsg = `${labelMsg}<br>Spécialisation <b>${labelSpe}</b>`;
    }

    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
        labelMsg = `${labelMsg} <br><b style="color: red">FUMBLE !!!</b>`;
    }

    const messageTemplate = "systems/agone/templates/dice/jet-competence.hbs";
    let renderedRoll = await rollResult.render({template: messageTemplate});

    let messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actorId }),
        flavor: labelMsg,
        content: renderedRoll
    }

    //console.log(rollResult);
    rollResult.toMessage(messageData);
}

export function jetCaracteristique({actorId =null, 
    actorData = null,
    aspect = null,
    caracteristique = null} = {}) {

    let rollFormula = "1d10x + (@rangCarac * 2) + @bonusAspect";
    let rollFumbleFormula = "(1d10x * -1) + 1 + (@rangCarac * 2) + @bonusAspect";

    let bonusAspect = actorData.aspects[aspect].bonus.valeur;
    let rangCarac = actorData.aspects[aspect].caracteristiques[caracteristique].valeur;
    let labelCarac = actorData.aspects[aspect].caracteristiques[caracteristique].label;

    let rollData = {
        rangCarac: rangCarac,
        bonusAspect: bonusAspect
    };

    let labelMsg = `Jet de caractéristique <b>${labelCarac} x 2</b>`;

    let rollResult = new Roll(rollFormula, rollData).roll();
    if(rollResult.dice[0].results[0].result == 1) {
        rollResult = new Roll(rollFumbleFormula, rollData).roll();
        labelMsg = `${labelMsg} <br><b style="color: red">FUMBLE !!!</b>`;
    }

    let messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actorId }),
        flavor: labelMsg
    }

    rollResult.toMessage(messageData);
}