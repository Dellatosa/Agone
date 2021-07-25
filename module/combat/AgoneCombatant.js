export default class AgoneCombatant extends Combatant {

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        //this.setFlag("agone", "key", value);
    }

    _getInitiativeFormula() {
        let baseFormula = super._getInitiativeFormula();
        /* const initiativeMod = getFlag("agone", "initiativeMod");

        if(initiativeMod) {
            baseFormula += ` + ${initiativeMod}`;
        } */

        console.log(this);

        return baseFormula;
    }
}