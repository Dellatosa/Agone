export default class AgoneActor extends Actor {

    prepareData() {
        super.prepareData();
        let data = this.system;

        //console.log(this);

        if(this.type != "Demon") {

            /* --------------------------------------------------------
            ---- Calculs de caractéristiques et scores secondaires ----
            ---------------------------------------------------------*/

            // Calcul des scores de bonus d'aspects
            if(this.type == "Personnage") {
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
            }
            else if(this.type == "Damne") {
                if(data.aspects.corps.bonus == null) {
                    data.aspects.corps.bonus = {};
                }
                data.aspects.corps.bonus.valeur = data.aspects.corps.negatif.valeur - data.aspects.corps.positif.valeur;
    
                if(data.aspects.esprit.bonus == null) {
                    data.aspects.esprit.bonus = {};
                }
                data.aspects.esprit.bonus.valeur = data.aspects.esprit.negatif.valeur - data.aspects.esprit.positif.valeur;
    
                if(data.aspects.ame.bonus == null) {
                    data.aspects.ame.bonus = {};
                }
                data.aspects.ame.bonus.valeur = data.aspects.ame.negatif.valeur - data.aspects.ame.positif.valeur;
            }
            else {
                if(data.aspects.corps.bonus == null) {
                    data.aspects.corps.bonus = {};
                }
                data.aspects.corps.bonus.valeur = 0;

                if(data.aspects.esprit.bonus == null) {
                    data.aspects.esprit.bonus = {};
                }
                data.aspects.esprit.bonus.valeur = 0;

                if(data.aspects.ame.bonus == null) {
                    data.aspects.ame.bonus = {};
                }
                data.aspects.ame.bonus.valeur = 0;
            }
            

            // Calcul des scores de Flamme, Flamme noire et de points d'heroisme
            if(this.type == "Personnage" || this.type == "Damne") {
                data.caracSecondaires.flamme = Math.min(data.aspects.corps.positif.valeur, data.aspects.esprit.positif.valeur, data.aspects.ame.positif.valeur);
                data.caracSecondaires.flammeNoire = Math.min(data.aspects.corps.negatif.valeur, data.aspects.esprit.negatif.valeur, data.aspects.ame.negatif.valeur);
                data.caracSecondaires.heroisme.max = data.caracSecondaires.flamme * 2;
                if(data.caracSecondaires.heroisme.value > data.caracSecondaires.heroisme.max) {
                    data.caracSecondaires.heroisme.value = data.caracSecondaires.heroisme.max;
                }
            } 
            else {
                data.caracSecondaires.flamme = 0;
                data.caracSecondaires.flammeNoire = 0;
                data.caracSecondaires.heroisme.max = 0;
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

            // Calcul des caractéristiques liées au peuple
            if(data.peuple != "aucun" && data.peuple != "" && data.peuple != null)
            {
                data.caracSecondaires.tai = CONFIG.agone.peuple[data.peuple].tai;
                data.caracSecondaires.chargeMax = (data.aspects.corps.caracteristiques.force.valeur + data.aspects.corps.caracteristiques.resistance.valeur) * CONFIG.agone.peuple[data.peuple].mpoids;
                data.caracSecondaires.demiCharge = Math.floor(data.caracSecondaires.chargeMax / 2);
                data.caracSecondaires.chargeQuotidienne = Math.floor(data.caracSecondaires.chargeMax / 4);
                data.caracSecondaires.bonusDommages = this.calcBonusDommages(data.aspects.corps.caracteristiques.force.valeur, data.caracSecondaires.tai);
                data.caracSecondaires.pdv.bpdv = CONFIG.agone.peuple[data.peuple].bpdv;
            } else {
                data.caracSecondaires.tai = 0;
                data.caracSecondaires.mouvement = 0;
                data.caracSecondaires.chargeMax = 0;
                data.caracSecondaires.demiCharge = 0;
                data.caracSecondaires.chargeQuotidienne = 0;
                data.caracSecondaires.bonusDommages = 0;
                data.caracSecondaires.pdv.bpdv = 0;
            }

            // Calcul du nombre de points de vie max et des seuils de blessure
            data.caracSecondaires.pdv.max = data.caracSecondaires.pdv.bpdv + data.aspects.corps.caracteristiques.resistance.valeur * 3 + data.caracSecondaires.pdv.d10;
            data.caracSecondaires.seuilBlessureGrave = Math.floor(data.caracSecondaires.pdv.max / 3);
            data.caracSecondaires.seuilBlessureCritique = Math.floor(data.caracSecondaires.pdv.max / 2);
            if(data.caracSecondaires.pdv.value > data.caracSecondaires.pdv.max) {
                data.caracSecondaires.pdv.value = data.caracSecondaires.pdv.max;
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

    get isUnlocked() {
        if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
        return false;
    }
    
    calcBonusDommages(force, tai) {
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

    calcDiffTaiMR(taiAttaquant) {
        let data = this.system;

        let diff = taiAttaquant - data.caracSecondaires.tai;
        return diff * 2;
    }

    getCompetences(famille) {
        let data = this.system;

        return data.familleCompetences[famille];
    }

    getCompData(famille, competence, domaine) {
        let data = this.system;

        let result = {
            rangComp: 0, 
            labelComp: "ND", 
            specialisation: false, 
            labelSpecialisation: "ND", 
            defCarac: null, 
            jetDefautInterdit: false
        };

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
        let data = this.system;
        let result = {
            aspect: "",
            rangCarac: 0, 
            labelCarac: "ND", 
            bonusAspect: 0, 
            labelAspect: "ND"
        };

        if(caracteristique) {
            let aspect = this.getAspect(caracteristique);

            result.aspect = aspect;
            result.bonusAspect = data.aspects[aspect].bonus.valeur;
            result.labelAspect = data.aspects[aspect].bonus.label;
            result.rangCarac = data.aspects[aspect].caracteristiques[caracteristique].valeur;
            result.labelCarac = data.aspects[aspect].caracteristiques[caracteristique].label;
            
            return result;
        }

        return result;
    }

    getAspect(caracteristique) {
        let data = this.system;

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
        let data = this.system;

        if(compArme) {
            let result = {
                rangComp: 0, 
                labelComp: "ND", 
                specialisation: false, 
                labelSpecialisation: "ND", 
                rangCarac: 0, 
                labelCarac: "ND", 
                bonusAspect: 0, 
                labelAspect: "ND", 
                bonusDommages: 0,
                tai: 0,
                malusManiement: null, 
                malusBlessureGrave: null,
                seuilBlessureGrave: null,
                seuilBlessureCritique: null
            };

            result.rangComp = data.familleCompetences.epreuves.competences.armes.domaines[compArme].rang;
            result.labelComp = data.familleCompetences.epreuves.competences.armes.domaines[compArme].label;
            result.specialisation = data.familleCompetences.epreuves.competences.armes.domaines[compArme].specialisation;
            result.labelSpecialisation = data.familleCompetences.epreuves.competences.armes.domaines[compArme].labelSpecialisation;
            result.malusBlessureGrave = this.getMalusBlessureGrave(data.caracSecondaires.nbBlessureGrave);

            result.bonusDommages = data.caracSecondaires.bonusDommages;
            result.tai = data.caracSecondaires.tai;
            result.seuilBlessureGrave = data.caracSecondaires.seuilBlessureGrave;
            result.seuilBlessureCritique = data.caracSecondaires.seuilBlessureCritique;
            
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
        let data = this.system;

        let result = {emprise: 0, creativite: 0, resonance: "ND", specialisation: false, labelSpecialisation: "ND", rangResonance: 0, connDanseurs: 0, bonusEsprit: 0, labelEsprit: "ND", bonusAme: 0, labelAme: "ND", malusBlessureGrave: null};
        result.emprise = data.aspects.esprit.caracteristiques.emprise.valeur;
        result.creativite = data.aspects.ame.caracteristiques.creativite.valeur;
        result.resonance = data.caracSecondaires.resonance;
        result.rangResonance = data.familleCompetences.occulte.competences.resonance.domaines[data.caracSecondaires.resonance].rang;
        result.specialisation = data.familleCompetences.occulte.competences.resonance.domaines[data.caracSecondaires.resonance].specialisation;
        result.labelSpecialisation = data.familleCompetences.occulte.competences.resonance.domaines[data.caracSecondaires.resonance].labelSpecialisation;
        result.connDanseurs = data.familleCompetences.occulte.competences.connDanseurs.rang;
        result.bonusEsprit = data.aspects.esprit.bonus.valeur;
        result.labelEsprit = data.aspects.esprit.bonus.label;
        result.bonusAme = data.aspects.ame.bonus.valeur;
        result.labelAme = data.aspects.ame.bonus.label;
        result.malusBlessureGrave = this.getMalusBlessureGrave(data.caracSecondaires.nbBlessureGrave);

        return result;
    }

    getStatsArtMagique(artMagique, instrument = null) {
        let data = this.system;

        let compId;
        switch(artMagique) {
            case "geste":
                compId = "poesie";
                break;
            case "cyse":
                compId = "sculpture";
                break;
            case "decorum":
                compId = "peinture";
                break;
            case "accord":
                compId = "musique";
                break;
        }

        let domaine;
        if(instrument) {
            domaine = this.getDomaineInstrument(instrument);
        }

        let result = {art: 0, creativite:0, rangArtMagique: 0, labelArtMagique: "", specialisation: false, labelSpecialisation: "ND", rangCompetence: 0, labelCompetence: "ND", bonusAme: 0, labelAme: "ND", malusBlessureGrave: null};
        result.art = data.aspects.ame.caracteristiques.art.valeur;
        result.creativite = data.aspects.ame.caracteristiques.creativite.valeur;
        result.rangArtMagique = data.familleCompetences.occulte.competences.artsMagiques.domaines[artMagique].rang;
        result.labelArtMagique = data.familleCompetences.occulte.competences.artsMagiques.domaines[artMagique].label;
        result.specialisation = data.familleCompetences.occulte.competences.artsMagiques.domaines[artMagique].specialisation;
        result.labelSpecialisation = data.familleCompetences.occulte.competences.artsMagiques.domaines[artMagique].labelSpecialisation;
        if(artMagique != "accord") {
            result.rangCompetence = data.familleCompetences.societe.competences[compId].rang;
            result.labelCompetence = data.familleCompetences.societe.competences[compId].label;
        }
        else if(instrument) {
            const instruments = this.getInstrumentsPratiques();
            console.log(instruments, instrument);
            if(instruments && instruments.some( inst => inst.label == instrument)) {
                result.rangCompetence = data.familleCompetences.societe.competences[compId].domaines[domaine].rang;
                result.labelCompetence = data.familleCompetences.societe.competences[compId].domaines[domaine].label;    
            }
            else {
                result.rangCompetence = null;
                result.labelCompetence = null;
            }
        }
        result.bonusAme = data.aspects.ame.bonus.valeur;
        result.labelAme = data.aspects.ame.bonus.label;
        result.malusBlessureGrave = this.getMalusBlessureGrave(data.caracSecondaires.nbBlessureGrave);

        return result;
    }

    getInstrumentsPratiques() {
        //let nbDomaines = 0;
        let instruments = [];
        let domainesMusique = this.system.familleCompetences.societe.competences.musique.domaines;
        for(let[keyDom, domaine] of Object.entries(domainesMusique)) {
            if(domaine.rang > 0) {
                //nbDomaines += 1;
                instruments.push(domaine);
            }
        }

        if(instruments.length > 0) {
            return instruments;
        }
        else {
            return null;
        }
    }

    getMalusArmure(carac) {
        let malusArmure = 0;
        let armuresEquip = this.items.filter(function (item) { return item.type == "Armure" && item.system.equipee == true});
        armuresEquip.forEach( armure => {
            if(carac == "agilite")
                malusArmure += armure.system.malus;
            else if (carac == "perception")
                malusArmure += armure.system.malusPerception;
        });
        
        if(malusArmure < 0) 
            return malusArmure;
        else
        return null;
    }

    getProtectionArmure() {
        let protectionArmure = 0;
        let armuresEquip = this.items.filter(function (item) { return item.type == "Armure" && item.system.equipee == true});
        armuresEquip.forEach( armure => {
            protectionArmure += armure.system.protection;
        });

        return protectionArmure;
    }

    getMalusBlessureGrave(nbBlessureGrave) {
        switch(nbBlessureGrave) {
            case 0:
                return 0;
            case 1:
                return -2;
            case 2:
                return -6;
            case 3:
                return -12;
        }
    }

    getDomaineInstrument(instrument) {
        let data = this.system;

        for (let [key, domaine] of Object.entries(data.familleCompetences.societe.competences.musique.domaines)) {
            if(domaine.label == instrument) {
                return key;
            }
        } 
    }

    getDanseurs() {
        return this.items.filter(function (item) { return item.type == "Danseur"});
    }

    setD10Pdv(valD10) {
        this.update({"data.caracSecondaires.pdv.d10": valD10});
    }

    gererBonusAspect() {
        return this.type == "Personnage" || this.type == "Damne";
    }

    depenserHeroisme() {
        let data = this.system;

        if(data.caracSecondaires.heroisme.value > 0) {
            let nouvelleVal = data.caracSecondaires.heroisme.value - 1;
            this.update({"data.caracSecondaires.heroisme.value": nouvelleVal});
            return true;
        }
        else {
            return false;
        }
    }

    subirDommages(nbDommages) {
        let data = this.system;

        let nouvelleVal = data.caracSecondaires.pdv.value - nbDommages;
        this.update({"data.caracSecondaires.pdv.value": nouvelleVal});
    }

    subirBlessureGrave() {
        let data = this.system;

        let nouvelleVal = data.caracSecondaires.nbBlessureGrave + 1;
        this.update({"data.caracSecondaires.nbBlessureGrave": nouvelleVal});
    }

    updateFamilleComps(famille, listeComps) {
        this.update({[`data.familleCompetences.${famille}`]: listeComps});
    }

    desequipeArmes(itemId, equipee) {
        if(equipee == "") return;

        if(equipee == "2mains") {
            let autresArmesEquip = this.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && item.system.equipee != ""});
            autresArmesEquip.forEach(arme => {
                arme.update({"data.equipee": ""});
            });
        }

        if(equipee == "1main") {
            let autresArmesEquip = this.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && item.system.style != "bouclier" && item.system.equipee != ""});
            autresArmesEquip.forEach(arme => {
                arme.update({"data.equipee": ""});
            });
        }

        if(equipee == "secMain") {
            let autresArmesEquip = this.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && item.system.equipee == "2mains"});
            autresArmesEquip.forEach(arme => {
                arme.update({"data.equipee": ""});
            });
        }
    }

    getInitiativeMod() {
        let data = this.system;

        let modInit = 0;

        // Malus de blessures
        modInit += this.getMalusBlessureGrave(data.caracSecondaires.nbBlessureGrave);

        // Bonus (ou malus) d'initiative lié aux avantages/défauts
        if(data.caracSecondaires.bonusInitiative) {
            modInit += data.caracSecondaires.bonusInitiative;
        }

        // Malus d'armure
        let malusArmure = this.getMalusArmure("agilite");
        if(malusArmure) {
            modInit += malusArmure;
        }

        // Bonus de l'arme
        // TODO - corriger le calcul pour n'inclure que l'arme utilisée en attaque.
        let armesEquipees = this.items.filter(function (item) { return item.type == "Arme" && item.system.type != "bouclier" && item.system.equipee != ""});
        
        armesEquipees.forEach(armeEq => {
            if(armeEq.system.modifInit) {
                modInit += armeEq.system.modifInit;
            }
        });

        return modInit;
    }

    reposDanseurs() {

        this.getDanseurs().forEach(danseur => {
            danseur.update({"data.endurance.value": danseur.system.endurance.max });
        });
    }

    getCombatant() {
        let combattant = null;

        if(this.isToken) {
            if(this.token.inCombat) {
                combattant = this.token.combatant;
            }
        }
        else {
            if(game.combat) {
                game.combat.combatants.forEach(cbtElem => {
                    if(cbtElem.actor.id == this.id) {
                        combattant = cbtElem;
                    }
                });
            }
        }

        return combattant;
    }

    estCombattantActif() {
        let combattant = this.getCombatant();
        if(combattant) {
            return game.combat.combatant == combattant;
        }

        return false;
    }

    estAttaquer() {
        let combattant = this.getCombatant();

        if(combattant) {
            return combattant.estAttaquer();
        }

        return false;
    }

    getInfosAttaque() {
        let combattant = this.getCombatant();

        if(combattant) {
            return combattant.infosAttaque();
        }

        return null;
    }

    setDefense(utiliserReaction, resultatJet) {
        let combattant = this.getCombatant();

        if(combattant) {
            combattant.setDefenseCombattant(utiliserReaction, resultatJet);
        }    
    }

    reactionUtilisee() {
        let combattant = this.getCombatant();

        if(combattant) {
            return combattant.reactionUtilisee();
        }

        return false;
    }
}