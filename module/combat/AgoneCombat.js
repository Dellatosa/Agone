export default class AgoneCombat extends Combat {

    /* _prepareCombatant(c, scene, players, settings) {
        let combatant = super._prepareCombatant(c, scene, players, settings);
        // ajout des données par défaut sur les combattants au début du combat
        return combatant;
    } */

    async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
        await super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
        return this; //.update({turn: 0});

    }

    async startCombat() {
        return super.startCombat();
    }

    async nextTurn() {
        return super.nextTurn();
    }

    async nextRound() {
        return super.nextRound();
    }
}