export const agone = {};

agone.caracteristiques = {
    aucun: "",
    agilite: "agone.actors.agilite",
    force: "agone.actors.force",
    perception: "agone.actors.perception",
    resistance: "agone.actors.resistance",
    intelligence: "agone.actors.intelligence",
    volonte: "agone.actors.volonte",
    charisme: "agone.actors.charisme",
    creativite: "agone.actors.creativite",
    melee: "agone.actors.melee",
    tir: "agone.actors.tir",
    emprise: "agone.actors.emprise",
    art: "agone.actors.art"
}

agone.caracAbrev = {
    agilite: "agone.actors.AGI",
    force: "agone.actors.FOR",
    perception: "agone.actors.PER",
    resistance: "agone.actors.RES",
    intelligence: "agone.actors.INT",
    volonte: "agone.actors.VOL",
    charisme: "agone.actors.CHA",
    creativite: "agone.actors.CRE",
    melee: "agone.actors.MEL",
    tir: "agone.actors.TIR",
    emprise: "agone.actors.EMP",
    art: "agone.actors.ART"
}

agone.aspects = {
    corps: "agone.actors.corps",
    corpsN: "agone.actors.corpsNoir",
    Bcorps: "agone.actors.bonusCorps",
    esprit: "agone.actors.esprit",
    espritN: "agone.actors.espritNoir",
    Besprit: "agone.actors.bonusEsprit",
    ame: "agone.actors.ame",
    ameN: "agone.actors.ameNoire",
    Bame: "agone.actors.bonusAme"
}

agone.typesCompetence = {
    aucun: "",
    epreuves: "agone.actors.epreuves",
    maraude: "agone.actors.maraude",
    societe: "agone.actors.societe",
    savoir: "agone.actors.savoir",
    occulte: "agone.actors.occulte"
}

agone.competences = {
    vigilance: "agone.actors.vigilance",
    athletisme: "agone.actors.athletisme",
    escalade: "agone.actors.escalade",
    equitation: "agone.actors.equitation",
    esquive: "agone.actors.esquive",
    natation: "agone.actors.natation",
    premiersSoins: "agone.actors.premiersSoins",
    survie: "agone.actors.survie",
    armes: "agone.actors.armes",
    acrobatie : "agone.actors.acrobatie",
    camouflage: "agone.actors.camouflage",
    chasse: "agone.actors.chasse",
    deguisement: "agone.actors.deguisement",
    discretion: "agone.actors.discretion",
    fouille: "agone.actors.fouille",
    intrigue: "agone.actors.intrigue",
    jeu: "agone.actors.jeu",
    passePasse: "agone.actors.passePasse",
    poisons: "agone.actors.poisons",
    serrurerie: "agone.actors.serrurerie",
    baratin: "agone.actors.baratin",
    diplomatie: "agone.actors.diplomatie",
    eloquence: "agone.actors.eloquence",
    etiquette: "agone.actors.etiquette",
    intendance: "agone.actors.intendance",
    musique: "agone.actors.musique",
    negoce: "agone.actors.negoce",
    peinture: "agone.actors.peinture",
    poesie: "agone.actors.poesie",
    savoirFaire: "agone.actors.savoirFaire",
    sculpture: "agone.actors.sculpture",
    usCoutumes: "agone.actors.usCoutumes",
    alphabets: "agone.actors.alphabets",
    astronomie: "agone.actors.astronomie",
    chirurgie: "agone.actors.chirurgie",
    cultes: "agone.actors.cultes",
    geographie: "agone.actors.geographie",
    herboristerie: "agone.actors.herboristerie",
    histoiresLegendes: "agone.actors.histoireLegendes",
    langues: "agone.actors.langues",
    loi: "agone.actors.loi",
    medecine: "agone.actors.medecine",
    navigation: "agone.actors.navigation",
    saisons: "agone.actors.saisons",
    strategie: "agone.actors.strategie",
    zoologie: "agone.actors.zoologie",
    artsMagiques: "agone.actors.artsMagiques",
    accord: "agone.actors.accord",
    cyse: "agone.actors.cyse",
    decorum: "agone.actors.decorum",
    geste: "agone.actors.geste",
    connDanseurs: "agone.actors.connDanseurs",
    cryptogramme: "agone.actors.cryptogramme",
    demonologie: "agone.actors.demonologie",
    harmonie: "agone.actors.harmonie",
    resonance: "agone.actors.resonance",
    printemps: "agone.actors.printemps",
    ete: "agone.actors.ete",
    automne: "agone.actors.automne",
    hiver: "agone.actors.hiver",
    jorniste: "agone.actors.jorniste",
    eclipsiste: "agone.actors.eclipsiste",
    obscurantiste: "agone.actors.obscurantiste"
}

agone.peuple = {
    aucun: "",
    humain: {
        label: "Humain",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3
    },
    ogre: {
        label: "Ogre",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3
    },
    minotaure: {
        label: "Minotaure",
        bpdv: 45,
        mpoids: 10,
        tai: 1,
        mv: 4
    },
    geant: {
        label: "Géant",
        bpdv: 100,
        mpoids: 20,
        tai: 3,
        mv: 8
    },
    feeNoire: {
        label: "Fée noire",
        bpdv: 10,
        mpoids: 4,
        tai: -2,
        mv: 1
    },
    nain: {
        label: "Nain",
        bpdv: 20,
        mpoids: 6,
        tai: -1,
        mv: 2
    },
    meduse: {
        label: "Méduse",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3
    },
    lutin: {
        label: "Lutin",
        bpdv: 20,
        mpoids: 6,
        tai: -1,
        mv: 2
    },
    farfadet: {
        label: "Farfadet",
        bpdv: 20,
        mpoids: 6,
        tai: -1,
        mv: 2
    },
    satyre: {
        label: "Satyre",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3
    } 
}

agone.typesArme = {
    aucun: "",
    perforante: "agone.items.perforante",
    tranchante: "agone.items.tranchante",
    perftranch: "agone.items.perftranch",
    contondante: "agone.items.contondante"
}

agone.stylesArme = {
    aucun: "",
    melee: "agone.items.melee",
    jet: "agone.items.jet",
    trait: "agone.items.trait"
}

agone.typesArmure = {
    aucun: "",
    vesteSeule: "agone.items.vesteSeule",
    partielle: "agone.items.partielle",
    complete: "agone.items.complete"
}

agone.typesArmureMalusPer = {
    vesteSeule: 0,
    partielle: -1,
    complete: -3
}

agone.typesAvantageDefaut = {
    aucun: "",
    chargeSociete: "agone.items.chargeSociete",
    ame: "agone.actors.ame",
    esprit: "agone.actors.esprit",
    corps: "agone.actors.corps",
    arts: "agone.actors.arts",
    emprise: "agone.actors.emprise",
    saisons: "agone.actors.saisons",
    flamme: "agone.actors.flamme"
}

agone.typesPeine = {
    aucun: "",
    tenebre: "agone.actors.aspects.tenebre",
    perfidie: "agone.actors.aspects.perfidie",
}

agone.saisons = {
    aucun: "",
    printemps: "agone.actors.printemps",
    ete: "agone.actors.ete",
    automne: "agone.actors.automne",
    hiver: "agone.actors.hiver"
}

agone.resonances = {
    aucun: "",
    jorniste: "agone.actors.jorniste",
    eclipsiste: "agone.actors.eclipsiste",
    obscurantiste: "agone.actors.obscurantiste"
}

agone.arts = {
    aucun: "",
    accord: "agone.actors.accord",
    cyse: "agone.actors.cyse",
    decorum: "agone.actors.decorum",
    geste: "agone.actors.geste"
}

agone.cerclesDemon = {
    aucun: "",
    opalin: "agone.items.opalin",
    azurin: "agone.items.azurin",
    safran: "agone.items.safran",
    carmin: "agone.items.carmin",
    obsidien: "agone.items.obsidien"
}