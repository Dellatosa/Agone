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
       
    }

    await game.settings.set("agone", "systemMigrationVersion", game.system.version);
    ui.notifications.info(`Migration du système Agone vers la version ${game.system.version} terminée!`, {permanent: true});
}