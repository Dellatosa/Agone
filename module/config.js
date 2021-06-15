export const agone = {};

agone.caracteristiques = {
    agilite: "agone.caracteristiques.agilite",
    force: "agone.caracteristiques.force",
    perception: "agone.caracteristiques.perception",
    resistance: "agone.caracteristiques.resistance",
    intelligence: "agone.caracteristiques.intelligence",
    volonte: "agone.caracteristiques.volonte",
    charisme: "agone.caracteristiques.charisme",
    creativite: "agone.caracteristiques.creativite",
    melee: "agone.caracteristiques.melee",
    tir: "agone.caracteristiques.tir",
    emprise: "agone.caracteristiques.emprise",
    art: "agone.caracteristiques.art"
}

agone.caracAbrev = {
    agilite: "agone.caracteristiques.agi",
    force: "agone.caracteristiques.for",
    perception: "agone.caracteristiques.per",
    resistance: "agone.caracteristiques.res",
    intelligence: "agone.caracteristiques.int",
    volonte: "agone.caracteristiques.vol",
    charisme: "agone.caracteristiques.cha",
    creativite: "agone.caracteristiques.cre",
    melee: "agone.caracteristiques.mel",
    tir: "agone.caracteristiques.tirA",
    emprise: "agone.caracteristiques.emp",
    art: "agone.caracteristiques.artA"
}

agone.aspects = {
    corps: "agone.aspects.corps",
    corpsN: "agone.aspects.corpsNoir",
    Bcorps: "agone.aspects.bonusCorps",
    esprit: "agone.aspects.esprit",
    espritN: "agone.aspects.espritNoir",
    Besprit: "agone.aspects.bonusEsprit",
    ame: "agone.aspects.ame",
    ameN: "agone.aspects.ameNoire",
    Bame: "agone.aspects.bonusAme"
}

agone.typesCompetence = {
    aucun: "",
    epreuves: "agone.typesCompetence.epreuves",
    maraude: "agone.typesCompetence.maraude",
    societe: "agone.typesCompetence.societe",
    savoir: "agone.typesCompetence.savoir",
    occulte: "agone.typesCompetence.occulte"
}

agone.competences = {
    vigilance: "agone.competences.vigilance",
    athletisme: "agone.competences.athletisme",
    escalade: "agone.competences.escalade",
    equitation: "agone.competences.equitation",
    esquive: "agone.competences.esquive",
    natation: "agone.competences.natation",
    premiersSoins: "agone.competences.premiersSoins",
    survie: "agone.competences.survie",
    armes: "agone.competences.armes",
    acrobatie : "agone.competences.acrobatie",
    camouflage: "agone.competences.camouflage",
    chasse: "agone.competences.chasse",
    deguisement: "agone.competences.deguisement",
    discretion: "agone.competences.discretion",
    fouille: "agone.competences.fouille",
    intrigue: "agone.competences.intrigue",
    jeu: "agone.competences.jeu",
    passePasse: "agone.competences.passePasse",
    poisons: "agone.competences.poisons",
    serrurerie: "agone.competences.serrurerie",
    baratin: "agone.competences.baratin",
    diplomatie: "agone.competences.diplomatie",
    eloquence: "agone.competences.eloquence",
    etiquette: "agone.competences.etiquette",
    intendance: "agone.competences.intendance",
    musique: "agone.competences.musique",
    negoce: "agone.competences.negoce",
    einture: "agone.competences.peinture",
    poesie: "agone.competences.poesie",
    savoirFaire: "agone.competences.savoirFaire",
    sculpture: "agone.competences.sculpture",
    usCoutumes: "agone.competences.usCoutumes",
    alphabets: "agone.competences.alphabets",
    astronomie: "agone.competences.astronomie",
    chirurgie: "agone.competences.chirurgie",
    cultes: "agone.competences.cultes",
    geographie: "agone.competences.geographie",
    herboristerie: "agone.competences.herboristerie",
    histoireLegendes: "agone.competences.histoireLegendes",
    langues: "agone.competences.langues",
    loi: "agone.competences.loi",
    medecine: "agone.competences.medecine",
    navigation: "agone.competences.navigation",
    saisons: "agone.competences.saisons",
    strategie: "agone.competences.strategie",
    zoologie: "agone.competences.zoologie",
    artsMagiques: "agone.competences.artsMagiques",
    accord: "agone.competences.accord",
    cyse: "agone.competences.cyse",
    decorum: "agone.competences.decorum",
    geste: "agone.competences.geste",
    connDanseurs: "agone.competences.connDanseurs",
    cryptogramme: "agone.competences.cryptogramme",
    demonologie: "agone.competences.demonologie",
    harmonie: "agone.competences.harmonie",
    resonance: "agone.competences.resonance",
    printemps: "agone.common.printemps",
    ete: "agone.common.ete",
    automne: "agone.common.automne",
    hiver: "agone.common.hiver",
    jorniste: "agone.common.jorniste",
    eclipsiste: "agone.common.eclipsiste",
    obscurantiste: "agone.common.obscurantiste"
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
    perforante: "agone.typesArme.perforante",
    tranchante: "agone.typesArme.tranchante",
    perftranch: "agone.typesArme.perftranch",
    contondante: "agone.typesArme.contondante"
}

agone.stylesArme = {
    aucun: "",
    melee: "agone.stylesArme.melee",
    jet: "agone.stylesArme.jet",
    trait: "agone.stylesArme.trait"
}

agone.typesArmure = {
    aucun: "",
    vesteSeule: "agone.typesArmure.vesteSeule",
    partielle: "agone.typesArmure.partielle",
    complete: "agone.typesArmure.complete"
}

agone.typesAvantageDefaut = {
    aucun: "",
    chargeSociete: "agone.typesAvantageDefaut.chargeSociete",
    ame: "agone.aspects.ame",
    esprit: "agone.aspects.esprit",
    corps: "agone.aspects.corps",
    arts: "agone.common.arts",
    emprise: "agone.caracteristiques.emprise",
    saisons: "agone.common.saisons",
    flamme: "agone.aspects.flamme"
}

agone.typesPeine = {
    aucun: "",
    tenebre: "agone.caracteristiques.aspects.tenebre",
    perfidie: "agone.caracteristiques.aspects.perfidie",
}

agone.saisons = {
    aucun: "",
    printemps: "agone.common.printemps",
    ete: "agone.common.ete",
    automne: "agone.common.automne",
    hiver: "agone.common.hiver"
}

agone.resonances = {
    aucun: "",
    jorniste: "agone.common.jorniste",
    eclipsiste: "agone.common.eclipsiste",
    obscurantiste: "agone.common.obscurantiste"
}

agone.arts = {
    aucun: "",
    accord: "agone.competences.accord",
    cyse: "agone.competences.cyse",
    decorum: "agone.competences.decorum",
    geste: "agone.competences.geste"
}

agone.cerclesDemon = {
    aucun: "",
    opalin: "agone.cerclesDemon.opalin",
    azurin: "agone.cerclesDemon.azurin",
    safran: "agone.cerclesDemon.safran",
    carmin: "agone.cerclesDemon.carmin",
    obsidien: "agone.cerclesDemon.obsidien"
}