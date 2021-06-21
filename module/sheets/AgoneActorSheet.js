import * as Dice from "../dice.js";

export default class AgoneActorSheet extends ActorSheet {
     
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 760,
            height: 870,
            classes: ["agone", "sheet", "actor"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" },
                    { navSelector: ".magie-tabs", contentSelector: ".magie-content", initial: "emprise" }]
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

        /* ----------------------------------------------------
        ---- Création des listes d'items filtrées par type ----
        -----------------------------------------------------*/

        data.armes = data.items.filter(function (item) { return item.type == "Arme"});
        data.armures = data.items.filter(function (item) { return item.type == "Armure"});
        data.manoeuvres = data.items.filter(function (item) { return item.type == "Manoeuvre"});

        data.danseurs = data.items.filter(function (item) { return item.type == "Danseur"});
        data.sorts = data.items.filter(function (item) { return item.type == "Sort"});
        data.oeuvres = data.items.filter(function (item) { return item.type == "Oeuvre"});
        data.connivences = data.items.filter(function (item) { return item.type == "Connivence"});

        data.avantages = data.items.filter(function (item) { return item.type == "Avantage"});
        data.defauts = data.items.filter(function (item) { return item.type == "Defaut"});
        data.pouvoirsFlamme = data.items.filter(function (item) { return item.type == "PouvoirFlamme"});
        data.pouvoirsSaison = data.items.filter(function (item) { return item.type == "PouvoirSaison"});

        data.peines = data.items.filter(function (item) { return item.type == "Peine"});
        data.bienfaits = data.items.filter(function (item) { return item.type == "Bienfait"});

        data.listeSorts = Object.assign({}, ...data.sorts.map((x) => ({[x._id]: x.name})));
        
       

        /* ---------------------------------------------------------
        ---- Récupération des données de traduction en fonction ----
        ---- de la langue sélectionnée                          ----
        ----------------------------------------------------------*/

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



        /* ---------------------------------------------------------
        ---- Répartition équilibrée des compétences en fonction ----
        ---- du nombre de colonnes d'affichage sélectionné      ----
        ----------------------------------------------------------*/

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

        //console.log(data);

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
    
        // Tout ce qui suit nécessite que la feuille soit éditable
        if (!this.options.editable) return;

        
        if(this.actor.owner) {
            // roll-carac - jet de caractéritiques
            html.find('.roll-carac').click(this._onRollCarac.bind(this));

            // roll-comp - jet de compétence
            html.find('.roll-comp').click(this._onRollComp.bind(this));

            // item-roll - jet de dés depuis un item
            html.find('.item-roll').click(this._onItemRoll.bind(this));

            // Création d'un item
            html.find('.creer-item').click(this._onCreerItem.bind(this));

            // Edition d'un item
            html.find('.editer-item').click(this._onEditerItem.bind(this));

            // Edition d'un champ d'item directement en ligne (champ Competence)
            html.find('.inline-edit').change(this._onEditerCompArme.bind(this));

            //Suppression d'un item
            html.find('.supprimer-item').click(this._onSupprimerItem.bind(this));
        }
    }

    _onCreerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;
        
        let itemData = {
            name: game.i18n.localize("agone.common.nouveau"),
            type: element.dataset.type,
            img: "icons/svg/mystery-man-black.svg"
        };

        return this.actor.createOwnedItem(itemData);
    }

    _onEditerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);

        item.sheet.render(true);
    }

    _onEditerCompArme(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);
        let field = element.dataset.field;

        return item.update({ [field]: element.value });
    }

    _onSupprimerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;

        return this.actor.deleteOwnedItem(itemId);
    }

    _onItemRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);

        item.roll();
    }

    _onRollComp(event) {
        event.preventDefault();
        const dataset = event.currentTarget.dataset;

        Dice.jetCompetence({
            actorId: this.actor,
            actorData: this.actor.data.data,
            famille: dataset.famille,
            competence: dataset.competence,
            domaine: dataset.domaine,
            caracteristique: dataset.carac
        });
    }

    _onRollCarac(event) {
        event.preventDefault();
        const dataset = event.currentTarget.dataset;

        Dice.jetCaracteristique({
            actorId: this.actor,
            actorData: this.actor.data.data,
            aspect: dataset.aspect,
            caracteristique: dataset.carac
        });
    }

    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
    
        let roll;
        let label;
        if (dataset.roll) {
            
            if(dataset.rolltype == "caracteristique") {
                let aspectRoll;

                if(dataset.aspect) {
                    // Si un aspect est précisé, on récupère du bonus d'aspect
                    aspectRoll = `+@aspects.${dataset.aspect}.bonus.valeur`;
                }

                // Construction de notre roll de base 1d10 explosif + (carac x2) + bonus d'aspect
                let rolldata = aspectRoll ? `${dataset.roll} ${aspectRoll}`: dataset.roll;
                roll = new Roll(`1d10x + ${rolldata}`, this.actor.getRollData());
                roll.roll();

                // Construction du label
                label = dataset.label ? `<b>${dataset.label} x 2</b>` : '';

                // Si le dé donne un résultat de 1, on recontruit un roll avec 1d10 explosif retranché au résultat
                // Le +1 conrrespond au résultat du dé sur le roll initial
                if(roll.dice[0].results[0].result == 1) {
                    roll = new Roll(`(1d10x * -1) + 1 + ${rolldata}`, this.actor.getRollData());
                    roll.roll();
                    // Le jet est un Fumble !
                    label = `${label} <br><b style="color: red">FUMBLE !!!</b>`;
                }

                label = label != '' ? `Jet de caractéristique ${label}` : '';
            }
            else {
                roll = new Roll(dataset.roll, this.actor.getRollData());
                roll.roll();
                label = dataset.label ? `Jet par défaut '${dataset.label}'` : '';
            }
        
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label
            });
        }
    }
}