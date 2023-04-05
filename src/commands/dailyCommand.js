import {Colors, sendError, sendSuccess} from "./helpers.js";

const Admins = {
    sionzee: 'AQ1RBy3A'
}

export async function dailyCommand({Models, cache}, args, {createdBy, channelId, id}) {
    const force = createdBy === Admins.sionzee && args[0]

    try {
        let user = await Models.User.findByIdOrCreate(createdBy, {id: createdBy})

        if (!force && !user.canObtainDailyStreak()) {
            const dailyAt = new Date(user.dailyStreakAt)
            let timeFormat = dailyAt.toLocaleTimeString('cs-CZ')
            timeFormat = timeFormat.slice(0, timeFormat.lastIndexOf(":"))
            void sendSuccess(
                `Dnes už jsi /daily použil(a) v ${timeFormat}.`,
                'Ups!',
                channelId,
                id,
                {color: Colors.RED}
            )
            return;
        }

        if(force) {
            createdBy = args[0];
            user = await Models.User.findByIdOrCreate(createdBy, {id: createdBy})
        }

        const streak = user.getDailyStreak()
        const newStreak = streak + 1;
        const points = Math.floor(Math.random() * (2000 - 400 + 1) + 400);
        const xp = Math.floor(Math.random() * (25 - 2 + 1) + 2);
        await user.setDailyStreak(newStreak)
        await user.givePoints(points);
        await user.giveXp(xp, cache.serverId)
        void sendSuccess(
            `Máš ${newStreak} streak v řadě! Dostal jsi ${points} bodů a ${xp} xp!`,
            'Denní streak!',
            channelId,
            id
        )
    } catch (error) {
        void sendError(`Nepodařilo se zpracovat příkaz /daily.`, channelId, id)
        console.error(error);
    }
}