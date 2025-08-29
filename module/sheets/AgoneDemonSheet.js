import * as Dice from "../dice.js";
import * as Chat from "../chat.js";
import * as Utils from "../common/utils.js";

export default class AgoneDemonSheet extends foundry.appv1.sheets.ActorSheet {

    static get defaultOptions() {

        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 760,
            height: 910,
            classes: ["agone", "sheet", "demon"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" },
                    { navSelector: ".competences-tabs", contentSelector: ".competences-content", initial: "epreuves" },
                    //{ navSelector: ".magie-tabs", contentSelector: ".magie-content", initial: "emprise" },
                    //{ navSelector: ".historique-tabs", contentSelector: ".historique-content", initial: "avantagesDefauts" }
                  ]
        });
    }

    get template() {
        return `systems/agone/templates/sheets/actors/demon-sheet.html`
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.agone;
        const actorData = data.data.system;

        /* ----------------------------------------------------
        ---- Création des listes d'items filtrées par type ----
        -----------------------------------------------------*/

        data.armes = data.items.filter(function (item) { return item.type == "Arme"});
        data.armures = data.items.filter(function (item) { return item.type == "Armure"});
        data.equipements = data.items.filter(function (item) { return item.type == "Equipement"});

        /* ---------------------------------------------------------
        ---- Répartition équilibrée des compétences en fonction ----
        ---- du nombre de colonnes d'affichage sélectionné      ----
        ----------------------------------------------------------*/

        // Décompte du nombre de compétences pour les répartir équitablement dans les colonnes
        for(let[keyFam, famille] of Object.entries(actorData.familleCompetences)) {
            let nbCompsFamille = 0;

            for(let[keyComp, competence] of Object.entries(famille.competences)) {
                nbCompsFamille += 1;
                if(competence.domaine == true) {
                    for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                        nbCompsFamille += 1;
                    }
                }
            }
            famille.nbCompsFamille = nbCompsFamille;
        }

        var arrFam = Array(2);
        for (let i = 0; i < 2; i++) {
            arrFam[i] = i;
        }
        actorData.colFams = arrFam;

        for(let[keyFam, famille] of Object.entries(actorData.familleCompetences)) {
            let numCompFamille = 0;
            const nbCompsFamilleParCol = Math.ceil(famille.nbCompsFamille / 2);
            
            for(let[keyComp, competence] of Object.entries(famille.competences)) {
                
                if(competence.speDemon) {
                    competence.numcolFamille = Math.floor(numCompFamille / nbCompsFamilleParCol);
                    numCompFamille += 1;
                }
            }

            for(let[keyComp, competence] of Object.entries(famille.competences)) {   
                if(!competence.speDemon) { 
                    competence.numcolFamille = Math.floor(numCompFamille / nbCompsFamilleParCol);
                    numCompFamille += 1;
                
                    if(competence.domaine == true) {
                        for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                            domaine.numcolFamille = Math.floor(numCompFamille / nbCompsFamilleParCol);
                            numCompFamille += 1;
                        }
                    }
                }
            } 
        }

        // Etat du verrou sur la feuille
        data.unlocked = this.actor.isUnlocked;

        // Mode de création : Libre / Points d'appel
        data.utilisePcAppel = this.actor.utilisePcAppel;

        // Verrouillage du cercle si le mode de création est "Points d'appel" et en cas de dépense de points de d'appel
        if(data.utilisePcAppel && actorData.pcAppel.depense > 0) {
            data.figerCercle = true;
        }

        // l'utilisateur actif est l'EG
        data.estEG = game.user.isGM;

        return data;
    }

    async _updateObject(event, formData) {
        const updateObj = {};

        for (const [key, value] of Object.entries(formData)) {             
            if(key.startsWith("system.familleCompetences")) {
                updateObj[key] = value;
            }
        }
        this.actor.update(updateObj);

        super._updateObject(event, formData);
    }

    activateListeners(html) {
        super.activateListeners(html);
    
        // Tout ce qui suit nécessite que la feuille soit éditable
        if (!this.options.editable) return;

        // Gestion du drag and drop pour les items
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            // Find all items on the character sheet.
            html.find('div.item').each((i, div) => {
                // Ignore for the header row.
                if (div.classList.contains("item-header")) return;
                // Add draggable attribute and dragstart listener.
                div.setAttribute("draggable", true);
                div.addEventListener("dragstart", handler, false);
            });
        }

        if(this.actor.isOwner) {
            // Vérouiller / dévérouiller la fiche
            html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

            // Basculer le mode de création Libre / Points d'appel
            html.find(".sheet-utilise-appel").click(this._onSheetUtiliseAppel.bind(this));

            // Réinitialiser les statistiques globales (caractéristiques et stats démoniaques)
            html.find(".sheet-reset-stats").click(this._onSheetResetStats.bind(this));
            
            // Modifier les statistiques démoniaques (Tai, Mv, Densité, Opacité)
            html.find(".mod-stat-appel").click(this._onModifStatAppel.bind(this));

            // Modifier les caractéristiques
            html.find(".mod-carac-crea").click(this._onModifCaracCrea.bind(this));

            // Modifier les compétences
            html.find(".mod-comp-crea").click(this._onModifCompetenceCrea.bind(this));

            // roll-comp - jet de compétence
            html.find('.roll-comp').click(this._onRollComp.bind(this));

            // roll-carac - jet de caractéritiques
            html.find('.roll-carac').click(this._onRollCarac.bind(this));

            // Edition d'un item
            html.find('.editer-item').click(this._onEditerItem.bind(this));

            //Suppression d'un item
            html.find('.supprimer-item').click(this._onSupprimerItem.bind(this));

            // item-roll - jet de dés depuis un item
            html.find('.item-roll').click(this._onItemRoll.bind(this));

            // Initiative
            html.find('button.initiative').click(this._onInitiativeRoll.bind(this));

            // Esquive
            html.find('button.esquive').click(this._onEsquive.bind(this));

            // Défense naturelle
            html.find('button.defenseNat').click(this._onDefenseNat.bind(this));

            // Resistance magique - profane
            html.find('button.resistMagieNat').click(this._onResistMagieNat.bind(this));
        }
    }

    // Vérouiller / dévérouiller la fiche
    async _onSheetChangelock(event) {
        event.preventDefault();
        
        let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
        if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
        else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
        this.actor.sheet.render(true);
    }

    async _onSheetUtiliseAppel(event) {
        event.preventDefault();
        
        let flagData = await this.actor.getFlag(game.system.id, "SheetUtiliseAppel");
        if (flagData) await this.actor.unsetFlag(game.system.id, "SheetUtiliseAppel");
        else await this.actor.setFlag(game.system.id, "SheetUtiliseAppel", "SheetUtiliseAppel");
        this.actor.sheet.render(true);
    }

    async _onSheetResetStats(event) {
        event.preventDefault();

        const reinitValidee = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("agone.dialog.titreReinitStats") },
            content: `<p>${game.i18n.localize("agone.dialog.messageReinitStats")}</p>`
        });

        if(reinitValidee) {
            // Récupération des aspects
            for (let [keyA, aspect] of Object.entries(this.actor.system.aspects)) {

                // Reinitialisation caractéristiques primaires
                for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                    if(!carac.secondaire) {
                        await this.actor.update({ [`system.aspects.${keyA}.caracteristiques.${keyC}.pc`] : 0 });
                    }
                }
            }

            // Reinitialisation des statistiques
            await this.actor.update({ [`system.caracSecondaires.tai.pc`] : 0 });
            await this.actor.update({ [`system.caracSecondaires.vol.pc`] : 0 });
            await this.actor.update({ [`system.caracSecondaires.densite.pc`] : 0 });
            await this.actor.update({ [`system.caracSecondaires.opacite.pc`] : 0 });

            // Reinitialisation des points d'appel
            await this.actor.update({ [`system.pcAppel.depense`] : 0 });
        }
    }

    // Modifier les statistiques démoniaques (Tai, Mv, Densité, Opacité)
    async _onModifStatAppel(event) {
        event.preventDefault();
        const element = event.currentTarget;
    
        if(!event.detail || event.detail == 1) {
            const stat = element.dataset.stat;
            const action = element.dataset.action;

            if(this.actor.system.cercle != "aucun") {
                const currentVal = parseInt(this.actor.system.caracSecondaires[stat].pc);

                if(action == "minus") {
                    if(currentVal > 0) {
        
                        if(stat == "densite") {
                            await this.actor.update({ [`system.caracSecondaires.densite.pc`] : currentVal - CONFIG.agone.statsDemon[this.actor.system.cercle].bonusDensite });
                        }
                        else if(stat == "opacite") {
                            await this.actor.update({ [`system.caracSecondaires.opacite.pc`] : currentVal - CONFIG.agone.statsDemon[this.actor.system.cercle].bonusOpacite });
                        }
                        else {
                            await this.actor.update({ [`system.caracSecondaires.${stat}.pc`] : currentVal - 1 });
                        }
                        
    
                        if(this.actor.utilisePcAppel) {
                            const currentPcDep = parseInt(this.actor.system.pcAppel.depense);
                            await this.actor.update({ [`system.pcAppel.depense`] : currentPcDep - 1 });
                        }
                    }
                }
                else if(action == "plus") {
                    if((currentVal < parseInt(this.actor.system.caracSecondaires[stat].max) - parseInt(this.actor.system.caracSecondaires[stat].min))
                        || stat == "densite" || stat == "opacite") {
        
                        if(this.actor.utilisePcAppel) {
                            const currentPcDep = parseInt(this.actor.system.pcAppel.depense);
                            const pcMax = parseInt(this.actor.system.pcAppel.base);
        
                            if (currentPcDep + 1 > pcMax) {
                                ui.notifications.warn(game.i18n.localize("agone.notifications.warnPcAppelVide"));
                                return;
                            }
        
                            await this.actor.update({ [`system.pcAppel.depense`] : currentPcDep + 1 });
                        }
                    
                        if(stat == "densite") {
                            await this.actor.update({ [`system.caracSecondaires.densite.pc`] : currentVal + CONFIG.agone.statsDemon[this.actor.system.cercle].bonusDensite });
                        }
                        else if(stat == "opacite") {
                            await this.actor.update({ [`system.caracSecondaires.opacite.pc`] : currentVal + CONFIG.agone.statsDemon[this.actor.system.cercle].bonusOpacite });
                        }
                        else {
                            await this.actor.update({ [`system.caracSecondaires.${stat}.pc`] : currentVal + 1 });
                        }
                    }
                }
            }            
        }
    }

    // Modifier les caractéristiques
    async _onModifCaracCrea(event) {
        event.preventDefault();
        const element = event.currentTarget;
    
        if(!event.detail || event.detail == 1) {
            const aspect = element.dataset.aspect;
            const carac = element.dataset.carac;
            const action = element.dataset.action;
    
            const currentVal = parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].pc);
        
            if(action == "minus") {
                if(currentVal > 0) {
        
                    await this.actor.update({ [`system.aspects.${aspect}.caracteristiques.${carac}.pc`] : currentVal - 1 });
    
                    if(this.actor.utilisePcAppel) {
                        const currentPcDep = parseInt(this.actor.system.pcAppel.depense);
                        await this.actor.update({ [`system.pcAppel.depense`] : currentPcDep - 1 });
                    }
                }
            }
            else if(action == "plus") {
                if(currentVal < parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].max - parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].min))) {
        
                    if(this.actor.utilisePcAppel) {
                        const currentPcDep = parseInt(this.actor.system.pcAppel.depense);
                        const pcMax = parseInt(this.actor.system.pcAppel.base);
        
                        if (currentPcDep + 1 > pcMax) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnPcAppelVide"));
                            return;
                        }
        
                        await this.actor.update({ [`system.pcAppel.depense`] : currentPcDep + 1 });
                    }
                    
                    await this.actor.update({ [`system.aspects.${aspect}.caracteristiques.${carac}.pc`] : currentVal + 1 });
                }
            }
        }
    }
    
    async _onModifCompetenceCrea(event) {
        event.preventDefault();
        const element = event.currentTarget;

        if(!event.detail || event.detail == 1) {
            const famille= element.dataset.famille;
            const competence= element.dataset.competence;
            const domaine= element.dataset.domaine;
            const action = element.dataset.action;
        
            let currentVal = 0;;
            if(domaine) {
                currentVal = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].pc);
            }
            else {
                currentVal = parseInt(this.actor.system.familleCompetences[famille].competences[competence].pc);
            }
                
            if(action == "minus") {
                if(currentVal > 0) {
                    if(domaine) {
                        // Pas de score inférieur à 5 pour une compétence spécialisée
                        if(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].specialisation && currentVal <= 5) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnCompSpe"));
                            return;
                        }
    
                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.domaines.${domaine}.pc`] : currentVal - 1 });
                    }
                    else {
                        // Pas de score inférieur à 5 pour une compétence spécialisée
                        if(this.actor.system.familleCompetences[famille].competences[competence].specialisation && currentVal <= 5) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnCompSpe"));
                            return;
                        }

                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.pc`] : currentVal - 1 });
                    }
        
                    const currentPcDep = parseInt(this.actor.system.nivComp.depense);
                    await this.actor.update({ [`system.nivComp.depense`] : currentPcDep - 1 });
                }
            }
            else if(action == "plus") {
                // Limite de familles de compétence selon le cercle du démon
                if(this.actor.system.nbFamilleValorisee >= CONFIG.agone.statsDemon[this.actor.system.cercle].nbFamComp 
                    && !this.actor.system.familleCompetences[famille].famValorisee
                    && !this.actor.system.familleCompetences[famille].competences[competence].speDemon) {
                        ui.notifications.warn(game.i18n.format("agone.notifications.warnNbFamComp", { nbFam: this.actor.system.nbFamilleValorisee }));
                        return;
                    }
                
                // Famille Occulte uniquement pour les Obsidiens
                if(famille == "occulte" && this.actor.system.cercle != "obsidien") {
                    ui.notifications.warn(game.i18n.localize("agone.notifications.warnFamOcculte"));
                    return;
                }

                let rangMax = 0;
                if(domaine) {
                    rangMax = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].max);
                }
                else {
                    rangMax = parseInt(this.actor.system.familleCompetences[famille].competences[competence].max);
                }
        
                if(currentVal < rangMax) {
                
                    const currentPcDep = parseInt(this.actor.system.nivComp.depense);
    
                    if (currentPcDep + 1 > parseInt(this.actor.system.nivComp.base)) {
                        ui.notifications.warn(game.i18n.localize("agone.notifications.warnNivCompVide"));
                        return;
                    }
        
                    await this.actor.update({ [`system.nivComp.depense`] : currentPcDep + 1 });
                        
                    if(domaine) {
                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.domaines.${domaine}.pc`] : currentVal + 1 });
                    }
                    else {
                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.pc`] : currentVal + 1 });
                    }
                }
            }
        }
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
        
        let content = `<p>${game.i18n.localize("agone.common.objet")} : ${item.name}<br>${game.i18n.localize("agone.common.confirmSupprText")}<p>`
        let dlg = Dialog.confirm({
            title: game.i18n.localize("agone.common.confirmSuppr"),
            content: content,
            yes: () => item.delete(),
            //no: () =>, On ne fait rien sur le 'Non'
            defaultYes: false
           });
    }

    // item-roll - jet de dés depuis un item
    _onItemRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.roll();
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
            familleComp: dataset.famille,
            specialisation: compData.specialisation,
            labelSpecialisation: compData.labelSpecialisation,
            jetDefautInterdit: compData.jetDefautInterdit,
            aspect: caracData.aspect,
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
            aspect: caracData.aspect,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect,
            utiliseHeroisme: event.shiftKey
        });
    }

     // Initiative - base, sans arme
    _onInitiativeRoll(event) {
        event.preventDefault();
            
        this.actor.rollInitiative({createCombatants: true});
    }
    
    // Esquive
    _onEsquive(event) {
        event.preventDefault();
    
        Dice.jetDefense(this.actor, "esquive");
    }
    
    // Défense naturelle
    _onDefenseNat(event) {
        event.preventDefault();

        Dice.jetDefense(this.actor, "defenseNat");
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
}