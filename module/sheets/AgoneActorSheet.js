export default class AgoneActorSheet extends ActorSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 760,
            height: 870,
            classes: ["agone", "sheet", "actor"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" }]
        });
    }

    get template() {
        console.log(`Agone | chargement du template systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html`);
        return `systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;

        const actorData = data.data;

        console.log(actorData);

        // Calcul des scores de bonus d'aspects
        if(actorData.aspects.corps.bonus == null) {
            actorData.aspects.corps.bonus = {};
        }
        actorData.aspects.corps.bonus.valeur = actorData.aspects.corps.positif.valeur - actorData.aspects.corps.negatif.valeur;

        if(actorData.aspects.esprit.bonus == null) {
            actorData.aspects.esprit.bonus = {};
        }
        actorData.aspects.esprit.bonus.valeur = actorData.aspects.esprit.positif.valeur - actorData.aspects.esprit.negatif.valeur;

        if(actorData.aspects.ame.bonus == null) {
            actorData.aspects.ame.bonus = {};
        }
        actorData.aspects.ame.bonus.valeur = actorData.aspects.ame.positif.valeur - actorData.aspects.ame.negatif.valeur;

        // Calcul des scores de Flamme, Flamme noire et de points d'heroisme
        actorData.caracSecondaires.flamme = Math.min(actorData.aspects.corps.positif.valeur, actorData.aspects.esprit.positif.valeur, actorData.aspects.ame.positif.valeur);
        actorData.caracSecondaires.flammeNoire = Math.min(actorData.aspects.corps.negatif.valeur, actorData.aspects.esprit.negatif.valeur, actorData.aspects.ame.negatif.valeur);
        actorData.caracSecondaires.heroisme.max = actorData.caracSecondaires.flamme * 2;

        // Calcul des caractéristiques secondaires
        actorData.aspects.corps.caracteristiques.melee.valeur = Math.floor((actorData.aspects.corps.caracteristiques.force.valeur + actorData.aspects.corps.caracteristiques.agilite.valeur * 2) / 3);
        actorData.aspects.corps.caracteristiques.tir.valeur = Math.floor((actorData.aspects.corps.caracteristiques.perception.valeur + actorData.aspects.corps.caracteristiques.agilite.valeur) / 2);
        actorData.aspects.esprit.caracteristiques.emprise.valeur = 0;
        actorData.aspects.ame.caracteristiques.art.valeur = Math.floor((actorData.aspects.ame.caracteristiques.charisme.valeur + actorData.aspects.ame.caracteristiques.creativite.valeur) / 2); 

        actorData.caracSecondaires.seuilBlessureGrave = Math.floor(actorData.caracSecondaires.pdv.max / 3);
        actorData.caracSecondaires.seuilBlessureCritique = Math.floor(actorData.caracSecondaires.pdv.max / 2);
        if(actorData.peuple != "aucun" && actorData.peuple != "" && actorData.peuple != null)
        {
            actorData.caracSecondaires.tai = CONFIG.agone.peuple[actorData.peuple].tai;
            actorData.caracSecondaires.mouvement = CONFIG.agone.peuple[actorData.peuple].mv;
            actorData.caracSecondaires.chargeMax = (actorData.aspects.corps.caracteristiques.force.valeur + actorData.aspects.corps.caracteristiques.resistance.valeur) * CONFIG.agone.peuple[actorData.peuple].mpoids;
            actorData.caracSecondaires.demiCharge = Math.floor(actorData.caracSecondaires.chargeMax / 2);
            actorData.caracSecondaires.chargeQuotidienne = Math.floor(actorData.caracSecondaires.chargeMax / 4);
            actorData.caracSecondaires.bonusDommages = calcBonusDommages(actorData.aspects.corps.caracteristiques.force.valeur, actorData.caracSecondaires.tai);
        } else {
            actorData.caracSecondaires.tai = 0;
            actorData.caracSecondaires.mouvement = 0;
            actorData.caracSecondaires.chargeMax = 0;
            actorData.caracSecondaires.demiCharge = 0;
            actorData.caracSecondaires.chargeQuotidienne = 0;
            actorData.caracSecondaires.bonusDommages = 0;
        }
        
        // Récupération des traductions pour les caractéristiques
        for (let [key, carac] of Object.entries(actorData.aspects.corps.caracteristiques)) {
            carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
            carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
        }
        
        for (let [key, carac] of Object.entries(actorData.aspects.esprit.caracteristiques)) {
               carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
            carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
        }
        
        for (let [key, carac] of Object.entries(actorData.aspects.ame.caracteristiques)) {
            carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
            carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
        }

         // Récupération des traductions pour les aspects
         for (let [key, aspect] of Object.entries(actorData.aspects)) {
            aspect.positif.label = game.i18n.localize(CONFIG.agone.aspects[key]);
            let keyNoir = key + "N";
            aspect.negatif.label = game.i18n.localize(CONFIG.agone.aspects[keyNoir]);
            let keyBonus = "B" + key;
            aspect.bonus.label = game.i18n.localize(CONFIG.agone.aspects[keyBonus]);
        }

        // Récupération des traductions pour les compétences
        // Et décompte du nombre de compétences pour les répartir équitablement dans les colonnes
        let nbElemsGridComp = 0;
        for(let[keyFam, famille] of Object.entries(actorData.familleCompetences)) {
            famille.label = game.i18n.localize(CONFIG.agone.typesCompetence[keyFam]);
            nbElemsGridComp += 1;
            
            for(let[keyComp, competence] of Object.entries(famille.competences)) {
                competence.label = game.i18n.localize(CONFIG.agone.competences[keyComp]);
                nbElemsGridComp += 1;
                
                if(competence.domaine == true) {
                    for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                        nbElemsGridComp += 1;
                        if(domaine.domPerso == false) domaine.label = game.i18n.localize(CONFIG.agone.competences[keyDom]);
                    }
                }
            } 
        }

        // Calcul de répartition des compétences dans 4 colonnes
        const nbColonnes = 4;
        var arr = Array(nbColonnes);
        for (let i = 0; i < nbColonnes; i++) {
            arr[i] = i;
        }
        actorData.colonnes = arr;

        const nbCompParColonne = Math.ceil(nbElemsGridComp / nbColonnes);
        let numCompetence = 0;
        for(let[keyFam, famille] of Object.entries(actorData.familleCompetences)) {
            famille.numcol = Math.floor(numCompetence / nbCompParColonne);
            numCompetence += 1;
            
            for(let[keyComp, competence] of Object.entries(famille.competences)) {
                competence.numcol = Math.floor(numCompetence / nbCompParColonne);
                numCompetence += 1;
                
                if(competence.domaine == true) {
                    for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                        domaine.numcol = Math.floor(numCompetence / nbCompParColonne);
                        numCompetence += 1;
                    }
                }
            } 
        }

        console.log(actorData);

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
    
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

         // Rollable.
        html.find('.rollable').click(this._onRoll.bind(this));
    }

    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
    
        let roll;
        let label;
        if (dataset.roll) {
            if(dataset.rolltype == "competence") {
                let caracRoll;
                let labCarac;
                
                // Si une caractéristique est précisée en data, on récupère sa valeur et son label, et son bonus d'aspect
                if(dataset.carac)
                {
                    if(this.actor.getRollData().aspects.corps.caracteristiques.hasOwnProperty(dataset.carac)) {
                        caracRoll = `+@aspects.corps.caracteristiques.${dataset.carac}.valeur +@aspects.corps.bonus.valeur`;
                        labCarac = this.actor.getRollData().aspects.corps.caracteristiques[dataset.carac].label;
                    } else if(this.actor.getRollData().aspects.esprit.caracteristiques.hasOwnProperty(dataset.carac)) {
                        caracRoll = `+@aspects.esprit.caracteristiques.${dataset.carac}.valeur +@aspects.esprit.bonus.valeur`;
                        labCarac = this.actor.getRollData().aspects.esprit.caracteristiques[dataset.carac].label;
                    } else if(this.actor.getRollData().aspects.ame.caracteristiques.hasOwnProperty(dataset.carac)) {
                        caracRoll = `+@aspects.ame.caracteristiques.${dataset.carac}.valeur +@aspects.ame.bonus.valeur`;
                        labCarac = this.actor.getRollData().aspects.ame.caracteristiques[dataset.carac].label;
                    }
                }

                // Contruction de notre roll de base 1d10 explosif + compétence + carac + bonus d'aspect
                let rolldata = caracRoll ? `${dataset.roll} ${caracRoll}`: dataset.roll;
                roll = new Roll(`1d10x + ${rolldata}`, this.actor.getRollData());
                roll.roll();
                
                // Contruction du label
                label = dataset.label ? dataset.label : '';
                label = labCarac ? `<b>${label} + ${labCarac}</b>` : label;

                // Si le dé donne un résultat de 1, on recontruit un roll avec 1d10 explosif retranché au résultat
                // Le +1 conrrespond au résultat du dé sur le roll initial
                if(roll.dice[0].results[0].result == 1) {
                    roll = new Roll(`(1d10x * -1) + 1 + ${rolldata}`, this.actor.getRollData());
                    roll.roll();
                    // Le jet est un Fumble !
                    label = `${label} <br><b style="color: red">FUMBLE !!!</b>`;
                }
                
                label = label != '' ? `Jet de compétence ${label}` : '';
            }
            else if(dataset.rolltype == "caracteristique") {
                let aspectRoll;
                if(dataset.aspect) {
                    // Si un aspect est précisé, on récupère du bonus d'aspect
                    aspectRoll = `+@aspects.${dataset.aspect}.bonus.valeur`;
                }

                // Contruction de notre roll de base 1d10 explosif + (carac x2) + bonus d'aspect
                let rolldata = aspectRoll ? `${dataset.roll} ${aspectRoll}`: dataset.roll;
                roll = new Roll(`1d10x + ${rolldata}`, this.actor.getRollData());
                roll.roll();

                label = dataset.label ? `<b>${dataset.label} x 2</b>` : '';

                // Si le dé donne un résultat de 1, on recontruit un roll avec 1d10 explosif retranché au résultat
                // Le +1 conrrespond au résultat du dé sur le roll initial
                if(roll.dice[0].results[0].result == 1) {
                    roll = new Roll(`(1d10x * -1) + 1 + ${rolldata}`, this.actor.getRollData());
                    roll.roll();
                    // Le jet est un Fumble !
                    label = `${label} <br><b style="color: red">FUMBLE !!!</b>`;
                }
            }
            else {
                roll = new Roll(dataset.roll, this.actor.getRollData());
                roll.roll();
                label = dataset.label ? `Jet '${dataset.label}'` : '';
            }
        
            roll./*roll().*/toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label
            });
        }
    }
}

function calcBonusDommages(force, tai) {
    let total = force + tai;
    switch(total) {
        case -1:
            return -6;
        case 0:   
            return -4; 
        case 1:   
            return -2; 
        case 2:
        case 3:   
            return -1; 
        case 4:
        case 5:
        case 6:   
            return 0; 
        case 7:
        case 8:
            return 1;
        case 9:
            return 2;
        case 10:
            return 4;
        case 11:
            return 6;
        case 12:
            return 8;
        case 13:
            return 10;
        case 14:
            return 12;
        case 15:
            return 15;
        case 16:
            return 18;
        case 17:
            return 21;
        case 18:
            return 24;
        case 19:
            return 27;
        case 20:
            return 31;
        case 21:
            return 35;
        case 22:
            return 39;
        case 23:
            return 43;
             
    }
}