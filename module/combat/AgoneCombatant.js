export default class AgoneCombatant extends Combatant {

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        //this.reinitFlags();
    }

    /*_getInitiativeFormula() {
        console.log("Combatant getInitFormula !!");

        let baseFormula = "1d10 + @aspects.corps.caracteristiques.agilite.valeur + @aspects.corps.caracteristiques.perception.valeur";
        if(this.actor.gererBonusAspect()) {
            baseFormula +=  " + @aspects.corps.bonus.valeur";
        }

        let initiativeMod = this.actor.getInitiativeMod();
        if(initiativeMod) {
            baseFormula += ` + ${initiativeMod}`;
        }

        this.reinitFlags();

        return baseFormula;
    }*/

    async reinitFlags() {
        await this.setFlag("agone", "estAttaquer", false);
        await this.setFlag("agone", "infosAttaque", null);

        await this.setFlag("agone", "reactionUtilisee", false);
        await this.setFlag("agone", "valeurDefense", 0);
        
        await this.setFlag("agone", "esquiveTotaleUtilisee", false);
        await this.setFlag("agone", "valeurEsquiveTotale", 0);

        //console.log("ReinitFlags", this.data.flags.agone);
    }

    async setAttaqueCombattant(nomAttaquant, typeArme, taiAttaquant, resultatJet, bonusDommages) {
        await this.setFlag("agone", "estAttaquer", true);
        await this.setFlag("agone", "infosAttaque", {nomAttaquant: nomAttaquant, typeArme: typeArme, taiAttaquant:taiAttaquant, resultatJet: resultatJet, bonusDommages: bonusDommages});

        //console.log("setAttaqueCombattant", this.data.flags.agone);
    }

    async reinitAttaque() {
        await this.setFlag("agone", "estAttaquer", false);
        await this.setFlag("agone", "infosAttaque", null);
    }

    estAttaquer() {
        return this.getFlag("agone", "estAttaquer");
    }

    infosAttaque() {
        return this.getFlag("agone", "infosAttaque");
    }

    async setDefenseCombattant(utiliserReaction, resultatJet) {
        let current = this.getFlag("agone", "reactionUtilisee");

        await this.setFlag("agone", "reactionUtilisee", utiliserReaction || current);
        await this.setFlag("agone", "valeurDefense", resultatJet);

        await this.reinitAttaque();

        //console.log("setDefenseCombattant", this.data.flags.agone);
    }

    reactionUtilisee() {
        return this.getFlag("agone", "reactionUtilisee");
    }

}