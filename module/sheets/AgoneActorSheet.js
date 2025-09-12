import * as Dice from "../dice.js";
import * as Chat from "../chat.js";
import * as Utils from "../common/utils.js";

export default class AgoneActorSheet extends foundry.appv1.sheets.ActorSheet {
     
    static get defaultOptions() {

        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 960,
            classes: ["agone", "sheet", "actor"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" },
                    { navSelector: ".competences-tabs", contentSelector: ".competences-content", initial: "epreuves" },
                    { navSelector: ".magie-tabs", contentSelector: ".magie-content", initial: "emprise" },
                    { navSelector: ".historique-tabs", contentSelector: ".historique-content", initial: "avantagesDefauts" }]
        });
    }

    get template() {

        if(this.actor.type == "Personnage" || this.actor.type == "Damne") {
            console.log(`Agone | type : ${this.actor.type} | chargement du template systems/agone/templates/sheets/actors/personnage-sheet.html`);
            return `systems/agone/templates/sheets/actors/personnage-sheet.html`
        } 
        else if(this.actor.type == "Terne") {
            console.log(`Agone | chargement du template systems/agone/templates/sheets/actors/terne-sheet.html`);
            return `systems/agone/templates/sheets/actors/terne-sheet.html`
        }
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
        data.manoeuvres = data.items.filter(function (item) { return item.type == "Manoeuvre"});
        data.bottesSecretes = data.items.filter(function (item) { return item.type == "BotteSecrete"});

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

        // l'utilisateur actif est l'EG
        data.estEG = game.user.isGM;

        // Etat du verrou sur la feuille
        data.unlocked = this.actor.isUnlocked;

        // Onglet magie sélectionné
        data.tabMagieActif = this.actor.getFlag(game.system.id, "TabMagieActif");

        // Onglet historique sélectionné
        data.tabHistoActif = this.actor.getFlag(game.system.id, "TabHistoActif");

        // Mode edition libre
        data.modeEditionLibre = this.actor.modeEditionLibre;

        // Type de ressource mode edition
        data.typeRessEdition = this.actor.typeRessEdition;
        
        // Affichage du bouton pour le jet de Vieillesse
        if(game.settings.get("agone", "gestionJetVieillesse") && actorData.peuple != "feeNoire") {
            data.jetVieillesseActif = true;
        }

        // Utilisation de l'option charge quotidienne
        if(game.settings.get("agone", "gestionCharge")) {
            data.chargeActive = true;
        }

        // La fiche est du type Personnage
        data.estPersonnage = data.data.type == "Personnage";

        // La fiche est du type Terne
        data.estTerne = data.data.type == "Terne";

        // La fiche est du peuple humain
        data.estHumain = actorData.peuple == "humain";

        data.afficherHeroisme = data.data.type == "Personnage" || data.data.type == "Damne";

        // Verrouillage du peuple si personnage Humain et dépense de points de création supérieure à 70
        if(data.data.type == "Personnage" && actorData.peuple == "humain" && actorData.pcCaracs.depense > 70) {
            data.figerPeupleH = true;
        }
        
        // Verrouillage du peuple si une compétence de peuple d'un personnage a une valeur supérieure à 5
        if(CONFIG.agone.peuple[actorData.peuple] && CONFIG.agone.peuple[actorData.peuple].competences && data.data.type == "Personnage") {
            for (let [keyF, famille] of Object.entries(CONFIG.agone.peuple[actorData.peuple].competences)) {
                for (let [keyC, comp] of Object.entries(famille)) { 
                    if(comp.domaine) {
                        if(this.actor.system.familleCompetences[keyF].competences[keyC].domaines[comp.domaine].pc > 5) {
                            // Verrouiller le peuple
                            data.figerPeupleS = true;
                        }
                    }
                    else {
                        if(this.actor.system.familleCompetences[keyF].competences[keyC].pc > 5) {
                            // Verrouiller le peuple
                            data.figerPeupleS = true;
                        }
                    }
                }
            }
        }

        data.armes.forEach( arme => { 
            const diffTai = actorData.caracSecondaires.tai.valeur - arme.system.tai;
            const diffAgilite = actorData.aspects.corps.caracteristiques.agilite.valeur - arme.system.minAgilite;
            const diffForce = actorData.aspects.corps.caracteristiques.force.valeur - arme.system.minForce;
            const item = data.actor.items.get(arme._id);

            item.update({"system.diffTai": diffTai });
            item.update({"system.diffAgilite": diffAgilite });
            item.update({"system.diffforce": diffForce });

            if(diffTai < -1 || diffTai > 1) {
                item.update({"system.equipee": ""});
                item.update({"system.nonUtilisable": true});
                item.update({"system.raisonNonUtilisable": game.i18n.localize("agone.tooltip.prerequisTaiArme")});
            }
            else {
                item.update({"system.nonUtilisable": false});
                item.update({"system.raisonNonUtilisable": ""});
            }
        });        

        return data;
    }

    /*async _updateObject(event, formData) {
        const updateObj = {};

        for (const [key, value] of Object.entries(formData)) {             
            if(key.startsWith("system.familleCompetences")) {
                updateObj[key] = value;
            }
        }
        this.actor.update(updateObj);

        super._updateObject(event, formData);
    }*/

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

            // Changement d'onglet magie
            html.find("nav.magie-tabs").click(this._onChangeMagieTabs.bind(this));

            // Changement d'onglet historqiue
            html.find("nav.historique-tabs").click(this._onChangeHistoTabs.bind(this));

            // Modifier les aspects - Damné uniquement
            html.find(".mod-aspect-crea").click(this._onModifAspect.bind(this));

            // Modifier l'expérience des aspects
            html.find(".mod-aspect-expe").click(this._onModifAspectExpe.bind(this));

            // Modifier les caractéristiques
            html.find(".mod-carac-crea").click(this._onModifCaracCrea.bind(this));

             // Modifier l'expérience des caractéristiques
            html.find(".mod-carac-expe").click(this._onModifCaracExpe.bind(this));

            // Modifier les compétences
            html.find(".mod-comp-crea").click(this._onModifCompetenceCrea.bind(this));

            // Modifier l'expérience des compétences
            html.find(".mod-comp-expe").click(this._onModifCompetenceExpe.bind(this));

            // Modifier le score de Ténèbre
            html.find(".mod-tenebre").click(this._onModifTenebre.bind(this));

             // Modifier le score de Perfidie
            html.find(".mod-perfidie").click(this._onModifPerfidie.bind(this));

            // Modifier le nombre de points de vie max
            html.find(".mod-pdv-max").click(this._onModifPdvMax.bind(this));

            //Modifier le nombre de blessures graves
            html.find(".mod-blessGrave").click(this._onModifBlessureGrave.bind(this));

            // Modifier le peuple
            html.find('.edit-peuple').change(this._onEditerPeuple.bind(this));

            // Case de spécialisation
            html.find('.case-chk-spe').click(this._onCocherSpecialisation.bind(this));

            // Equiper/Déséquiper une arme
            html.find('.mod-equip').click(this._onEquiperArme.bind(this));

            // Equiper/Déséquiper une armure
            html.find('.mod-equip-armure').click(this._onEquiperArmure.bind(this));

            // Porter/Déposer un équipement
            html.find('.mod-porter-equip').click(this._onPorterEquipement.bind(this));

            // roll-comp - jet de compétence
            html.find('.roll-comp').click(this._onRollComp.bind(this));

            // roll-carac - jet de caractéritiques
            html.find('.roll-carac').click(this._onRollCarac.bind(this));

            // roll-pdv - jet de points de vie
            html.find('.roll-pdv').click(this._onRollPdv.bind(this));

            // roll-vieillesse
            html.find('.roll-vieillesse').click(this._onRollVieillesse.bind(this));

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
            // Regen héroisme
            html.find('.regen-heroisme').click(this._onRegenHeroisme.bind(this));

            // Initiative
            html.find('button.initiative').click(this._onInitiativeRoll.bind(this));

            // Initiative des armes équipées
            html.find('button.init-arme').click(this._onInitArmeRoll.bind(this));

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

            // Liste Danseurs
            // Régénérer l'endurance
            html.find('button.repos-danseurs').click(this._onReposDanseurs.bind(this));

            // Boutons de l'onglet Arts
            // Reconnaitre une oeuvre
            html.find('button.reconnOeuvre').click(this._onReconnOeuvre.bind(this));

            // Désaccord
            html.find('button.desaccord').click(this._onDesaccord.bind(this));

            // Art improvisé
            html.find('button.artImprovise').click(this._onArtImprovise.bind(this));

            // Boutons de l'onglet Conjuration
            // Conjurer un démon
            html.find('button.conjurer').click(this._onConjurerDemon.bind(this));

            // Mode édition libre (pour l'EG seulement)
            html.find('.mode-edit-libre').click(this._onSheetChangeModeEditionLibre.bind(this));

            // Modifier le type de ressource du mode édition
            html.find('.edit-ress').change(this._onEditerRessourceEdition.bind(this));

            // Attribuer ou retirer de l'expérience
            html.find('.mod-experience').click(this._onAttribuerExperience.bind(this));

            // Valider les points d'experience attibués
            html.find('button.validerExpe').click(this._onValiderExpe.bind(this));
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

    // Changement d'onglet magie
    async _onChangeMagieTabs(event) {
        event.preventDefault();

        for(const tab of event.currentTarget.children) {
            if(tab.matches(".active")) {
                await this.actor.setFlag(game.system.id, "TabMagieActif", tab.dataset.tab);
            }
        }
    }

    // Changement d'onglet histo
    async _onChangeHistoTabs(event) {
        event.preventDefault();

        for(const tab of event.currentTarget.children) {
            if(tab.matches(".active")) {
                await this.actor.setFlag(game.system.id, "TabHistoActif", tab.dataset.tab);
            }
        }
    }

    async _onSheetChangeModeEditionLibre(event) {
        event.preventDefault();
        
        let flagData = await this.actor.getFlag(game.system.id, "SheetModeEditionLibre");
        if (flagData) await this.actor.unsetFlag(game.system.id, "SheetModeEditionLibre");
        else await this.actor.setFlag(game.system.id, "SheetModeEditionLibre", "SheetModeEditionLibre");
        this.actor.sheet.render(true);
    }

    // Modifier le peuple
    async _onEditerPeuple(event) {
        event.preventDefault();        

        const peupleInit = this.actor.system.peuple;
        const peupleSelect = event.target.value;

        if(this.actor.type == "Personnage") {
            console.log("Changement du peuple", this.actor.system.peuple, event.target.value);

            // Suppression des competences de peuple sur l'ancien peuple
            console.log("Suppression des compétences de peuple sur", peupleInit);
            if(CONFIG.agone.peuple[peupleInit].competences) {
                for (let [keyF, famille] of Object.entries(CONFIG.agone.peuple[peupleInit].competences)) {
                    for (let [keyC, comp] of Object.entries(famille)) {
                        if(comp.domaine) {
                            if(this.actor.system.familleCompetences[keyF].competences[keyC].domaines[comp.domaine].peuple == peupleInit) {
                                console.log("Compétence de domaine à supprimer", keyC, comp.domaine);
                                if(this.actor.system.familleCompetences[keyF].competences[keyC].domaines[comp.domaine].pc > 5) {
                                    ui.notifications.warn(`Compétence de peuple ${comp.domaine} a supprimer supérieure à 5 !!!`);
                                }
                                else {
                                    console.log("Suppression de la compétence", keyC, comp.domaine);
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.pc`]: 0});
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.peuple`]: ""});
                                    if(comp.libDomaine) {
                                        await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.label`]: ""});
                                    }
                                    if(comp.libSpecialisation) {
                                        await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.spePeuple`]: false});
                                        await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.specialisation`]: false});
                                        await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.labelSpecialisation`]: ""});
                                    }
                                }
                            }
                        }
                        else {
                            if(this.actor.system.familleCompetences[keyF].competences[keyC].peuple == peupleInit) {
                                console.log("Comp peuple à supprimer", keyC);
                                if(this.actor.system.familleCompetences[keyF].competences[keyC].pc > 5) {
                                    ui.notifications.warn(`Compétence de peuple ${comp} a supprimer supérieure à 5 !!!`);
                                }
                                else {
                                    console.log("Suppression de la compétence", keyC);
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.pc`]: 0});
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.peuple`]: ""});
                                    if(comp.libSpecialisation) {
                                        await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.spePeuple`]: false});
                                        await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.specialisation`]: false});
                                        await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.labelSpecialisation`]: ""});
                                    }
                                }
                            }
                        }                
                    }
                }
            }

            // Ajout des competences de peuple sur le nouveau peuple
            console.log("Ajout des compétences de peuple sur", peupleSelect);
            if(CONFIG.agone.peuple[peupleSelect].competences) {
                for (let [keyF, famille] of Object.entries(CONFIG.agone.peuple[peupleSelect].competences)) {
                    for (let [keyC, comp] of Object.entries(famille)) {  
                        if(comp.domaine) {
                            if(this.actor.system.familleCompetences[keyF].competences[keyC].domaines[comp.domaine].peuple != peupleSelect) {
                                console.log("La compétence de peuple n'existe pas", keyC, comp.domaine);
                                // La compétence de peuple n'existe pas
                                if(this.actor.system.familleCompetences[keyF].competences[keyC].domaines[comp.domaine].pc > 0) {
                                    // Restitution des points investis
                                    await this.actor.update({"system.pcCompetences.depense": this.actor.system.pcCompetences.depense - Utils.getCoutAchatTotal(this.actor.system.familleCompetences[keyF].competences[keyC].domaines[comp.domaine].pc)});
                                }
                                await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.pc`]: comp.rang});
                                await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.peuple`]: peupleSelect});
                                if(comp.libDomaine) {
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.label`]: comp.libDomaine});
                                }
                                if(comp.libSpecialisation) {
                                    if(this.actor.system.familleCompetences[keyF].competences[keyC].domaines[comp.domaine].specialisation == true) {
                                        // Restitution des points investis
                                        await this.actor.update({"system.pcCompetences.depense": this.actor.system.pcCompetences.depense - 2});
                                    }
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.spePeuple`]: true});
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.specialisation`]: true});
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.domaines.${comp.domaine}.labelSpecialisation`]: comp.libSpecialisation});
                                }
                            }
                        }
                        else {
                            if(this.actor.system.familleCompetences[keyF].competences[keyC].peuple != peupleSelect) {
                                console.log("La compétence de peuple n'existe pas", keyC);
                                // La compétence de peuple n'existe pas
                                if(this.actor.system.familleCompetences[keyF].competences[keyC].pc > 0) {
                                    // Restitution des points investis
                                    await this.actor.update({"system.pcCompetences.depense": this.actor.system.pcCompetences.depense - Utils.getCoutAchatTotal(this.actor.system.familleCompetences[keyF].competences[keyC].pc)});
                                }
                                await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.pc`]: comp.rang});
                                await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.peuple`]: peupleSelect});
                                if(comp.libSpecialisation) {
                                    if(this.actor.system.familleCompetences[keyF].competences[keyC].specialisation == true) {
                                        await this.actor.update({"system.pcCompetences.depense": this.actor.system.pcCompetences.depense - 2});
                                    }
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.spePeuple`]: true});
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.specialisation`]: true});
                                    await this.actor.update({[`system.familleCompetences.${keyF}.competences.${keyC}.labelSpecialisation`]: comp.libSpecialisation});
                                }
                            }
                        }                       
                    }
                }
            }
        }
    }

    async _onEditerRessourceEdition(event) {
        event.preventDefault();

        this.actor.setFlag(game.system.id, "SheetTypeRessEdition", event.target.value);
    }

    // Modifier les aspects - Damné uniquement
    async _onModifAspect(event) {
        event.preventDefault();
        const element = event.currentTarget;

        if(!event.detail || event.detail == 1) {
            const aspect = element.dataset.aspect;
            const type = element.dataset.type;
            const action = element.dataset.action;
    
            const currentVal = parseInt(this.actor.system.aspects[aspect][type].pc);
    
            if(action == "minus") {
                if(currentVal > 0) {
                    await this.actor.update({ [`system.aspects.${aspect}.${type}.pc`] : currentVal - 1 });
                }
            }
            else if(action == "plus") {
                if(currentVal < 10) {
                    await this.actor.update({ [`system.aspects.${aspect}.${type}.pc`] : currentVal + 1 });
                }
            }
        }
    }

    async _onModifAspectExpe(event) {
        event.preventDefault();
        const element = event.currentTarget;

        if(!event.detail || event.detail == 1) {
            const aspect = element.dataset.aspect;
            const action = element.dataset.action;

            const expDispo = parseInt(this.actor.system.experience.disponible);
            const coutExp =  parseInt(this.actor.system.aspects[aspect].positif.coutExp); 
            const currentExp = parseInt(this.actor.system.aspects[aspect].positif.expAtt);

            if(action == "minus") {
                if(currentExp > 0) {
                    await this.actor.update({ [`system.aspects.${aspect}.positif.expAtt`] : currentExp - 1 });
                    await this.actor.update({ [`system.experience.disponible`] : expDispo + 1 });
                }
            }
            else if(action == "plus") {
                if(currentExp < coutExp) {

                    if(expDispo <= 0) {
                        ui.notifications.warn(game.i18n.localize("agone.notifications.warnExpeDispoVide"));
                        return;
                    }

                    await this.actor.update({ [`system.experience.disponible`] : expDispo - 1 });
                    await this.actor.update({ [`system.aspects.${aspect}.positif.expAtt`] : currentExp + 1 });
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
                    const cout = Utils.getCoutAchat(currentVal);
    
                    await this.actor.update({ [`system.aspects.${aspect}.caracteristiques.${carac}.pc`] : currentVal - 1 });
    
                    if(this.actor.type == "Personnage" && !this.actor.modeEditionLibre) {
                        const currentPcDep = parseInt(this.actor.system.pcCaracs.depense);
                        await this.actor.update({ [`system.pcCaracs.depense`] : currentPcDep - cout });
                    }
                }
            }
            else if(action == "plus") {
                if(currentVal < parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].max)) {
    
                    if(this.actor.type == "Personnage" && !this.actor.modeEditionLibre) {
                        const currentPcDep = parseInt(this.actor.system.pcCaracs.depense);
                        const pcMax = parseInt(this.actor.system.pcCaracs.base);
                        const cout = Utils.getCoutAchat(currentVal + 1);
    
                        if (currentPcDep + cout > pcMax) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnPcCaracVide"));
                            return;
                        }
    
                        await this.actor.update({ [`system.pcCaracs.depense`] : currentPcDep + cout });
                    }
                    
                    await this.actor.update({ [`system.aspects.${aspect}.caracteristiques.${carac}.pc`] : currentVal + 1 });
                }
            }
        }
    }

    // Modifier l'expérience des caractéristiques
    async _onModifCaracExpe(event) {
        event.preventDefault();
        const element = event.currentTarget;

        if(!event.detail || event.detail == 1) {
            const aspect = element.dataset.aspect;
            const carac = element.dataset.carac;
            const action = element.dataset.action;
    
            const expDispo = parseInt(this.actor.system.experience.disponible);
            const coutExp =  parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].coutExp); 
            const currentExp = parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].expAtt);
    
            if(action == "minus") {
                if(currentExp > 0) {
                    await this.actor.update({ [`system.aspects.${aspect}.caracteristiques.${carac}.expAtt`] : currentExp - 1 });
                    await this.actor.update({ [`system.experience.disponible`] : expDispo + 1 });
                }
            }
            else if(action == "plus") {
                const currentVal = parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].pc + parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].exp));
                if(currentVal < parseInt(this.actor.system.aspects[aspect].caracteristiques[carac].max)) {
                    if(currentExp < coutExp) {

                        if(expDispo <= 0) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnExpeDispoVide"));
                            return;
                        }

                        await this.actor.update({ [`system.experience.disponible`] : expDispo - 1 });
                        await this.actor.update({ [`system.aspects.${aspect}.caracteristiques.${carac}.expAtt`] : currentExp + 1 });
                    }
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
                    const cout = Utils.getCoutAchat(currentVal);
                    if(domaine) {
                        // Pas de score inférieur à 5 pour la compétence de peuple d'un Inspiré
                        if(this.actor.type == "Personnage" && this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].peuple && currentVal <= 5) {
                            return;
                        }
                        // Pas de score inférieur à 5 pour une compétence spécialisée
                        if(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].specialisation && currentVal <= 5) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnCompSpe"));
                            return;
                        }

                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.domaines.${domaine}.pc`] : currentVal - 1 });
                    }
                    else {
                        // Pas de score inférieur à 5 pour la compétence de peuple d'un Inspiré
                        if(this.actor.type == "Personnage" && this.actor.system.familleCompetences[famille].competences[competence].peuple && currentVal <= 5) {
                            return;
                        }
                        // Pas de score inférieur à 5 pour une compétence spécialisée
                        if(this.actor.system.familleCompetences[famille].competences[competence].specialisation && currentVal <= 5) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnCompSpe"));
                            return;
                        }

                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.pc`] : currentVal - 1 });
                    }
    
                    if(this.actor.type == "Personnage" && !this.actor.modeEditionLibre) {
                        const currentPcDep = parseInt(this.actor.system.pcCompetences.depense);
                        await this.actor.update({ [`system.pcCompetences.depense`] : currentPcDep - cout });
                    }
                }
            }
            else if(action == "plus") {
                let rangMax = 0;
                if(domaine) {
                    rangMax = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].max);
                }
                else {
                    rangMax = parseInt(this.actor.system.familleCompetences[famille].competences[competence].max);
                }
    
                if(currentVal < rangMax) {
                
                    if(this.actor.type == "Personnage" && !this.actor.modeEditionLibre) {
                        const currentPcDep = parseInt(this.actor.system.pcCompetences.depense);
                        const cout = Utils.getCoutAchat(currentVal + 1);
                        const pcMax = parseInt(this.actor.system.pcCompetences.base);
    
                        if (currentPcDep + cout > pcMax) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnPcCompVide"));
                            return;
                        }
    
                        await this.actor.update({ [`system.pcCompetences.depense`] : currentPcDep + cout });
                    }
                    
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

    async _onModifCompetenceExpe(event) {
        event.preventDefault();
        const element = event.currentTarget;

        if(!event.detail || event.detail == 1) {
            const famille= element.dataset.famille;
            const competence= element.dataset.competence;
            const domaine= element.dataset.domaine;
            const action = element.dataset.action;

            const expDispo = parseInt(this.actor.system.experience.disponible);
            let coutExp = 0;
            let currentExp = 0;
            if(domaine) {
                coutExp = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].coutExp);
                currentExp = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].expAtt);
            }
            else {
                coutExp = parseInt(this.actor.system.familleCompetences[famille].competences[competence].coutExp);
                currentExp = parseInt(this.actor.system.familleCompetences[famille].competences[competence].expAtt);
            }
            
            if(action == "minus") {
                if(currentExp > 0) {
                    if(domaine) {
                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.domaines.${domaine}.expAtt`] : currentExp - 1 });
                    }
                    else {
                        await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.expAtt`] : currentExp - 1 });
                    }
                    
                    await this.actor.update({ [`system.experience.disponible`] : expDispo + 1 });
                }
            }
            else if(action == "plus") {
                let currentVal = 0;
                let rangMax = 0;
                if(domaine) {
                    currentVal = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].pc);
                    rangMax = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].max);
                }
                else {
                    currentVal = parseInt(this.actor.system.familleCompetences[famille].competences[competence].pc);
                    rangMax = parseInt(this.actor.system.familleCompetences[famille].competences[competence].max);
                }

                if(currentVal < rangMax) {
                    if(currentExp < coutExp) {

                        if(expDispo <= 0) {
                            ui.notifications.warn(game.i18n.localize("agone.notifications.warnExpeDispoVide"));
                            return;
                        }

                        await this.actor.update({ [`system.experience.disponible`] : expDispo - 1 });
                        if(domaine) {
                            await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.domaines.${domaine}.expAtt`] : currentExp + 1 });
                        }
                        else {
                            await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.expAtt`] : currentExp + 1 });
                        }
                    }
                }
            }
        }
    }

    async _onModifTenebre(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const action = element.dataset.action;
        let currentVal = 0;
        
        if(!event.detail || event.detail == 1) {
            currentVal = parseInt(this.actor.system.caracSecondaires.tenebre.gain);

            if(action == "minus") {
                if(currentVal > 0) {
                    await this.actor.update({ [`system.caracSecondaires.tenebre.gain`] : currentVal - 1 });
                }
            }
            else if(action == "plus") {
                let rangMax = 100 - parseInt(this.actor.system.caracSecondaires.tenebre.avgDef);

                if(currentVal < rangMax) {
                    await this.actor.update({ [`system.caracSecondaires.tenebre.gain`] : currentVal + 1 });
                }
            }
        }
    }

    async _onModifPerfidie(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const action = element.dataset.action;
        let currentVal = 0;
        
        if(!event.detail || event.detail == 1) {
            currentVal = parseInt(this.actor.system.caracSecondaires.perfidie.gain);

            if(action == "minus") {
                if(currentVal > 0) {
                    await this.actor.update({ [`system.caracSecondaires.perfidie.gain`] : currentVal - 1 });
                }
            }
            else if(action == "plus") {
                let rangMax = 100 - parseInt(this.actor.system.caracSecondaires.perfidie.avgDef);

                if(currentVal < rangMax) {
                    await this.actor.update({ [`system.caracSecondaires.perfidie.gain`] : currentVal + 1 });
                }
            }
        }
    }

    async _onModifPdvMax(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const action = element.dataset.action;
        let currentVal = 0;
        
        if(!event.detail || event.detail == 1) {
            currentVal = this.actor.system.caracSecondaires.pdv.pc ? parseInt(this.actor.system.caracSecondaires.pdv.pc) : 0;

            if(action == "minus") {
                await this.actor.update({ [`system.caracSecondaires.pdv.pc`] : currentVal - 1 });
            }
            else if(action == "plus") {
                await this.actor.update({ [`system.caracSecondaires.pdv.pc`] : currentVal + 1 });
            }
        }
    }

    async _onModifBlessureGrave(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const action = element.dataset.action;
        let currentVal = 0;
        
        if(!event.detail || event.detail == 1) {
            currentVal = parseInt(this.actor.system.caracSecondaires.nbBlessureGrave);

            if(action == "minus") {
                if(currentVal > 0) {
                    await this.actor.update({ [`system.caracSecondaires.nbBlessureGrave`] : currentVal - 1 });
                }
            }
            else if(action == "plus") {
                if(currentVal < 3) {
                    await this.actor.update({ [`system.caracSecondaires.nbBlessureGrave`] : currentVal + 1 });
                }
            }
        }
    }

    // Case de spécialisation
    async _onCocherSpecialisation(event) {
        event.preventDefault();
        const element = event.currentTarget;

        const famille = element.dataset.famille;
        const competence = element.dataset.competence;
        const domaine = element.dataset.domaine;

        let estSpecialiser = false;
        let currentVal = 0;
        if(domaine) {
            if(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].spePeuple) {
                return;
            }
            estSpecialiser = this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].specialisation;
            currentVal = parseInt(this.actor.system.familleCompetences[famille].competences[competence].domaines[domaine].pc);
        }
        else {
            if(this.actor.system.familleCompetences[famille].competences[competence].spePeuple) {
                return;
            }
            estSpecialiser = this.actor.system.familleCompetences[famille].competences[competence].specialisation;
            currentVal = parseInt(this.actor.system.familleCompetences[famille].competences[competence].pc);
        }

        if(!estSpecialiser && currentVal < 5) {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnSpeCompMini"));
            return;
        }

        if(this.actor.type == "Personnage" && !this.actor.modeEditionLibre) {
            const currentPcDep = parseInt(this.actor.system.pcCompetences.depense);
            const pcMax = parseInt(this.actor.system.pcCompetences.base);


            if(estSpecialiser) {
                // On décoche
                await this.actor.update({ [`system.pcCompetences.depense`] : currentPcDep - 2 });
            }
            else {
                // On coche
                if (currentPcDep + 2 > pcMax) {
                    ui.notifications.warn(game.i18n.localize("agone.notifications.pcCompVide"));
                    return;
                }
    
                await this.actor.update({ [`system.pcCompetences.depense`] : currentPcDep + 2 });
            }
        }

        if(domaine) {
            await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.domaines.${domaine}.specialisation`] : !estSpecialiser });
        }
        else {
            await this.actor.update({ [`system.familleCompetences.${famille}.competences.${competence}.specialisation`] : !estSpecialiser });
        }
    }
    
    _onEquiperArme(event) {
        event.preventDefault();
        const element = event.currentTarget;

        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        const action = element.dataset.action;

        if(action == "equiper") {
            switch(item.system.style) {
                case "trait":
                    return item.update({["system.equipee"] : "deuxMains"});
                case "bouclier":
                    return item.update({["system.equipee"] : "mainSec"});
                case "melee":
                    if(item.system.diffTai == -1) {
                        return item.update({["system.equipee"] : "deuxMains"});        
                    }
                    else {
                        return item.update({["system.equipee"] : "selection"});
                    }
                case "jet":
                    return item.update({["system.equipee"] : "selection"});
            }
        }
        else if (action == "retirer") {
            return item.update({["system.equipee"] : ""});
        }
        else if (action == "mainPri" || action == "mainSec" || action == "deuxMains") {
            return item.update({["system.equipee"] : action});
        }
        
    }

    _onEquiperArmure(event) {
        event.preventDefault();
        const element = event.currentTarget;

        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);

        const action = element.dataset.action;

        if(action == "equiper") {
            return item.update({["system.equipee"] : true});
        }
        else if (action == "retirer") {
            return item.update({["system.equipee"] : false});
        }
    }

    _onPorterEquipement(event) {
        event.preventDefault();
        const element = event.currentTarget;

        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);

        const action = element.dataset.action;

        if(action == "porter") {
            return item.update({["system.porte"] : true});
        }
        else if (action == "deposer") {
            return item.update({["system.porte"] : false});
        }
    }

    // Gestionnaire d'événements pour les listes d'items
     // Création d'un item
    _onCreerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;
        
        let image = this.getData().config.itemDefImage[element.dataset.type] ? this.getData().config.itemDefImage[element.dataset.type] : "icons/svg/mystery-man-black.svg";

        let itemData = [{
            name: game.i18n.localize("agone.common.nouveau"),
            type: element.dataset.type,
            img: image
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
    async _onSupprimerItem(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
        
        const suppr = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("agone.dialog.confirmSuppr") },
            content: `<p>${game.i18n.localize("agone.dialog.objetASuppr")} : ${item.name}<br>${game.i18n.localize("agone.dialog.confirmSupprText")}<p>`
        });

        if(suppr) {
            item.delete();
        }
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
        let val = !item.system[dtField[1]];

        return item.update({ [field]: val });
    }

    // item-roll - jet de dés depuis un item
    _onItemRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;

        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);

        item.roll(event.shiftKey);
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

    // roll-pdv - jet de points de vie
    _onRollPdv(event) {
        event.preventDefault();

        Dice.jetPdv({
            actor: this.actor
        });
    }

    // roll-vieillesse - jet de vieillesse
    _onRollVieillesse(event) {
        event.preventDefault();

        let caracData = this.actor.getCaracData("resistance");

        Dice.jetCaracteristique({
            actor: this.actor,
            aspect: caracData.aspect,
            rangCarac: caracData.rangCarac,
            labelCarac: caracData.labelCarac,
            bonusAspect: caracData.bonusAspect,
            labelAspect: caracData.labelAspect,
            difficulte: 15 + this.actor.diffJetVieillesse,
            titrePersonnalise: "Jet de vieillesse"
        });
    }

    // Attribuer de l'expérience
    async _onAttribuerExperience(event) {
        event.preventDefault();

        const nbExpAtt = this.actor.system.experience.attribuee;
        if (nbExpAtt != 0) {
            const AttExp = await foundry.applications.api.DialogV2.confirm({
                window: { title: game.i18n.localize("agone.dialog.attribuerExp") },
                content: `<p>${game.i18n.localize("agone.dialog.attribuerExpMsg")}</p>`
            });

            if(AttExp) {            
                if(nbExpAtt < 0 && this.actor.system.experience.disponible + nbExpAtt < 0) {
                    ui.notifications.warn(game.i18n.localize("agone.notifications.warnExpeDispoNegatif"));
                    return;
                }

                await this.actor.update({ [`system.experience.disponible`] :  this.actor.system.experience.disponible + nbExpAtt });
                 await this.actor.update({ [`system.experience.totale`] :  this.actor.system.experience.totale + nbExpAtt });
                 await this.actor.update({ [`system.experience.attribuee`] : 0 });
            }
        }
    }

    // Gestionnaire d'événements de l'onglet Combat
    // Régénération de l'Héroisme
    async _onRegenHeroisme(event) {
        event.preventDefault();
        
        this.actor.regenererHeroisme();

        // Message silencieux à l'EG
        Utils.envoiMessageEG(this.actor._id, "regenererHeroisme");
    }

    // Initiative - base, sans arme
    _onInitiativeRoll(event) {
        event.preventDefault();
        
        this.actor.rollInitiative({rerollInitiative: true, initiativeOptions: { formula:  this.actor.getInitiativeFormula() }});
    }

    _onInitArmeRoll(event) {
        event.preventDefault();
        const armeId = event.currentTarget.dataset.armeId;
        const arme = this.actor.items.get(armeId);

        this.actor.rollInitiative({rerollInitiative: true, initiativeOptions: { formula:  this.actor.getInitiativeFormula(arme) }});
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
            familleComp: "occulte",
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
        Chat.selArtMagiqueReconnOeuvre(this.actor, this.actor.system.familleCompetences.occulte.competences.artsMagiques.domaines);
    }

    // Désaccord
    _onDesaccord(event) {
        event.preventDefault();

        let instruments = this.actor.getInstrumentsPratiques();

        if(instruments) {
            if(instruments.length == 1) {
                Dice.desaccord(this.actor, instruments[0].label, event.shiftKey);
            }
            else {
                // Selection de l'instrument
                Chat.selInstrumentDesaccord(this.actor, instruments);
            }
        }
        else {
            ui.notifications.warn(game.i18n.localize("agone.notifications.warnCompMusique"));
            return;
        }
        
    }

    // Art improvisé
    _onArtImprovise(event) {
        event.preventDefault();

        // Carte de sélection de l'art magique à afficher dans le chat
        Chat.selArtMagiqueImprovise(this.actor, this.actor.system.familleCompetences.occulte.competences.artsMagiques.domaines);
    }

    _onConjurerDemon(event) {
        event.preventDefault();

        // Jet de conjuration 
        Dice.conjurerDemon(this.actor);
    }

    // Regeneration de l'endurance des Danseurs
    async _onReposDanseurs(event) {
        event.preventDefault();

        const repos = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("agone.dialog.regenEndDanseurs") },
            content: `<p>${game.i18n.localize("agone.dialog.regenEndDanseursMsg")}</p>`
        });

        if(repos) {
            this.actor.reposDanseurs();

            // Message silencieux à l'EG
            Utils.envoiMessageEG(this.actor._id, "reposDanseurs");
        }
    }

    async _onValiderExpe(event) {
        event.preventDefault();

        const valider = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("agone.dialog.validerExpe") },
            content: `<p>${game.i18n.localize("agone.dialog.validerExpeMsg")}</p>`
        });

        if(valider) {
            // Aspects 
            for (let [keyA, aspect] of Object.entries(this.actor.system.aspects)) {
                if(aspect.positif.coutExp == aspect.positif.expAtt) {
                    ui.notifications.info(game.i18n.format("agone.notifications.augmentationAspect", { aspect: aspect.positif.label }));
                    await this.actor.update({ [`system.aspects.${keyA}.positif.exp`] : aspect.positif.exp + 1 });
                    await this.actor.update({ [`system.aspects.${keyA}.positif.expAtt`] : 0 });
                }

                // Caractéristiques
                for (let [keyC, carac] of Object.entries(aspect.caracteristiques)) {
                    if ((carac.coutExp == carac.expAtt) && !carac.secondaire) {
                        ui.notifications.info(game.i18n.format("agone.notifications.augmentationCarac", { carac: carac.label }));
                        await this.actor.update({ [`system.aspects.${keyA}.caracteristiques.${keyC}.exp`] : carac.exp + 1 });
                        await this.actor.update({ [`system.aspects.${keyA}.caracteristiques.${keyC}.expAtt`] : 0 });
                    }
                }
            }

            // Compétences
            for(let[keyFam, famille] of Object.entries(this.actor.system.familleCompetences)) {
                for(let[keyComp, competence] of Object.entries(famille.competences)) {
                    if(competence.coutExp == competence.expAtt) {
                        ui.notifications.info(game.i18n.format("agone.notifications.augmentationComp", { comp: competence.label }));
                        await this.actor.update({ [`system.familleCompetences.${keyFam}.competences.${keyComp}.exp`] : competence.exp + 1 });
                        await this.actor.update({ [`system.familleCompetences.${keyFam}.competences.${keyComp}.expAtt`] : 0 });
                    }
                
                    if(competence.domaine == true) {
                        for(let[keyDom, domaine] of Object.entries(competence.domaines)) {
                            if(domaine.coutExp == domaine.expAtt) {
                                ui.notifications.info(game.i18n.format("agone.notifications.augmentationComp", { comp: domaine.label }));
                                await this.actor.update({[`system.familleCompetences.${keyFam}.competences.${keyComp}.domaines.${keyDom}.exp`]: domaine.exp + 1 });
                                await this.actor.update({[`system.familleCompetences.${keyFam}.competences.${keyComp}.domaines.${keyDom}.expAtt`]: 0 });
                            }
                        }
                    }
                } 
            }
        }
    }
}