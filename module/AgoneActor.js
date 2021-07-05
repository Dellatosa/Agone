export default class AgoneActor extends Actor {

    prepareData() {
        super.prepareData();
        let data = this.data.data;

        if(this.type != "demon") {

            /* --------------------------------------------------------
            ---- Calculs de caractéristiques et scores secondaires ----
            ---------------------------------------------------------*/

            // Calcul des scores de bonus d'aspects
            if(data.aspects.corps.bonus == null) {
                data.aspects.corps.bonus = {};
            }
            data.aspects.corps.bonus.valeur = data.aspects.corps.positif.valeur - data.aspects.corps.negatif.valeur;

            if(data.aspects.esprit.bonus == null) {
                data.aspects.esprit.bonus = {};
            }
            data.aspects.esprit.bonus.valeur = data.aspects.esprit.positif.valeur - data.aspects.esprit.negatif.valeur;

            if(data.aspects.ame.bonus == null) {
                data.aspects.ame.bonus = {};
            }
            data.aspects.ame.bonus.valeur = data.aspects.ame.positif.valeur - data.aspects.ame.negatif.valeur;

            // Calcul des scores de Flamme, Flamme noire et de points d'heroisme
            data.caracSecondaires.flamme = Math.min(data.aspects.corps.positif.valeur, data.aspects.esprit.positif.valeur, data.aspects.ame.positif.valeur);
            data.caracSecondaires.flammeNoire = Math.min(data.aspects.corps.negatif.valeur, data.aspects.esprit.negatif.valeur, data.aspects.ame.negatif.valeur);
            data.caracSecondaires.heroisme.max = data.caracSecondaires.flamme * 2;
            if(data.caracSecondaires.heroisme.value > data.caracSecondaires.heroisme.max) {
                data.caracSecondaires.heroisme.value = data.caracSecondaires.heroisme.max;
            }

            // Calcul des caractéristiques secondaires
            data.aspects.corps.caracteristiques.melee.valeur = Math.floor((data.aspects.corps.caracteristiques.force.valeur + data.aspects.corps.caracteristiques.agilite.valeur * 2) / 3);
            data.aspects.corps.caracteristiques.tir.valeur = Math.floor((data.aspects.corps.caracteristiques.perception.valeur + data.aspects.corps.caracteristiques.agilite.valeur) / 2);
            data.aspects.ame.caracteristiques.art.valeur = Math.floor((data.aspects.ame.caracteristiques.charisme.valeur + data.aspects.ame.caracteristiques.creativite.valeur) / 2); 
            data.caracSecondaires.noirceur =  Math.floor(data.caracSecondaires.tenebre / 10);

            switch(data.caracSecondaires.resonance) {
                case "jorniste":
                    data.aspects.esprit.caracteristiques.emprise.valeur = data.aspects.esprit.caracteristiques.intelligence.valeur;
                    break;
                case "eclipsiste":
                    data.aspects.esprit.caracteristiques.emprise.valeur = Math.floor((data.aspects.esprit.caracteristiques.intelligence.valeur + data.aspects.esprit.caracteristiques.volonte.valeur) / 2);
                    break;
                case "obscurantiste":
                    data.aspects.esprit.caracteristiques.emprise.valeur = data.aspects.esprit.caracteristiques.volonte.valeur;
                    break;
                default:
                    data.aspects.esprit.caracteristiques.emprise.valeur = 0;
            }


            data.caracSecondaires.seuilBlessureGrave = Math.floor(data.caracSecondaires.pdv.max / 3);
            data.caracSecondaires.seuilBlessureCritique = Math.floor(data.caracSecondaires.pdv.max / 2);
            if(data.caracSecondaires.pdv.value > data.caracSecondaires.pdv.max) {
                data.caracSecondaires.pdv.value = data.caracSecondaires.pdv.max;
            }

            if(data.peuple != "aucun" && data.peuple != "" && data.peuple != null)
            {
                data.caracSecondaires.tai = CONFIG.agone.peuple[data.peuple].tai;
                data.caracSecondaires.mouvement = CONFIG.agone.peuple[data.peuple].mv;
                data.caracSecondaires.chargeMax = (data.aspects.corps.caracteristiques.force.valeur + data.aspects.corps.caracteristiques.resistance.valeur) * CONFIG.agone.peuple[data.peuple].mpoids;
                data.caracSecondaires.demiCharge = Math.floor(data.caracSecondaires.chargeMax / 2);
                data.caracSecondaires.chargeQuotidienne = Math.floor(data.caracSecondaires.chargeMax / 4);
                data.caracSecondaires.bonusDommages = calcBonusDommages(data.aspects.corps.caracteristiques.force.valeur, data.caracSecondaires.tai);
            } else {
                data.caracSecondaires.tai = 0;
                data.caracSecondaires.mouvement = 0;
                data.caracSecondaires.chargeMax = 0;
                data.caracSecondaires.demiCharge = 0;
                data.caracSecondaires.chargeQuotidienne = 0;
                data.caracSecondaires.bonusDommages = 0;
            }


            /* ---------------------------------------------------------
            ---- Récupération des données de traduction en fonction ----
            ---- de la langue sélectionnée                          ----
            ----------------------------------------------------------*/

            // Récupération des traductions pour les caractéristiques
            for (let [key, carac] of Object.entries(data.aspects.corps.caracteristiques)) {
                carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
                carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
            }
        
            for (let [key, carac] of Object.entries(data.aspects.esprit.caracteristiques)) {
                carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
                carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
            }
        
            for (let [key, carac] of Object.entries(data.aspects.ame.caracteristiques)) {
                carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[key]);
                carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[key]);
            }

            // Récupération des traductions pour les aspects
            for (let [key, aspect] of Object.entries(data.aspects)) {
                aspect.positif.label = game.i18n.localize(CONFIG.agone.aspects[key]);
                let keyNoir = key + "N";
                aspect.negatif.label = game.i18n.localize(CONFIG.agone.aspects[keyNoir]);
                let keyBonus = "B" + key;
                aspect.bonus.label = game.i18n.localize(CONFIG.agone.aspects[keyBonus]);
            }

            // Récupération des traductions pour les compétences
            for(let[keyFam, famille] of Object.entries(data.familleCompetences)) {
                famille.label = game.i18n.localize(CONFIG.agone.typesCompetence[keyFam]);
                for(let[keyComp, competence] of Object.entries(famille.competences)) {
                    competence.label = game.i18n.localize(CONFIG.agone.competences[keyComp]);
                    if(competence.domaine == true) {
                        for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                            if(domaine.domPerso == false) domaine.label = game.i18n.localize(CONFIG.agone.competences[keyDom]);
                        }
                    }
                } 
            }
        }
    }

    getCompetences(famille) {
        let data = this.data.data;

        return data.familleCompetences[famille];
    }

    getCompData(famille, competence, domaine) {
        let data = this.data.data;

        let result = {rangComp: 0, labelComp: "ND", specialisation: false, labelSpecialisation: "ND", defCarac: null, jetDefautInterdit: false};

        if(famille == "savoir" || famille == "occulte") {
            result.jetDefautInterdit = true;
        }

        if(domaine) {
            const domComp = data.familleCompetences[famille].competences[competence].domaines[domaine];
            result.rangComp = domComp.rang;
            result.labelComp = domComp.label;
            result.specialisation = domComp.specialisation;
            result.labelSpecialisation = domComp.labelSpecialisation;
            if(domComp.caracteristique != "") { result.defCarac = domComp.caracteristique; }

        }
        else {
            const comp = data.familleCompetences[famille].competences[competence];
            result.rangComp = comp.rang;
            result.labelComp = comp.label;
            result.specialisation = comp.specialisation;
            result.labelSpecialisation = comp.labelSpecialisation;
            if(comp.caracteristique != "") { result.defCarac = comp.caracteristique; }
        }

        return result;
    }

    getCaracData(caracteristique) {
        let data = this.data.data;
        let result = {rangCarac: 0, labelCarac: "ND", bonusAspect: 0, labelAspect: "ND"}

        if(caracteristique) {
            let aspect = this.getAspect(caracteristique);

            result.bonusAspect = data.aspects[aspect].bonus.valeur;
            result.labelAspect = data.aspects[aspect].bonus.label;
            result.rangCarac = data.aspects[aspect].caracteristiques[caracteristique].valeur;
            result.labelCarac = data.aspects[aspect].caracteristiques[caracteristique].label;
            
            return result;
        }

        return result;
    }

    getAspect(caracteristique) {
        let data = this.data.data;

        if(data.aspects.corps.caracteristiques.hasOwnProperty(caracteristique)) {
            return "corps";
        }
        else if (data.aspects.esprit.caracteristiques.hasOwnProperty(caracteristique)) {
            return "esprit";
        }
        else if (data.aspects.ame.caracteristiques.hasOwnProperty(caracteristique)) {
            return "ame";
        }

        return null;
    }

    getStatsCombat(compArme, minForce, minAgilite) {
        let data = this.data.data;

        if(compArme) {
            let result = {rangComp: 0, labelComp: "ND", specialisation: false, labelSpecialisation: "ND", rangCarac: 0, labelCarac: "ND", bonusAspect: 0, labelAspect: "ND", malusManiement: null};
            result.rangComp = data.familleCompetences.epreuves.competences.armes.domaines[compArme].rang;
            result.labelComp = data.familleCompetences.epreuves.competences.armes.domaines[compArme].label;
            result.specialisation = data.familleCompetences.epreuves.competences.armes.domaines[compArme].specialisation;
            result.labelSpecialisation = data.familleCompetences.epreuves.competences.armes.domaines[compArme].labelSpecialisation;

            let malusAgilite = Math.min(data.aspects.corps.caracteristiques.agilite.valeur - minAgilite, 0);
            let malusForce = Math.min(data.aspects.corps.caracteristiques.force.valeur - minForce, 0);
            if(malusAgilite + malusForce < 0) {
                result.malusManiement = malusAgilite + malusForce;
            }

            let caracData = this.getCaracData(data.familleCompetences.epreuves.competences.armes.domaines[compArme].caracteristique);
            result.rangCarac = caracData.rangCarac;
            result.labelCarac = caracData.labelCarac;
            result.bonusAspect = caracData.bonusAspect;
            result.labelAspect = caracData.labelAspect;

            return result;
        }

        return null;
    }

    getStatsEmprise() {
        let data = this.data.data;

        let result = {emprise: 0, resonance: "ND", specialisation: false, labelSpecialisation: "ND", rangResonance: 0, connDanseurs: 0, bonusEsprit: 0, labelEsprit: "ND"};
        result.emprise = data.aspects.esprit.caracteristiques.emprise.valeur;
        result.resonance = data.caracSecondaires.resonance;
        result.rangResonance = data.familleCompetences.occulte.competences.resonance.domaines[data.caracSecondaires.resonance].rang;
        result.specialisation = data.familleCompetences.occulte.competences.resonance.domaines[data.caracSecondaires.resonance].specialisation;
        result.labelSpecialisation = data.familleCompetences.occulte.competences.resonance.domaines[data.caracSecondaires.resonance].labelSpecialisation;
        result.connDanseurs = data.familleCompetences.occulte.competences.connDanseurs.rang;
        result.bonusEsprit = data.aspects.esprit.bonus.valeur;
        result.labelEsprit = data.aspects.esprit.bonus.label;

        return result;
    }

    getMalusArmure(carac) {
        let malusArmure = 0;
        let armuresEquip = this.data.items.filter(function (item) { return item.type == "Armure" && item.data.data.equipee == true});
        armuresEquip.forEach( armure => {
            if(carac == "agilite")
                malusArmure += armure.data.data.malus;
            else if (carac == "perception")
                malusArmure += armure.data.data.malusPerception;
        });
        
        if(malusArmure < 0) 
            return malusArmure;
        else
        return null;
    }

    getDanseurs() {
        return this.data.items.filter(function (item) { return item.type == "Danseur"});
    }

    depenserHeroisme() {
        let data = this.data.data;

        if(data.caracSecondaires.heroisme.value > 0) {
            let nouvelleVal = data.caracSecondaires.heroisme.value -1;
            this.update({"data.caracSecondaires.heroisme.value": nouvelleVal});
            return true;
        }
        else {
            return false;
        }
    }

    updateFamilleComps(famille, listeComps) {
        this.update({[`data.familleCompetences.${famille}`]: listeComps});
    }

    desequipeArmes(itemId, equipee) {
        if(equipee == "") return;

        if(equipee == "2mains") {
            let autresArmesEquip = this.data.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && item.data.data.equipee != ""});
            autresArmesEquip.forEach(arme => {
                console.log(arme);
                arme.update({"data.equipee": ""});
            });
        }

        if(equipee == "1main") {
            let autresArmesEquip = this.data.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && item.data.data.style != "bouclier" && item.data.data.equipee != ""});
            autresArmesEquip.forEach(arme => {
                console.log(arme);
                arme.update({"data.equipee": ""});
            });
        }

        if(equipee == "secMain") {
            let autresArmesEquip = this.data.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && item.data.data.equipee == "2mains"});
            autresArmesEquip.forEach(arme => {
                console.log(arme);
                arme.update({"data.equipee": ""});
            });
        }
    }

    rollInitiativePerso(arme = null) {
        // Données de base : AGI + PER + Bonus de Corps
        let initFormula = "1d10 + @aspects.corps.caracteristiques.agilite.valeur + @aspects.corps.caracteristiques.perception.valeur + @aspects.corps.bonus.valeur";
        
        // Malus d'armure
        let malusArmure = this.getMalusArmure("agilite");
        if(malusArmure) {
            initFormula += ` + ${malusArmure}`;
        }

        // Bonus de l'arme
        if(arme) {
            if(arme.data.data.modifInit) {
                if(arme.data.data.modifInit != 0)
                {
                    initFormula += ` + ${arme.data.data.modifInit}`;
                }
            }
        }

        let combattantTrouve = false;
        if(game.combat) {
            game.combat.combatants.forEach(elem => {
                if(elem.actor.id == this.id) {
                    this.rollInitiative({initiativeOptions: {formula: initFormula}});
                    combattantTrouve = true;
                }
            });
        }
        
        if(!combattantTrouve) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnInitSansCombat"));
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