import * as Dice from "../dice.js";
import * as Chat from "../chat.js";

import EditCompFormApplication from "../EditCompFormApplication.js";

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
        if(this.actor.data.type == "Personnage" || this.actor.data.type == "Damne") {
            console.log(`Agone | type : ${this.actor.data.type} | chargement du template systems/agone/templates/sheets/actors/personnage-sheet.html`);
            return `systems/agone/templates/sheets/actors/personnage-sheet.html`
        } 
        else {
            console.log(`Agone | chargement du template systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html`);
            return `systems/agone/templates/sheets/actors/${this.actor.data.type}-sheet.html`
        }
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;
        const actorData = data.data.data;

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



        /* ---------------------------------------------------------
        ---- Répartition équilibrée des compétences en fonction ----
        ---- du nombre de colonnes d'affichage sélectionné      ----
        ----------------------------------------------------------*/

        // Décompte du nombre de compétences pour les répartir équitablement dans les colonnes
        let nbElemsGridComp = 0;
        for(let[keyFam, famille] of Object.entries(actorData.familleCompetences)) {
            nbElemsGridComp += 1;
            for(let[keyComp, competence] of Object.entries(famille.competences)) {
                nbElemsGridComp += 1;
                if(competence.domaine == true) {
                    for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                        nbElemsGridComp += 1;
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

        //console.log(data);

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
    
        // Tout ce qui suit nécessite que la feuille soit éditable
        if (!this.options.editable) return;

        
        if(this.actor.isOwner) {
            // edit-comp - edition des compétences d'une famille
            html.find('.edit-comp').click(this._onEditComp.bind(this));

            // roll-comp - jet de compétence
            html.find('.roll-comp').click(this._onRollComp.bind(this));

            // roll-carac - jet de caractéritiques
            html.find('.roll-carac').click(this._onRollCarac.bind(this));

            // Liste d'items dans la feuille
            // Création d'un item
            html.find('.creer-item').click(this._onCreerItem.bind(this));

            // Edition d'un item
            html.find('.editer-item').click(this._onEditerItem.bind(this));

            //Suppression d'un item
            html.find('.supprimer-item').click(this._onSupprimerItem.bind(this));

            // Edition d'un champ d'item directement en ligne
            html.find('.inline-edit').change(this._onEditerInline.bind(this));

            // Edition d'une checkbox d'item directement en ligne
            html.find('.inline-chk').change(this._onEditerInlineCheck.bind(this));

            // item-roll - jet de dés depuis un item
            html.find('.item-roll').click(this._onItemRoll.bind(this));

            // Boutons de l'onglet Combat
            // Initiative
            html.find('button.initiative').click(this._onInitiativeRoll.bind(this));

            // Esquive
            html.find('button.esquive').click(this._onEsquive.bind(this));

            // Défense naturelle
            html.find('button.defenseNat').click(this._onDefenseNat.bind(this));

            // Resistance magique - profane
            html.find('button.resistMagieNat').click(this._onResistMagieNat.bind(this));

            // Boutons de l'onglet Emprise
            // Reconnaitre un sort
            html.find('button.reconnSort').click(this._onReconnSort.bind(this));

            // Resistance magique
            html.find('button.resistMagie').click(this._onResistMagie.bind(this));

            // Contre-magie
            html.find('button.contreMagie').click(this._onContreMagie.bind(this));

            // Boutons de l'onglet Arts
            // Reconnaitre une oeuvre
            html.find('button.reconnOeuvre').click(this._onReconnOeuvre.bind(this));

            // Désaccord
            html.find('button.desaccord').click(this._onDesaccord.bind(this));
        }
    }

    // Gestionnaire d'événements pour les listes d'items
     // Création d'un item
    _onCreerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;
        
        let itemData = [{
            name: game.i18n.localize("agone.common.nouveau"),
            type: element.dataset.type,
            img: "icons/svg/mystery-man-black.svg"
        }];

        return this.actor.createEmbeddedDocuments("Item", itemData, {parent: this.actor});
    }

    // Edition d'un item
    _onEditerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.sheet.render(true);
    }

    //Suppression d'un item
    _onSupprimerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        
        let content = `<p>${game.i18n.localize("agone.common.objet")} : ${item.data.name}<br>${game.i18n.localize("agone.common.confirmSupprText")}<p>`
        let dlg = Dialog.confirm({
            title: game.i18n.localize("agone.common.confirmSuppr"),
            content: content,
            yes: () => item.delete(),
            //no: () =>, On ne fait rien sur le 'Non'
            defaultYes: false
           });
    }

    // Edition d'un champ d'item directement en ligne
    _onEditerInline(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let field = element.dataset.field;

        return item.update({ [field]: element.value });
    }

    // Edition d'une checkbox d'item directement en ligne
    _onEditerInlineCheck(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        let field = element.dataset.field;

        let dtField = field.split(".");
        let val = !item.data[dtField[0]][dtField[1]];

        return item.update({ [field]: val });
    }

    // item-roll - jet de dés depuis un item
    _onItemRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.roll();
    }

    // edit-comp - edition des compétences d'une famille
    _onEditComp(event) {
        event.preventDefault();
        const dataset = event.currentTarget.dataset;
        const lstComps = this.actor.getCompetences(dataset.famille);

        new EditCompFormApplication(this.actor, dataset.famille, lstComps).render(true);
    }

    // roll-comp - jet de compétence
    _onRollComp(event) {
        event.preventDefault();
        const dataset = event.currentTarget.dataset;

        let caracData = this.actor.getCaracData(dataset.carac);
        let compData = this.actor.getCompData(dataset.famille, dataset.competence, dataset.domaine);

        Dice.jetCompetence({
            actor: this.actor,
            rangComp: compData.rangComp,
            labelComp: compData.labelComp,
            specialisation: compData.specialisation,
            labelSpecialisation: compData.labelSpecialisation,
            jetDefautInterdit: compData.jetDefautInterdit,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect,
            defCarac: compData.defCarac
        });
    }

    // roll-carac - jet de caractéritiques
    _onRollCarac(event) {
        event.preventDefault();
        const dataset = event.currentTarget.dataset;

        let caracData = this.actor.getCaracData(dataset.carac);

        Dice.jetCaracteristique({
            actor: this.actor,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect
        });
    }

    // Gestionnaire d'événements de l'onglet Combat
    // Initiative
    _onInitiativeRoll(event) {
        event.preventDefault();
        
        this.actor.rollInitiativePerso();
    }

    // Esquive
    _onEsquive(event) {
        event.preventDefault();

        let caracData = this.actor.getCaracData("agilite");
        let compData = this.actor.getCompData("epreuves", "esquive", null);

        Dice.jetCompetence({
            actor: this.actor,
            rangComp: compData.rangComp,
            labelComp: compData.labelComp,
            specialisation: compData.specialisation,
            labelSpecialisation: compData.labelSpecialisation,
            jetDefautInterdit: compData.jetDefautInterdit,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect,
            utiliseHeroisme: event.shiftKey,
            titrePersonnalise: game.i18n.localize("agone.actors.jetEsquive"),
            afficherDialog: false
        });
    }

    // Défense naturelle
    _onDefenseNat(event) {
        event.preventDefault();

        let caracData = this.actor.getCaracData("agilite");
        let compData = this.actor.getCompData("epreuves", "esquive", null);

        Dice.jetCompetence({
            actor: this.actor,
            specialisation: compData.specialisation,
            labelSpecialisation: compData.labelSpecialisation,
            jetDefautInterdit: compData.jetDefautInterdit,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect,
            utiliseHeroisme: event.shiftKey,
            titrePersonnalise: game.i18n.localize("agone.actors.jetDefenseNat"),
            afficherDialog: false
        });
    }

    // Resistance magique naturelle -
    _onResistMagieNat(event) {
        event.preventDefault();

        let selectCaracData;
        let caracDataVOL = this.actor.getCaracData("volonte");
        let caracDataCRE = this.actor.getCaracData("creativite");

        if((caracDataVOL.rangCarac * 2 + caracDataVOL.bonusAspect) > (caracDataCRE.rangCarac * 2 + caracDataCRE.bonusAspect)) {
            selectCaracData = caracDataVOL;
        }
        else {
            selectCaracData = caracDataCRE;
        }

        Dice.jetCaracteristique({
            actor: this.actor,
            rangCarac: selectCaracData.rangCarac,
            labelCarac: selectCaracData.labelCarac,
            bonusAspect: selectCaracData.bonusAspect,
            labelAspect: selectCaracData.labelAspect,
            utiliseHeroisme: event.shiftKey,
            titrePersonnalise: game.i18n.localize("agone.actors.jetResistMagieNat")
        });
    }

    // Gestionnaire d'événements de l'onglet Emprise
    // Reconnaitre un sort
    _onReconnSort(event){
        event.preventDefault();

        let caracData = this.actor.getCaracData("emprise");
        let compData = this.actor.getCompData("occulte", "connDanseurs", null);

        Dice.jetCompetence({
            actor: this.actor,
            rangComp: compData.rangComp,
            labelComp: compData.labelComp,
            specialisation: compData.specialisation,
            labelSpecialisation: compData.labelSpecialisation,
            jetDefautInterdit: compData.jetDefautInterdit,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect,
            utiliseHeroisme: event.shiftKey,
            titrePersonnalise: game.i18n.localize("agone.actors.jetReconnSort"),
            afficherDialog: false
        });
    }

    // Resistance magique - Pratiquant de l'Emprise
    _onResistMagie(event) {
        event.preventDefault();

        let caracData = this.actor.getCaracData("emprise");

        Dice.jetCaracteristique({
            actor: this.actor,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect,
            utiliseHeroisme: event.shiftKey,
            difficulte: 15,
            titrePersonnalise: game.i18n.localize("agone.actors.jetResistMagie")
        });
    }

    // Contre-magie
    async _onContreMagie(event) {
        event.preventDefault();

        let danseurs = this.actor.getDanseurs();
        if(danseurs.length == 0) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnDanseurContreMagie"));
            return;
        }
        else if(danseurs.length == 1) {
            // Jet de Contre-magie avec ce danseur
            Dice.contreMagie(this.actor, danseurs[0], event.shiftKey);
        }
        else {
            // Carte de sélection du danseur à afficher dans le chat
            Chat.selDanseurContreMagie(this.actor, danseurs);
        }
    }

    // Reconnaitre une oeuvre
    _onReconnOeuvre(event) {
        event.preventDefault();

        // Carte de sélection de l'art magique à afficher dans le chat
        Chat.selArtMagiqueReconnOeuvre(this.actor, this.actor.data.data.familleCompetences.occulte.competences.artsMagiques.domaines);
    }

    // Désaccord
    _onDesaccord(event) {
        event.preventDefault();

        let nbDomaines = 0;
        let instruments = [];
        let domainesMusique = this.actor.data.data.familleCompetences.societe.competences.musique.domaines;
        for(let[keyDom, domaine] of Object.entries(domainesMusique)) {
            if(domaine.rang > 0) {
                nbDomaines += 1;
                instruments.push(domaine);
            }
        }

        //console.log(instruments);
        //console.log(instruments[0].label);

        if(nbDomaines == 0) {
            ui.notifications.warn('Aucune comprétence de musique trouvée');
            return;
        }
        else if(nbDomaines == 1) {
            Dice.desaccord(this.actor, instruments[0].label, event.shiftKey);
        }
        else {
            // Selection de l'instrument
            Chat.selInstrumentDesaccord(this.actor, instruments);
        }
    }
}