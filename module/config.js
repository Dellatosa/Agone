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
    ame: "agone.caracteristiques.aspects.ame",
    esprit: "agone.caracteristiques.aspects.esprit",
    corps: "agone.caracteristiques.aspects.corps",
    arts: "agone.common.arts",
    emprise: "agone.caracteristiques.secondaires.emprise",
    saisons: "agone.common.saisons",
    flamme: "agone.caracteristiques.aspects.flamme"
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

agone.typesCompetence = {
    aucun: "",
    epreuves: "agone.typesCompetence.epreuves",
    maraude: "agone.typesCompetence.maraude",
    societe: "agone.typesCompetence.societe",
    savoir: "agone.typesCompetence.savoir",
    occulte: "agone.typesCompetence.occulte"
}