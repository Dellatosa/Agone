export const migrateWorld = async function() {
    ui.notifications.info(`Application de la migration du système Agone vers la version ${game.system.version}. Merci de patienter.`, {permanent: true});
    const lastMigrationVer = await game.settings.get("agone", "systemMigrationVersion");

    // v0.1.8
    if (isNewerVersion("0.1.8", lastMigrationVer)) {
        // Reinitialisation des macros Agone
        let macros = game.macros.filter(mc => { return mc.flags.agone.itemMacro == true });
        macros.forEach(mc => {
            mc.delete();
        });

        // Changement de champs sur les fiches Actor
        game.actors.forEach(actor => {
            // Changement de format du chanmp Tai 
            if(Number.isInteger(actor.system.caracSecondaires.tai)) {
                delete actor.system.caracSecondaires.tai;
                actor.system.caracSecondaires.tai = {"valeur": 0, "avgDef": 0};
            }

            // Changement de format du chanmp Mouvement
            if(Number.isInteger(actor.system.caracSecondaires.mouvement)) {
                delete actor.system.caracSecondaires.mouvement;
                actor.system.caracSecondaires.mouvement = {"valeur": 0, "avgDef": 0};
            }

            // Changement de format du chanmp Perfidie
            if(Number.isInteger(actor.system.caracSecondaires.perfidie)) {
                const perf = actor.system.caracSecondaires.perfidie;
                delete actor.system.caracSecondaires.perfidie;
                actor.system.caracSecondaires.perfidie = {"valeur": 0, "gain": perf, "avgDef": 0};
            }

            // Changement de format du chanmp Perfidie
            if(Number.isInteger(actor.system.caracSecondaires.tenebre)) {
                const teneb = actor.system.caracSecondaires.tenebre;
                delete actor.system.caracSecondaires.tenebre;
                actor.system.caracSecondaires.tenebre = {"valeur": 0, "gain": teneb, "avgDef": 0};
            }

            actor.prepareData();
        });

        // Corrections des clés des Active effects
        let effItems = game.items.filter(it => { return it.effects.size > 0});
        effItems.forEach(it => {
            it.effects.forEach(eff => {
                
                eff.changes.forEach(ch => {
                    // Clés basées sur les champs valeur
                    let eKey = ch.key.replace("valeur", "avgDef");
                    // Clés de carac secondaires
                    eKey.replace("tai","tai.avgDef");
                    eKey.replace("mouvement","mouvement.avgDef");
                    eKey.replace("tenebre","tenebre.avgDef");
                    eKey.replace("perfidie","perfidie.avgDef");

                    const effectData = {
                        label: eff.name,
                        icon: "icons/svg/combat.svg",
                        changes: [{
                            key: eKey,
                            mode: ch.mode,
                            value: ch.value
                        }],
                        duration: {},
                        flags: {},
                    };
                    it.createEmbeddedDocuments("ActiveEffect", [effectData]);
                });

                eff.delete();
            });
        });
    }

    await game.settings.set("agone", "systemMigrationVersion", game.system.version);
    ui.notifications.info(`Migration du système Agone vers la version ${game.system.version} terminée!`, {permanent: true});
}