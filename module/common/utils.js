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

export async function messageInfoEG(queryData) {
    console.log("queryData", queryData);
    const actor = game.actors.get(queryData.actorId);

    let message = "A définir";
    switch(queryData.action) {
        case "regenererHeroisme":
            message = "Utilisation de la régénération de la réserve d'héroïsme"
    }

    let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: message,
            whisper: game.users.filter(user => user.isGM == true)
        };

    console.log(chatData);

    ChatMessage.create(chatData);

    return {result : "ok"};
}