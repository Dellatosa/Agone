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
    trait: "agone.items.trait",
    bouclier: "agone.items.bouclier"
}

agone.mouvementCombat = {
    aucun: {
        label: "agone.common.aucun",
        modif: 0
    },
    normal: {
        label: "agone.items.mouvementNormal",
        modif: -2
    },
    rapide: {
        label: "agone.items.mouvementRapide",
        modif: -4
    }
}

agone.visibiliteCombat = {
    complete: {
        label: "agone.items.visibiliteComplete",
        modif: 0
    },
    demi: {
        label: "agone.items.visibiliteDemi",
        modif: -2
    },
    minime: {
        label: "agone.items.visibiliteMinime",
        modif: -4
    }
}

agone.distanceTir = {
    courte: {
        label: "agone.items.courte",
        modif: 10
    },
    moyenne: {
        label: "agone.items.moyenne",
        modif: 15
    },
    longue: {
        label: "agone.items.longue",
        modif: 20
    },
    extreme: {
        label: "agone.items.extreme",
        modif: 25
    }
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
    tenebre: "agone.actors.tenebre",
    perfidie: "agone.actors.perfidie",
}

agone.saisons = {
    aucun: "",
    printemps: "agone.actors.printemps",
    ete: "agone.actors.ete",
    automne: "agone.actors.automne",
    hiver: "agone.actors.hiver"
}

agone.instruments = {
    aucun: "",
    cistre: "agone.items.cistre",
    tambour: "agone.items.tambour",
    flute: "agone.items.flute",
    harpe: "agone.items.harpe",
    viole: "agone.items.viole"
}

agone.qualiteInstrument = {
    normal: {
        label: "",
        modif: 0
    },
    peuAdapte: {
        label: "agone.items.peuAdapte",
        modif: -2
    },
    tresPeuAdapte: {
        label: "agone.items.tresPeuAdapte",
        modif: -4
    },
    sansInstrument: {
        label: "agone.items.sansInstrument",
        modif: -8
    }
}

agone.bruitEnviron = {
    normal: {
        label: "",
        modif: 0
    },
    silence: {
        label: "agone.items.silence",
        modif: 2
    },
    beaucoupBruit: {
        label: "agone.items.beaucoupBruit",
        modif: -2
    }
}

agone.saisonOeuvre = {
    normal: {
        label: "",
        modif: 0
    },
    saisonOpposee: {
        label: "agone.items.saisonOpposee",
        modif: 2
    },
    saisonIdentique: {
        label: "agone.items.saisonIdentique",
        modif: -2
    }
}

agone.materiaux = {
    tissuPapier: {
        label: "agone.items.tissuPapier",
        resistance: 2
    },
    verreSable: {
        label: "agone.items.verreSable",
        resistance: 3
    },
    boisTerre: {
        label: "agone.items.boisTerre",
        resistance: 4
    },
    metal: {
        label: "agone.items.metal",
        resistance: 5
    },
    pierre: {
        label: "agone.items.pierre",
        resistance: 6
    },
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

agone.clefsEffets = {
    "": "",
    "data.aspects.ame.positif.valeur": "agone.actors.ame",
    "data.aspects.ame.negatif.valeur": "agone.actors.ameNoire",
    "data.aspects.corps.positif.valeur": "agone.actors.corps",
    "data.aspects.corps.negatif.valeur": "agone.actors.corpsNoir",
    "data.aspects.esprit.positif.valeur": "agone.actors.esprit",
    "data.aspects.esprit.negatif.valeur": "agone.actors.espritNoir",
    "data.aspects.corps.caracteristiques.force.valeur": "agone.actors.force",
    "data.aspects.corps.caracteristiques.agilite.valeur": "agone.actors.agilite",
    "data.aspects.corps.caracteristiques.resistance.valeur": "agone.actors.resistance",
    "data.aspects.corps.caracteristiques.perception.valeur": "agone.actors.perception",
    "data.aspects.corps.caracteristiques.melee.valeur": "agone.actors.melee",
    "data.aspects.corps.caracteristiques.melee.tir": "agone.actors.tir",
    "data.aspects.esprit.caracteristiques.intelligence.valeur": "agone.actors.intelligence",
    "data.aspects.esprit.caracteristiques.volonte.valeur": "agone.actors.volonte",
    "data.aspects.esprit.caracteristiques.emprise.valeur": "agone.actors.emprise",
    "data.aspects.ame.caracteristiques.charisme.valeur": "agone.actors.charisme",
    "data.aspects.ame.caracteristiques.creativite.valeur": "agone.actors.creativite",
    "data.aspects.ame.caracteristiques.art.valeur": "agone.actors.art",
    "data.caracSecondaires.tai": "agone.actors.tai",
    "data.caracSecondaires.mouvement": "agone.actors.mouvement",
    "data.caracSecondaires.bonusInitiative": "agone.actors.initiative",
    "data.caracSecondaires.tenebre": "agone.actors.tenebre",
    "data.caracSecondaires.perfidie": "agone.actors.perfidie",
}