export function getCoutAchat(niveau) {
    switch(niveau) {
        case 10:
            return 6;
        case 9:   
            return 5; 
        case 8:   
            return 4; 
        case 7:
            return 3;
        case 6:   
            return 2; 
        default:
            return 1;     
    }
}

export function getCoutAchatTotal(niveau) {
    let coutTotal = 0;
    for (let i = 1; i < niveau +1 ; i++) {
        coutTotal += getCoutAchat(niveau);
    }

    return coutTotal;
}

export function getCoutExpe(stat, niveau) {
    if(stat == "aspect") {
        return niveau * 7;
    }
    else if(stat == "carac") {
        return niveau * 5;
    }
    else if(stat == "comp") {
        return niveau * 3;
    }
    else return 0;
}