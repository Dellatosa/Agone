export default class AgoneActor extends Actor {

    prepareData() {
        super.prepareData();

        let actorData = this.data;
        let data = actorData.data;

        if(actorData.type != "demon") {

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