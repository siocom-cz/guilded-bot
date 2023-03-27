import {Colors, sendError, sendSuccess} from "./helpers.js";

export function unknownCommand(ctx, cmd, args, {channelId, id}) {
    try {
        void sendSuccess(
            `Příkaz ${cmd} neexistuje. Dej /help pro zobrazení existujících příkazů.`,
            `Ups!`,
            channelId,
            id,
            {color: Colors.RED, isPrivate: true}
        )
    } catch (error) {
        void sendError(`Nepodařilo se zpracovat příkaz ${cmd}.`, channelId, id)
        console.error(error);
    }
}