export default class AgoneActiveEffectConfig extends ActiveEffectConfig {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 300,
            classes: ["agone", "sheet", "active-effect"],
            template:  "systems/agone/templates/sheets/effects/active-effect-sheet.html"
        });
    }

    async getData() {
        const data = await super.getData();
        data.config = CONFIG.agone;

        return data;
    }
}