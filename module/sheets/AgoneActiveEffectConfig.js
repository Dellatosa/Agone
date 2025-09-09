export default class AgoneActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

    static DEFAULT_OPTIONS = {
        classes: ["agone", "sheet", "active-effect-config"]
    }

    static PARTS = {
        header: {template: "templates/sheets/active-effect/header.hbs"},
        tabs: {template: "templates/generic/tab-navigation.hbs"},
        details: {template: "templates/sheets/active-effect/details.hbs", scrollable: [""]},
        duration: {template: "templates/sheets/active-effect/duration.hbs"},
        changes: {template: "systems/agone/templates/partials/effects/agone-changes.hbs", scrollable: ["ol[data-changes]"]},
        footer: {template: "templates/generic/form-footer.hbs"}
    };

    async _preparePartContext(partId, context) {
        const partContext = await super._preparePartContext(partId, context);
        switch ( partId ) {
            case "changes":
            partContext.config = CONFIG.agone;
        }

        return partContext;
    }
}