export default class AgoneCombat extends Combat {

    async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
        console.log("Combat roll init val", ids, formulaopt, updateTurnopt, messageOptionsopt);
        
        await super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
        return this; //.update({turn: 0});
    }

    /*async startCombat() {
        return super.startCombat();
    }*/

    /*async nextTurn() {
        return super.nextTurn();
    } */

    async nextRound() {
        this.resetAll();
        return super.nextRound();
    }
}