export default class AgoneActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

    static DEFAULT_OPTIONS = {
        classes: ["agone", "sheet", "active-effect-config"]
    }

    /*static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 300,
            classes: ["agone", "sheet", "active-effect"],
            template:  "systems/agone/templates/sheets/effects/active-effect-sheet.html"
        });
    }*/

     static PARTS = {
    header: {template: "templates/sheets/active-effect/header.hbs"},
    tabs: {template: "templates/generic/tab-navigation.hbs"},
    details: {template: "templates/sheets/active-effect/details.hbs", scrollable: [""]},
    duration: {template: "templates/sheets/active-effect/duration.hbs"},
    changes: {template: "templates/sheets/active-effect/changes.hbs", scrollable: ["ol[data-changes]"]},
    footer: {template: "templates/generic/form-footer.hbs"}
  };

    /*async getData() {

        const data = await super.getData();
        data.config = CONFIG.agone;

        return data;
    }*/
}