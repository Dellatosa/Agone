export default class AgoneActiveEffectConfig extends ActiveEffectConfig {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
            height: 500,
            classes: ["agone", "sheet", "active-effect"],
            template:  "systems/agone/templates/sheets/effects/active-effect-sheet.html"
        });
    }
}