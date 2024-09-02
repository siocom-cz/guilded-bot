import {request} from "../requests.js";
import {checkArguments, sendError} from "./helpers.js";

export async function topCommand({cache, Models}, args, {channelId, id}) {

    const isValid = checkArguments(args, {
        requiredArgs: 1,
        validValues: [['points', 'streaks']],
        defaultValues: ['points']
    }, channelId, id)

    if(!isValid) return;

    const type = args[0]

    if (cache.topInterval) {
        void request(`/v1/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                embeds: [{
                    title: `Ups!`,
                    description: `Tento příkaz jde pouze jednou za 10 minut.`,
                    color: 16711680,
                }],
                isSilent: true,
                replyMessageIds: [id]
            })
        })
        return;
    }

    const cursor = await (type === "points" ? Models.User.getTopByPoints(10) : Models.User.getTopByStreaks(10));

    const promises = []
    await cursor.forEach((user) => {
        promises.push(new Promise(async resolve => {
            try {
                const data = await request(`/v1/servers/${cache.serverId}/members/${user.id}`, {
                    method: 'GET',
                })

                if(data.code == 'NotFound') {
                    console.warn(`Unable to fetch member '${user.id}': ${data.message}`)
                    return resolve(null);
                }
                
                resolve({
                    name: data.member.user.name,
                    balance: user.balance ?? 0,
                    streak: user.maxDailyStreak ?? 0
                })
            } catch (e) {
              console.warn(`Unable to fetch member '${user.id}':`, e)
            }
        }))
    })

    try {
        const result = (await Promise.all(promises)).filter(result => result !== null);
        result.sort((a, b) => type === 'points' ? (b.balance - a.balance) : (b.streak - a.streak));

        const title = type === "points" ? "TOP 10 - Body" : "TOP 10 - Nejdelší streaky";
        void request(`/v1/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                embeds: [{
                    title,
                    color: 65280,
                    fields: result.map(data => {
                        return {
                            name: data.name,
                            value: type === "points" ? data.balance : data.streak,
                            inline: false
                        }
                    })
                }],
                isSilent: true,
                replyMessageIds: [id]
            })
        })

        cache.topInterval = setTimeout(() => {
            cache.topInterval = 0;
        }, 10 * 60 * 1000)
    } catch (error) {
        void sendError(`Nepodařilo se zpracovat příkaz /top.`, channelId, id)
        console.error(error);
    }
}
