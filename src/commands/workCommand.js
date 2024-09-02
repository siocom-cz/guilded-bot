import {Colors, sendError, sendSuccess} from "./helpers.js";

const Admins = {
    sionzee: 'AQ1RBy3A'
}

export async function workCommand({Models, cache}, args, {createdBy, channelId, id}) {
    const force = createdBy === Admins.sionzee && args[0]

    try {
       if(force) {
          createdBy = args[0];
       }
        const user = await Models.User.findByIdOrCreate(createdBy, {id: createdBy})
        if (user.canWork() || force) {
            const points = Math.floor(Math.random() * (300 - 90 + 1) + 90);
            const xp = Math.floor(Math.random() * (25 - 2 + 1) + 2);
            user.work()
            await user.giveXp(xp, cache.serverId)
            await user.givePoints(points);
            void sendSuccess(
                `${force ? createdBy + ' dostal' : 'Dostal jsi' } ${points} bodů a ${xp} xp! Přijď zase za hodinu pro další odměnu.`,
                `Super!`,
                channelId,
                id
            )
        } else {
            const target = new Date(user.workAt)
            target.setHours(target.getHours() + 1)

            const duration = (target.getTime() - Date.now())
            let minutes = Math.floor((duration / (1000 * 60)) % 60);
            let seconds = Math.floor((duration / 1000) % 60);

            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            void sendSuccess(
                `Můžeš pracovat až za ${minutes}m ${seconds}s`,
                `Ups!`,
                channelId,
                id,
                {color: Colors.RED}
            )
        }
    } catch (error) {
        void sendError(`Nepodařilo se zpracovat příkaz /work.`, channelId, id)
        console.error(error);
    }
}
