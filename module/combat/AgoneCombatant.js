export default class AgoneCombatant extends Combatant {

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        //this.reinitFlags();
    }

    _getInitiativeFormula() {
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
    }

    async reinitFlags() {
       await this.setFlag("agone", "reactionUtilisee", false);
       await this.setFlag("agone", "defenseValeur", 0);
       await this.setFlag("agone", "esquiveTotaleUtilisee", false);
       await this.setFlag("agone", "esquiveTotaleValeur", 0);

        console.log("ReinitFlag", this.data.flags.agone);
    }

    async majDefenseCombattant(utiliserReaction, resultatJet) {
        let current = this.getFlag("agone", "reactionUtilisee");
        console.log("current", current, "utilReact", utiliserReaction);

        await this.setFlag("agone", "reactionUtilisee", utiliserReaction || current);
        await this.setFlag("agone", "defenseValeur", resultatJet);

        console.log("majDefenseCombattant", this.data.flags.agone);
    }

    isReactionUtilisee() {
        return this.getFlag("agone", "reactionUtilisee");
    }
}