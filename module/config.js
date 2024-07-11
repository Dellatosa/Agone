export const agone = {};

agone.lastMigrationVer = "0.0.1"

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

agone.critInfos = {
    epreuves: {
        1: {
            nom: "agone.chat.critEprNom1",
            description: "agone.chat.critEprDesc1"
        },
        2: {
            nom: "agone.chat.critEprNom2",
            description: "agone.chat.critEprDesc2"
        },
        3: {
            nom: "agone.chat.critEprNom3",
            description: "agone.chat.critEprDesc3"
        },
        4: {
            nom: "agone.chat.critEprNom4",
            description: "agone.chat.critEprDesc4"
        },
        5: {
            nom: "agone.chat.critEprNom5",
            description: "agone.chat.critEprDesc5"
        }
    },
    maraude: {
        1: {
            nom: "agone.chat.critMarNom1",
            description: "agone.chat.critMarDesc1"
        },
        2: {
            nom: "agone.chat.critMarNom2",
            description: "agone.chat.critMarDesc2"
        },
        3: {
            nom: "agone.chat.critMarNom3",
            description: "agone.chat.critMarDesc3"
        },
        4: {
            nom: "agone.chat.critMarNom4",
            description: "agone.chat.critMarDesc4"
        },
        5: {
            nom: "agone.chat.critMarNom5",
            description: "agone.chat.critMarDesc5"
        }
    },    
    societe: {
        1: {
            nom: "agone.chat.critSocNom1",
            description: "agone.chat.critSocDesc1"
        },
        2: {
            nom: "agone.chat.critSocNom2",
            description: "agone.chat.critSocDesc2"
        },
        3: {
            nom: "agone.chat.critSocNom3",
            description: "agone.chat.critSocDesc3"
        },
        4: {
            nom: "agone.chat.critSocNom4",
            description: "agone.chat.critSocDesc4"
        },
        5: {
            nom: "agone.chat.critSocNom5",
            description: "agone.chat.critSocDesc5"
        }
    },
    savoir: {
        1: {
            nom: "agone.chat.critSavNom1",
            description: "agone.chat.critSavDesc1"
        },
        2: {
            nom: "agone.chat.critSavNom2",
            description: "agone.chat.critSavDesc2"
        },
        3: {
            nom: "agone.chat.critSavNom3",
            description: "agone.chat.critSavDesc3"
        },
        4: {
            nom: "agone.chat.critSavNom4",
            description: "agone.chat.critSavDesc4"
        },
        5: {
            nom: "agone.chat.critSavNom5",
            description: "agone.chat.critSavDesc5"
        }
    },
    occulte: {
        1: {
            nom: "agone.chat.critOccNom1",
            description: "agone.chat.critOccDesc1"
        },
        2: {
            nom: "agone.chat.critOccNom2",
            description: "agone.chat.critOccDesc2"
        },
        3: {
            nom: "agone.chat.critOccNom3",
            description: "agone.chat.critOccDesc3"
        },
        4: {
            nom: "agone.chat.critOccNom4",
            description: "agone.chat.critOccDesc4"
        },
        5: {
            nom: "agone.chat.critOccNom5",
            description: "agone.chat.critOccDesc5"
        }
    },
    emprise: {
        1: {
            nom: "agone.chat.critOccNom1",
            description: "agone.chat.critEmpDesc1"
        },
        2: {
            nom: "agone.chat.critOccNom2",
            description: "agone.chat.critEmpDesc2"
        },
        3: {
            nom: "agone.chat.critOccNom3",
            description: "agone.chat.critEmpDesc3"
        },
        4: {
            nom: "agone.chat.critOccNom4",
            description: "agone.chat.critEmpDesc4"
        },
        5: {
            nom: "agone.chat.critOccNom5",
            description: "agone.chat.critEmpDesc5"
        }
    },
    accord: {
        1: {
            nom: "agone.chat.critOccNom1",
            description: "agone.chat.critAccDesc1"
        },
        2: {
            nom: "agone.chat.critOccNom2",
            description: "agone.chat.critAccDesc2"
        },
        3: {
            nom: "agone.chat.critOccNom3",
            description: "agone.chat.critAccDesc3"
        },
        4: {
            nom: "agone.chat.critOccNom4",
            description: "agone.chat.critAccDesc4"
        },
        5: {
            nom: "agone.chat.critOccNom5",
            description: "agone.chat.critAccDesc5"
        }
    },
    geste: {
        1: {
            nom: "agone.chat.critOccNom1",
            description: "agone.chat.critGesDesc1"
        },
        2: {
            nom: "agone.chat.critOccNom2",
            description: "agone.chat.critGesDesc2"
        },
        3: {
            nom: "agone.chat.critOccNom3",
            description: "agone.chat.critGesDesc3"
        },
        4: {
            nom: "agone.chat.critOccNom4",
            description: "agone.chat.critGesDesc4"
        },
        5: {
            nom: "agone.chat.critOccNom5",
            description: "agone.chat.critGesDesc5"
        }
    },
    cyse: {
        1: {
            nom: "agone.chat.critOccNom1",
            description: "agone.chat.critCysDesc1"
        },
        2: {
            nom: "agone.chat.critOccNom2",
            description: "agone.chat.critCysDesc2"
        },
        3: {
            nom: "agone.chat.critOccNom3",
            description: "agone.chat.critCysDesc3"
        },
        4: {
            nom: "agone.chat.critOccNom4",
            description: "agone.chat.critCysDesc4"
        },
        5: {
            nom: "agone.chat.critOccNom5",
            description: "agone.chat.critCysDesc5"
        }
    },
    decorum: {
        1: {
            nom: "agone.chat.critOccNom1",
            description: "agone.chat.critDecDesc1"
        },
        2: {
            nom: "agone.chat.critOccNom2",
            description: "agone.chat.critDecDesc2"
        },
        3: {
            nom: "agone.chat.critOccNom3",
            description: "agone.chat.critDecDesc3"
        },
        4: {
            nom: "agone.chat.critOccNom4",
            description: "agone.chat.critDecDesc4"
        },
        5: {
            nom: "agone.chat.critOccNom5",
            description: "agone.chat.critDecDesc5"
        }
    }  
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
        label: "agone.actors.humain",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3,
        ageMoyen: 30,
        caracs : {}
    },
    ogre: {
        label: "agone.actors.ogre",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3,
        ageMoyen: 35,
        competences: {
            epreuves: {
                premiersSoins: {
                    rang: 5
                }
            },
            savoir: {
                chirurgie: {
                    rang: 5
                },
                saisons: {
                    domaine: "ete",
                    rang: 5
                }
            },
            maraude: {
                jeu: {
                    rang: 5
                }
            }
        },
        caracs : {
            resistance: {
                mod: 2,
                min: 5,
                max: 0
            },
            force : {
                mod: 1,
                min: 5,
                max: 0
            }
        }
    },
    minotaure: {
        label: "agone.actors.minotaure",
        bpdv: 45,
        mpoids: 10,
        tai: 1,
        mv: 4,
        ageMoyen: 45,
        competences: {
            epreuves: {
                armes: {
                    domaine: "d1",
                    libDomaine: "Cornes",
                    rang: 5
                },
                vigilance: {
                    rang: 5
                }
            },
            savoir: {
                saisons: {
                    domaine: "ete",
                    rang: 5
                }
            },
            occulte: {
                demonologie: {
                    rang: 5
                }
            }
        },
        caracs : {
            resistance: {
                mod: 4,
                min: 6,
                max: 0
            },
            force : {
                mod: 3,
                min: 7,
                max: 0
            },
            agilite : {
                mod: 0,
                min: 0,
                max: 8
            },
            charisme: {
                mod: -1,
                min: 0,
                max: 0
            },
            creativite: {
                mod: -1,
                min: 0,
                max: 0
            }
        }
    },
    geant: {
        label: "agone.actors.geant",
        bpdv: 100,
        mpoids: 20,
        tai: 3,
        mv: 8,
        ageMoyen: 75,
        caracs : {
            resistance: {
                mod: 7,
                min: 7,
                max: 0
            },
            force : {
                mod: 8,
                min: 8,
                max: 0
            },
            agilite : {
                mod: 0,
                min: 0,
                max: 3
            },
            intelligence: {
                mod: -2,
                min: 0,
                max: 0
            },
            charisme: {
                mod: -2,
                min: 0,
                max: 0
            }
        }
    },
    feeNoire: {
        label: "agone.actors.feeNoire",
        bpdv: 10,
        mpoids: 4,
        tai: -2,
        mv: 1,
        ageMoyen: 1000,
        caracs : {
            resistance: {
                mod: 0,
                min: 0,
                max: 3
            },
            force : {
                mod: 0,
                min: 0,
                max: 3
            },
            volonte: {
                mod: 1,
                min: 0,
                max: 0
            },
            intelligence: {
                mod: 2,
                min: 0,
                max: 0
            },
            charisme: {
                mod: -2,
                min: 0,
                max: 0
            },
            creativite: {
                mod: 3,
                min: 0,
                max: 0
            }
        }
    },
    nain: {
        label: "agone.actors.nain",
        bpdv: 20,
        mpoids: 6,
        tai: -1,
        mv: 2,
        ageMoyen: 40,
        caracs : {
            resistance: {
                mod: 2,
                min: 5,
                max: 0
            },
            creativite: {
                mod: 2,
                min: 0,
                max: 0
            }
        }
    },
    meduse: {
        label: "agone.actors.meduse",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3,
        ageMoyen: 40,
        caracs : {
            agilite : {
                mod: 1,
                min: 0,
                max: 0
            },
            intelligence: {
                mod: 1,
                min: 6,
                max: 0
            },
            charisme: {
                mod: 1,
                min: 7,
                max: 0
            },
            creativite: {
                mod: 1,
                min: 0,
                max: 0
            }
        }
    },
    lutin: {
        label: "agone.actors.lutin", 
        bpdv: 20,
        mpoids: 6,
        tai: -1,
        mv: 2,
        ageMoyen: 35,
        caracs : {
            resistance: {
                mod: -2,
                min: 0,
                max: 7
            },
            force : {
                mod: 0,
                min: 0,
                max: 4
            },
            agilite : {
                mod: 1,
                min: 0,
                max: 0
            },
            perception: {
                mod: 2,
                min: 0,
                max: 0
            },
            volonte: {
                mod: 1,
                min: 0,
                max: 0
            },
            intelligence: {
                mod: 0,
                min: 5,
                max: 0
            }
        }
    },
    farfadet: {
        label: "agone.actors.farfadet",
        bpdv: 20,
        mpoids: 6,
        tai: -1,
        mv: 2,
        ageMoyen: 50,
        caracs : {
            resistance: {
                mod: -2,
                min: 0,
                max: 8
            },
            force : {
                mod: 0,
                min: 0,
                max: 5
            },
            agilite : {
                mod: 2,
                min: 0,
                max: 0
            },
            perception: {
                mod: 1,
                min: 0,
                max: 0
            },
            intelligence: {
                mod: 1,
                min: 0,
                max: 0
            },
            charisme: {
                mod: 0,
                min: 5,
                max: 0
            }
        }
    },
    satyre: {
        label: "agone.actors.satyre",
        bpdv: 25,
        mpoids: 7,
        tai: 0,
        mv: 3,
        ageMoyen: 30,
        caracs : {
            resistance: {
                mod: 1,
                min: 0,
                max: 0
            },
            volonte: {
                mod: 1,
                min: 0,
                max: 0
            },
            charisme: {
                mod: 2,
                min: 6,
                max: 0
            }
        }
    } 
}

agone.itemDefImage = {
    Arme: "icons/svg/sword.svg",
    Armure: "icons/svg/statue.svg",
    Avantage: "icons/svg/upgrade.svg",
    BotteSecrete: "icons/svg/combat.svg",
    Bienfait: "icons/svg/sun.svg",
    Connivence: "icons/svg/mage-shield.svg",
    Danseur: "icons/svg/cowled.svg",
    Defaut: "icons/svg/downgrade.svg",
    Ecole: "icons/svg/city.svg",
    Equipement: "icons/svg/item-bag.svg",
    Manoeuvre: "icons/svg/combat.svg",
    Oeuvre: "icons/svg/temple.svg",
    Peine: "icons/svg/poison.svg",
    PouvoirFlamme: "icons/svg/fire.svg",
    PouvoirSaison: "icons/svg/oak.svg",
    Sort: "icons/svg/daze.svg"    
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

agone.saisonnins = {
    aucun: "",
    lutin: "agone.actors.lutin",   
    farfadet: "agone.actors.farfadet",
    satyre: "agone.actors.satyre",
    ogre: "agone.actors.ogre",
    minotaure: "agone.actors.minotaure",
    geant: "agone.actors.geant",
    feeNoire: "agone.actors.feeNoire",
    nain: "agone.actors.nain",
    meduse: "agone.actors.meduse"
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

agone.artsSymbol = {
    accord: "fa-duotone fa-music",
    cyse: "fa-duotone fa-landmark",
    decorum: "fa-duotone fa-paintbrush-fine",
    geste: "fa-duotone fa-comment-lines"
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
    "system.aspects.ame.positif.avgDef": "agone.actors.ame",
    "system.aspects.ame.negatif.avgDef": "agone.actors.ameNoire",
    "system.aspects.corps.positif.avgDef": "agone.actors.corps",
    "system.aspects.corps.negatif.avgDef": "agone.actors.corpsNoir",
    "system.aspects.esprit.positif.avgDef": "agone.actors.esprit",
    "system.aspects.esprit.negatif.avgDef": "agone.actors.espritNoir",
    "system.aspects.corps.caracteristiques.force.avgDef": "agone.actors.force",
    "system.aspects.corps.caracteristiques.agilite.avgDef": "agone.actors.agilite",
    "system.aspects.corps.caracteristiques.resistance.avgDef": "agone.actors.resistance",
    "system.aspects.corps.caracteristiques.perception.avgDef": "agone.actors.perception",
    "system.aspects.corps.caracteristiques.melee.avgDef": "agone.actors.melee",
    "system.aspects.corps.caracteristiques.tir.avgDef": "agone.actors.tir",
    "system.aspects.esprit.caracteristiques.intelligence.avgDef": "agone.actors.intelligence",
    "system.aspects.esprit.caracteristiques.volonte.avgDef": "agone.actors.volonte",
    "system.aspects.esprit.caracteristiques.emprise.avgDef": "agone.actors.emprise",
    "system.aspects.ame.caracteristiques.charisme.avgDef": "agone.actors.charisme",
    "system.aspects.ame.caracteristiques.creativite.avgDef": "agone.actors.creativite",
    "system.aspects.ame.caracteristiques.art.avgDef": "agone.actors.art",
    "system.caracSecondaires.tai.avgDef": "agone.actors.tai",
    "system.caracSecondaires.mouvement.avgDef": "agone.actors.mouvement",
    "system.caracSecondaires.bonusInitiative": "agone.actors.initiative",
    "system.caracSecondaires.tenebre.avgDef": "agone.actors.tenebre",
    "system.caracSecondaires.perfidie.avgDef": "agone.actors.perfidie",
    "system.familleCompetences.societe.competences.musique.domaines.d1.rang": "agone.actors.musiqueD1",
    "system.familleCompetences.societe.competences.musique.domaines.d2.rang": "agone.actors.musiqueD2",
    "system.familleCompetences.societe.competences.musique.domaines.d3.rang": "agone.actors.musiqueD3",
    "system.familleCompetences.societe.competences.peinture.rang": "agone.actors.peinture",
    "system.familleCompetences.societe.competences.poesie.rang": "agone.actors.poesie",
    "system.familleCompetences.societe.competences.sculpture.rang": "agone.actors.sculpture"
    
}