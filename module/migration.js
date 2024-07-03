export const migrateWorld = async function() {
    ui.notifications.info(`Application de la migration du système Agone vers la version ${game.system.version}. Merci de patienter.`, {permanent: true});
    const lastMigrationVer = await game.settings.get("agone", "systemMigrationVersion");

    // v0.1.8
    if (isNewerVersion("0.1.8", lastMigrationVer)) {
        // Reinitialisation des macros Agone
        
        /*let macros = game.macros.filter(mc => { return mc.flags.agone.itemMacro == true });
        macros.forEach(mc => {
            mc.delete();
        });*/    
       
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