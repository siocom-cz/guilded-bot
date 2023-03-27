import {Colors, sendError, sendSuccess} from "./helpers.js";

export function helpCommand(ctx, commands, {channelId, id}) {
    try {
        void sendSuccess(
            `Níže je seznam všech dostupných příkazů`,
            `Nápověda`,
            channelId,
            id,
            {
                fields: Object.keys(commands).map(key => {
                    return {
                        name: key,
                        value: commands[key].desc
                    }
                })
            }
        )
    } catch (error) {
        void sendError(`Nepodařilo se zpracovat příkaz /help.`, channelId, id)
        console.error(error);
    }
}