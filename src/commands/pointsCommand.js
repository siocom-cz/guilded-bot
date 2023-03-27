import {sendError, sendSuccess} from "./helpers.js";

export async function pointsCommand({Models}, args, {createdBy, channelId, id}) {
    try {
        const user = await Models.User.findById(createdBy)
        const balance = user?.balance ?? 0

        void sendSuccess(
            `Máš ${balance} bodů.`,
            `Účet`,
            channelId,
            id
        )
    } catch (error) {
        void sendError(`Nepodařilo se zpracovat příkaz /points.`, channelId, id)
        console.error(error);
    }
}