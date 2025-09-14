export default class AgoneActor extends Actor {

    prepareData() {
        super.prepareData();
        let data = this.system;

        if(this.type != "Demon") {

            /* --------------------------------------------------------
            ---- Calculs de caractéristiques et scores secondaires ----
            ---------------------------------------------------------*/

            // Peuple par défaut
            if(!data.peuple) {
                data.peuple = "humain";
            }

            // Calcul des valeurs d'aspects
            for (let [keyA, aspect] of Object.entries(data.aspects)) {
                // Base de 1 en positif pour les Inspirés
                if(this.type == "Personnage") { aspect.positif.base = 1; }

                // Calcul des aspects
                aspect.positif.valeur = aspect.positif.base + aspect.positif.pc + aspect.positif.exp + aspect.positif.avgDef;
                aspect.positif.coutExp = (aspect.positif.base + aspect.positif.pc + aspect.positif.exp + 1) * 7;
                aspect.negatif.valeur = aspect.negatif.base + aspect.negatif.pc + aspect.negatif.exp + aspect.negatif.avgDef;

                // Calcul du bonus
                if(aspect.bonus == null) {
                    aspect.bonus = {};
                }
                if(this.type == "Personnage") {
                    aspect.bonus.valeur = aspect.positif.valeur - aspect.negatif.valeur;
                }
                else if(this.type == "Damne") {
                    aspect.bonus.valeur = aspect.negatif.valeur - aspect.positif.valeur;
                }
                else {
                    aspect.bonus.valeur = 0;
                }

                // Calcul des caractéristiques primaires
                for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                    if(!carac.secondaire) { carac.valeur = carac.pc + carac.avgDef + carac.exp; }
                }
            }

            // Calcul des scores de Flamme, Flamme noire et de points d'heroisme
            if(this.type == "Personnage" || this.type == "Damne") {
                data.caracSecondaires.flamme = Math.min(data.aspects.corps.positif.valeur, data.aspects.esprit.positif.valeur, data.aspects.ame.positif.valeur);
                data.caracSecondaires.flammeNoire = Math.min(data.aspects.corps.negatif.valeur, data.aspects.esprit.negatif.valeur, data.aspects.ame.negatif.valeur);
                
                if(this.type == "Personnage") {
                    data.caracSecondaires.heroisme.max = data.caracSecondaires.flamme * 2;
                }
                else if(this.type == "Damne") { 
                    data.caracSecondaires.heroisme.max = data.caracSecondaires.flammeNoire * 2;
                }

                if(data.caracSecondaires.heroisme.value > data.caracSecondaires.heroisme.max) {
                    data.caracSecondaires.heroisme.value = data.caracSecondaires.heroisme.max;
                }
            } 
            else {
                data.caracSecondaires.flamme = 0;
                data.caracSecondaires.flammeNoire = 0;
                data.caracSecondaires.heroisme.max = 0;
            }

            // Calcul des scores de Ténèbre, Perfidie et Noirceur
            data.caracSecondaires.tenebre.valeur = data.caracSecondaires.tenebre.gain + data.caracSecondaires.tenebre.avgDef;
            data.caracSecondaires.perfidie.valeur = data.caracSecondaires.perfidie.gain + data.caracSecondaires.perfidie.avgDef;
            data.caracSecondaires.noirceur = Math.floor(data.caracSecondaires.tenebre.valeur / 10);

            // Calcul des caractéristiques et competences liées au peuple
            if(data.peuple != "aucun" && data.peuple != "" && data.peuple != null)
            {
                data.caracSecondaires.tai.valeur = CONFIG.agone.peuple[data.peuple].tai + data.caracSecondaires.tai.avgDef;
                data.caracSecondaires.mouvement.valeur = CONFIG.agone.peuple[data.peuple].mv + data.caracSecondaires.mouvement.avgDef;
                data.caracSecondaires.chargeMax = (data.aspects.corps.caracteristiques.force.valeur + data.aspects.corps.caracteristiques.resistance.valeur) * CONFIG.agone.peuple[data.peuple].mpoids;
                data.caracSecondaires.demiCharge = Math.floor(data.caracSecondaires.chargeMax / 2);
                data.caracSecondaires.chargeQuotidienne = Math.floor(data.caracSecondaires.chargeMax / 4);
                data.caracSecondaires.bonusDommages = this.calcBonusDommages(data.aspects.corps.caracteristiques.force.valeur, data.caracSecondaires.tai.valeur);
                data.caracSecondaires.pdv.bpdv = CONFIG.agone.peuple[data.peuple].bpdv;

                // Caractéristiques primaires
                for (let [keyA, aspect] of Object.entries(data.aspects)) {
                    for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                        if(!carac.secondaire) {
                            //Cout en experience du niveau suivant
                            carac.coutExp = (carac.pc + carac.exp + 1) * 5;
                            
                            // Modificateurs de peuple des caractéristiques primaires
                            if(CONFIG.agone.peuple[data.peuple].caracs[keyC]) {
                                carac.valeur += CONFIG.agone.peuple[data.peuple].caracs[keyC].mod;
                                if(CONFIG.agone.peuple[data.peuple].caracs[keyC].min > 0) {
                                    if(carac.pc < CONFIG.agone.peuple[data.peuple].caracs[keyC].min) {
                                        carac.peupleMin = true;
                                    }
                                }
                                if(CONFIG.agone.peuple[data.peuple].caracs[keyC].max > 0) {
                                    if(carac.pc > CONFIG.agone.peuple[data.peuple].caracs[keyC].max) {
                                        carac.peupleMax = true;
                                    }
                                }
                            }
                        }
                    }
                }

                // Nb de points de création selon le peuple
                if(this.type == "Personnage") {
                    data.pcCaracs.base = data.peuple == "humain" ? 80 : 70;
                    data.pcCompetences.base = data.peuple == "humain" ? 120 + data.pcCompetences.avgDef : 100 + data.pcCompetences.avgDef;
                }
            } else {
                data.caracSecondaires.tai.valeur = 0 + data.caracSecondaires.tai.avgDef;
                data.caracSecondaires.mouvement.valeur = 0 + data.caracSecondaires.mouvement.avgDef;
                data.caracSecondaires.chargeMax = 0;
                data.caracSecondaires.demiCharge = 0;
                data.caracSecondaires.chargeQuotidienne = 0;
                data.caracSecondaires.bonusDommages = 0;
                data.caracSecondaires.pdv.bpdv = 0;
                if(this.type == "Personnage") {
                    data.pcCaracs.base = 0;
                    data.pcCompetences.base = 0 + data.pcCompetences.avgDef;
                }
            }

            // Calcul des caractéristiques secondaires
            data.aspects.corps.caracteristiques.melee.valeur = Math.floor((data.aspects.corps.caracteristiques.force.valeur + data.aspects.corps.caracteristiques.agilite.valeur * 2) / 3) + data.aspects.corps.caracteristiques.melee.avgDef;
            data.aspects.corps.caracteristiques.tir.valeur = Math.floor((data.aspects.corps.caracteristiques.perception.valeur + data.aspects.corps.caracteristiques.agilite.valeur) / 2) + data.aspects.corps.caracteristiques.tir.avgDef;
            data.aspects.ame.caracteristiques.art.valeur = Math.floor((data.aspects.ame.caracteristiques.charisme.valeur + data.aspects.ame.caracteristiques.creativite.valeur) / 2) + data.aspects.ame.caracteristiques.art.avgDef; 

            switch(data.caracSecondaires.resonance) {
                case "jorniste":
                    data.aspects.esprit.caracteristiques.emprise.valeur = data.aspects.esprit.caracteristiques.intelligence.valeur + data.aspects.esprit.caracteristiques.emprise.avgDef;
                    break;
                case "eclipsiste":
                    data.aspects.esprit.caracteristiques.emprise.valeur = Math.floor((data.aspects.esprit.caracteristiques.intelligence.valeur + data.aspects.esprit.caracteristiques.volonte.valeur) / 2) + data.aspects.esprit.caracteristiques.emprise.avgDef;
                    break;
                case "obscurantiste":
                    data.aspects.esprit.caracteristiques.emprise.valeur = data.aspects.esprit.caracteristiques.volonte.valeur + data.aspects.esprit.caracteristiques.emprise.avgDef;
                    break;
                default:
                    data.aspects.esprit.caracteristiques.emprise.valeur = 0;
            }

            // Calcul du nombre de points de vie max et des seuils de blessure
            data.caracSecondaires.pdv.max = data.caracSecondaires.pdv.bpdv + data.aspects.corps.caracteristiques.resistance.valeur * 3 + data.caracSecondaires.pdv.d10 + (data.caracSecondaires.pdv.pc ? data.caracSecondaires.pdv.pc : 0);
            data.caracSecondaires.seuilBlessureGrave = Math.floor(data.caracSecondaires.pdv.max / 3);
            data.caracSecondaires.seuilBlessureCritique = Math.floor(data.caracSecondaires.pdv.max / 2);
            if(data.caracSecondaires.pdv.value > data.caracSecondaires.pdv.max) {
                data.caracSecondaires.pdv.value = data.caracSecondaires.pdv.max;
            }

            data.caracSecondaires.malusBlessures = this.getMalusBlessureGrave(data.caracSecondaires.nbBlessureGrave);

            if(game.settings.get("agone", "gestionCharge")) {
                data.caracSecondaires.malusCharge = this.calcMalusCharge();
            }
            else {
                data.caracSecondaires.malusCharge = 0;
            }

            /* ---------------------------------------------------------
            ---- Récupération des données de traduction des aspects ----
            ---- et caractéristiques de la langue sélectionnée      ----
            ----------------------------------------------------------*/

            // Récupération des traductions pour les aspects
            for (let [keyA, aspect] of Object.entries(data.aspects)) {
                aspect.positif.label = game.i18n.localize(CONFIG.agone.aspects[keyA]);
                let keyNoir = keyA + "N";
                aspect.negatif.label = game.i18n.localize(CONFIG.agone.aspects[keyNoir]);
                let keyBonus = "B" + keyA;
                aspect.bonus.label = game.i18n.localize(CONFIG.agone.aspects[keyBonus]);

                // Récupération des traductions pour les caractéristiques
                for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                    carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[keyC]);
                    carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[keyC]);
                }
            }
        }
        else { // Demon

            // Récupération des aspects
            for (let [keyA, aspect] of Object.entries(data.aspects)) {

                // Pas de bonus d'aspect pourles démons
                if(aspect.bonus == null) {
                    aspect.bonus = {};
                }
                aspect.bonus.valeur = 0;

                // Modificateurs de cercle des caractéristiques primaires 
                for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                    if(!carac.secondaire) {
                        carac.min = CONFIG.agone.statsDemon[data.cercle].caracMin;
                        carac.max = CONFIG.agone.statsDemon[data.cercle].caracMax;
                    }
                }

                // Calcul des caractéristiques primaires
                for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                    if(!carac.secondaire) { carac.valeur = carac.min + carac.pc; }
                }

                /* -------------------------------------------------
                ---- Récupération des données de traduction des ----
                ---- caractéristiques de la langue sélectionnée ----
                --------------------------------------------------*/

                // Récupération des traductions pour les caractéristiques
                for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                    carac.label = game.i18n.localize(CONFIG.agone.caracteristiques[keyC]);
                    carac.abrev = game.i18n.localize(CONFIG.agone.caracAbrev[keyC]);
                }
            }

            // Modificateurs de cercle des statistiques démoniaques
            data.caracSecondaires.densite.min = CONFIG.agone.statsDemon[data.cercle].densite;
            data.caracSecondaires.opacite.min = CONFIG.agone.statsDemon[data.cercle].opacite;
            data.nivComp.base = CONFIG.agone.statsDemon[data.cercle].niveauComp;

            // Calcul des statistiques (taille, vol)
            data.caracSecondaires.tai.valeur = data.caracSecondaires.tai.min + data.caracSecondaires.tai.pc;
            data.caracSecondaires.vol.valeur = data.caracSecondaires.vol.min + data.caracSecondaires.vol.pc;
            data.caracSecondaires.densite.max = data.caracSecondaires.densite.min + data.caracSecondaires.densite.pc;
            data.caracSecondaires.opacite.valeur = data.caracSecondaires.opacite.min + data.caracSecondaires.opacite.pc;
            if(data.caracSecondaires.densite.value > data.caracSecondaires.densite.max) {
                data.caracSecondaires.densite.value = data.caracSecondaires.densite.max;
            }

            // Calcul des caractéristiques secondaires du Démon
            data.caracSecondaires.mouvement.valeur = this.calcMvDemon(data.caracSecondaires.tai.valeur);
            data.aspects.corps.caracteristiques.melee.valeur = Math.floor((data.aspects.corps.caracteristiques.force.valeur + data.aspects.corps.caracteristiques.agilite.valeur * 2) / 3) + data.aspects.corps.caracteristiques.melee.avgDef;
            data.aspects.corps.caracteristiques.tir.valeur = Math.floor((data.aspects.corps.caracteristiques.perception.valeur + data.aspects.corps.caracteristiques.agilite.valeur) / 2) + data.aspects.corps.caracteristiques.tir.avgDef;
            data.caracSecondaires.chargeMax = (data.aspects.corps.caracteristiques.force.valeur + Math.floor(data.caracSecondaires.densite.max / 5)) * this.calcModPoidsDemon(data.caracSecondaires.tai.valeur);
            data.caracSecondaires.demiCharge = Math.floor(data.caracSecondaires.chargeMax / 2);
            data.caracSecondaires.chargeQuotidienne = Math.floor(data.caracSecondaires.chargeMax / 4);
            data.caracSecondaires.bonusDommages = this.calcBonusDommages(data.aspects.corps.caracteristiques.force.valeur, data.caracSecondaires.tai.valeur);
        }

        
        // Nombre de famille dans lesquelles des points sont dépensées
        let nbFamilleValorisee = 0;

        // Calcul des compétences
        for(let[keyFam, famille] of Object.entries(data.familleCompetences)) {
            // Booleen qui indique si au moins une compétence est valorisée dans la famille
            famille.famValorisee = false;

            for(let[keyComp, competence] of Object.entries(famille.competences)) {
                if(competence.pc > 0 && !competence.speDemon) {famille.famValorisee = true; }
                competence.rang = competence.pc + competence.avgDef + competence.exp;
                competence.coutExp = (competence.pc + competence.exp + 1) * 3;

                if(competence.domaine == true) {
                    for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                        if(domaine.pc > 0 && !competence.speDemon) {famille.famValorisee = true; }
                        domaine.rang = domaine.pc + domaine.avgDef + domaine.exp;
                        domaine.coutExp = (domaine.pc + domaine.exp + 1) * 3;
                    }
                }
            } 

            if(famille.famValorisee) { nbFamilleValorisee += 1; }
        } 

        data.nbFamilleValorisee = nbFamilleValorisee;

        /* -------------------------------------------------------------
        ---- Récupération des données de traduction des compétences ----
        ---- en fonction de la langue sélectionnée                  ----
        --------------------------------------------------------------*/

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
        
        // Competences d'armes connues
        let compArmes = { 
            aucun: "",
            ...data.familleCompetences.epreuves.competences.armes.domaines
        };

        Object.keys(compArmes).forEach(key => {
            if(compArmes[key].label == "") {
                delete compArmes[key];
            }
        })

        data.compArmes = compArmes;
    }

    get isUnlocked() {
        if (this.getFlag(game.system.id, "SheetUnlocked")) return true;
        return false;
    }

    get utilisePcAppel() {
        if (this.getFlag(game.system.id, "SheetUtiliseAppel")) return true;
        return false;
    }

    get modeEditionLibre() {
        if (this.getFlag(game.system.id, "SheetModeEditionLibre")) return true;
        return false;
    }

    get typeRessEdition() {
        const flagdata = this.getFlag(game.system.id, "SheetTypeRessEdition");
        if (flagdata) {
            return flagdata;
        }
        else {
            return "modePc";
        }
        
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

    calcMvDemon(tai) {
        switch(tai) {
            case -2:
                return 1;
            case -1:
                return 2;
            case 0:   
                return 3; 
            case 1:   
                return 4;
            case 2:
                return 6;
            case 3:   
                return 8; 
        }
    }

    calcModPoidsDemon(tai) {
        switch(tai) {
            case -2:
                return 4;
            case -1:
                return 6;
            case 0:   
                return 7; 
            case 1:   
                return 10;
            case 2:
                return 15;
            case 3:   
                return 20; 
        }
    }

    calcDiffTaiMR(taiAttaquant) {
        let data = this.system;

        let diff = taiAttaquant - data.caracSecondaires.tai.valeur;
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
            labelComp: "", 
            specialisation: false, 
            labelSpecialisation: "", 
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
            labelCarac: "", 
            bonusAspect: 0, 
            labelAspect: ""
        };

        if(caracteristique && caracteristique != "aucun") {
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

    get diffJetVieillesse() {
        let diff = this.system.caracSecondaires.diffJetVieillesse;
        return diff ? diff : 0;
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

    /* getStatsCombat(arme) {
        let data = this.system;

        let result = {
            rangComp: 0, 
            labelComp: "", 
            specialisation: false, 
            labelSpecialisation: "", 
            rangCarac: 0, 
            labelCarac: "", 
            bonusAspect: 0, 
            labelAspect: "", 
            bonusDommages: 0,
            tai: 0,
            malusManiement: null, 
            malusBlessureGrave: null,
            seuilBlessureGrave: null,
            seuilBlessureCritique: null
        };

        if(arme.system.competence) {
            result.rangComp = data.familleCompetences.epreuves.competences.armes.domaines[compArme].rang;
            result.labelComp = data.familleCompetences.epreuves.competences.armes.domaines[compArme].label;
            result.specialisation = data.familleCompetences.epreuves.competences.armes.domaines[compArme].specialisation;
            result.labelSpecialisation = data.familleCompetences.epreuves.competences.armes.domaines[compArme].labelSpecialisation;
        }
        else {
            result.rangComp = -3;
            result.labelComp = "Jet par défaut"
        }
        
        result.malusBlessureGrave = this.getMalusBlessureGrave(data.caracSecondaires.nbBlessureGrave);

        result.bonusDommages = data.caracSecondaires.bonusDommages;
        result.tai = data.caracSecondaires.tai.valeur;
        result.seuilBlessureGrave = data.caracSecondaires.seuilBlessureGrave;
        result.seuilBlessureCritique = data.caracSecondaires.seuilBlessureCritique;
            
        let reducMalusAgi = 0;
        let reducMalusFor = 0;
        if(arme.system.style == "melee" && arme.system.equipee == "deuxMains") {
            reducMalusAgi = 1;
            reducMalusFor = 2;
        }

        let malusAgilite = Math.min(data.aspects.corps.caracteristiques.agilite.valeur - arme.system.minAgilite + reducMalusAgi, 0);
        let malusForce = Math.min(data.aspects.corps.caracteristiques.force.valeur - arme.system.minForce + reducMalusFor, 0);
        if(malusAgilite + malusForce < 0) {
            result.malusManiement = malusAgilite + malusForce;
        }

        let carac = "";
        if(arme.system.style == "melee" || arme.system.style == "bouclier") {
            carac = "melee";
        }
        else if(arme.system.style == "trait" || arme.system.style == "jet") {
            carac = "tir";
        }

        result.rangCarac = data.aspects.corps.caracteristiques[carac].valeur;
        result.labelCarac = data.aspects.corps.caracteristiques[carac].label;
        result.bonusAspect = data.aspects.corps.bonus.valeur;
        result.labelAspect = data.aspects.corps.bonus.label;

        return result;
    } 

    getStatsConjuration() {
        let data = this.system;

        let result = {potConjuration: 0, specialisation: false, labelSpecialisation: "ND"};
        result.potConjuration = data.caracSecondaires.noirceur + data.aspects.ame.bonus.valeur + data.familleCompetences.occulte.competences.demonologie.rang;
        result.specialisation = data.familleCompetences.occulte.competences.demonologie.specialisation;
        result.labelSpecialisation = data.familleCompetences.occulte.competences.demonologie.labelSpecialisation;

        return result;
    } */

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

    calcMalusCharge() {
        const equipPortes = this.items.filter(function (item) { return (item.type == "Armure" || item.type == "Arme" || item.type == "Equipement") && item.system.porte == true})
        
        let poidsPorte = 0;
        equipPortes.forEach(equip => {
            poidsPorte += equip.system.poids != null ? equip.system.poids : 0;
        });

        switch(true) {
            case poidsPorte >= this.system.caracSecondaires.chargeMax:
                return -8;
            case poidsPorte >= this.system.caracSecondaires.demiCharge:
                return -4;
            case poidsPorte >= this.system.caracSecondaires.chargeQuotidienne:
                return -2;
            case poidsPorte < this.system.caracSecondaires.chargeQuotidienne:
                return 0;
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
        this.update({"system.caracSecondaires.pdv.d10": valD10});
    }

    gererBonusAspect() {
        return this.type == "Personnage" || this.type == "Damne";
    }

    depenserHeroisme() {
        let data = this.system;

        if(data.caracSecondaires.heroisme.value > 0) {
            let nouvelleVal = data.caracSecondaires.heroisme.value - 1;
            this.update({"system.caracSecondaires.heroisme.value": nouvelleVal});
            return true;
        }
        else {
            return false;
        }
    }

    regenererHeroisme() {
        this.update({"system.caracSecondaires.heroisme.value": this.system.caracSecondaires.heroisme.max});
    }

    subirDommages(nbDommages) {
        let data = this.system;

        let nouvelleVal = data.caracSecondaires.pdv.value - nbDommages;
        this.update({"system.caracSecondaires.pdv.value": nouvelleVal});
    }

    subirBlessureGrave() {
        let data = this.system;

        let nouvelleVal = data.caracSecondaires.nbBlessureGrave + 1;
        this.update({"system.caracSecondaires.nbBlessureGrave": nouvelleVal});
    }

    updateFamilleComps(famille, listeComps) {
        this.update({[`system.familleCompetences.${famille}`]: listeComps});
    }

    desequipeArmes(itemId, equipee) {
        if(equipee == "") return;

        if(equipee == "deuxMains") {
            let autresArmesEquip = this.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && item.system.equipee != ""});
            autresArmesEquip.forEach(arme => {
                arme.update({"system.equipee": ""});
            });
        }

        if(equipee == "mainPri") {
            let autresArmesEquip = this.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && (item.system.equipee == "mainPri" || item.system.equipee == "deuxMains")});
            autresArmesEquip.forEach(arme => {
                arme.update({"system.equipee": ""});
            });
        }

        if(equipee == "mainSec") {
            let autresArmesEquip = this.items.filter(function (item) { return item.type == "Arme" && item.id != itemId && (item.system.equipee == "deuxMains" || item.system.equipee == "mainSec")});
            autresArmesEquip.forEach(arme => {
                arme.update({"system.equipee": ""});
            });
        }
    }

    desequipeArmures(itemId, equipee) {
        if(equipee == true) {
            let autresArmuresEquip = this.items.filter(function (item) { return item.type == "Armure" && item.id != itemId && item.system.equipee == true});
            autresArmuresEquip.forEach(armure => {
                armure.update({"system.equipee": ""});
            });
        }
    }

    getInitiativeFormula(arme) {
        let baseFormula = "1d10 + @aspects.corps.caracteristiques.agilite.valeur + @aspects.corps.caracteristiques.perception.valeur";

        // Aspect Corps pour les Inspirés et Damnés
        if(this.gererBonusAspect()) {
            baseFormula +=  " + @aspects.corps.bonus.valeur";
        }

        // Bonus (ou malus) d'initiative lié aux avantages/défauts
        if(this.system.caracSecondaires.bonusInitiative) {
            baseFormula += ` + ${this.system.caracSecondaires.bonusInitiative}`
        }

         // Malus de blessures
        const malusBlessure = this.getMalusBlessureGrave(this.system.caracSecondaires.nbBlessureGrave);
        if(malusBlessure != 0) {
            baseFormula += ` + ${malusBlessure}`
        }

        if(arme) {
            if(arme == "griffes" && this.system.armesNaturelles.griffes.modifInit != 0) {
               baseFormula += ` + ${this.system.armesNaturelles.griffes.modifInit}`
            }
            else if(arme == "crocs" && this.system.armesNaturelles.crocs.modifInit != 0) {
                baseFormula += ` + ${this.system.armesNaturelles.crocs.modifInit}`
            }
            else if(arme.system.modifInit != 0) {
                baseFormula += ` + ${arme.system.modifInit}`
            }
        }

        return baseFormula;
    }

    /*getInitiativeMod() {
        let modInit = 0;

        // Malus de blessures
        modInit += this.getMalusBlessureGrave(this.system.caracSecondaires.nbBlessureGrave);

        // Bonus (ou malus) d'initiative lié aux avantages/défauts
        if(this.system.caracSecondaires.bonusInitiative) {
            modInit += this.system.caracSecondaires.bonusInitiative;
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
    }*/

    reposDanseurs() {
        this.getDanseurs().forEach(danseur => {
            danseur.update({"system.endurance.value": danseur.system.endurance.max });
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