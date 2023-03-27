import {request} from "./requests.js";

/**
 *
 * @param {Db} database
 * @returns {{}}
 */
export default (database) => {
    const users = database.collection('users');
    const userProto = {
        getDailyStreak() {
            const streak = this.dailyStreak;
            if(streak != null) {
                // Is more than 1 day?
                const millisecondsPerDay = 24 * 60 * 60 * 1000;
                if((Date.now() - this.dailyStreakAt) / millisecondsPerDay >= 2) {
                    return 0
                }

                return streak
            } else {
                return 0
            }
        },
        canObtainDailyStreak() {
            if(!this.dailyStreakAt) return true
            const tomorrow = new Date(this.dailyStreakAt)
            tomorrow.setDate(tomorrow.getDate() + 1)
            const today = new Date()
            return tomorrow.getDate() === today.getDate() && tomorrow.getMonth() === today.getMonth() && tomorrow.getFullYear() === tomorrow.getFullYear()
        },
        setDailyStreak(streak) {
            return users.updateOne({id: this.id}, {
                $set: {
                    dailyStreak: streak,
                    dailyStreakAt: Date.now(),
                    maxDailyStreak: streak > this.maxDailyStreak ? streak : this.maxDailyStreak
                },
                $currentDate: { lastModified: true }
            })
        },
        givePoints(amount) {
            return users.updateOne({id: this.id}, {
                $inc: {
                    balance: amount,
                },
                $currentDate: { lastModified: true }
            })
        },
        async giveXp(amount, serverId) {
            await users.updateOne({id: this.id}, {
                $inc: {
                    xp: amount,
                },
                $currentDate: { lastModified: true }
            })
            await request(`/v1/servers/${serverId}/members/${this.id}/xp`, {
                method: 'POST',
                body: JSON.stringify({
                    amount
                })
            })
        },
        canWork() {
            if(!this.workAt) return true
            return Date.now() - this.workAt >= 60 * 60 * 1000
        },
        work() {
            return users.updateOne({id: this.id}, {
                $set: {
                    workAt: Date.now(),
                },
                $currentDate: { lastModified: true }
            })
        }
    }

    return {
        User: new class {

            async findById(id){
                const model = await users.findOne({
                    id: id,
                })
                return model ? Object.setPrototypeOf(model, userProto) : null;
            }
            async create(obj){
                return users.insertOne({
                    balance: 0,
                    dailyStreak: 0,
                    dailyStreakAt: 0,
                    maxDailyStreak: 0,
                    workAt: null,
                    xp: 0,
                    ...obj,
                })
            }
            async findByIdOrCreate(id, defaultValue) {
                let user = await this.findById(id);
                if (!user) {
                    await this.create(defaultValue);
                    user = await this.findById(id);
                }
                return user;
            }
            async getTopByPoints(limit) {
                return users.aggregate([
                    {
                        $sort: {
                            balance: -1
                        }
                    },
                    {
                        $limit: limit
                    }
                ])
            }
            async getTopByStreaks(limit) {
                return users.aggregate([
                    {
                        $sort: {
                            maxDailyStreak: -1
                        }
                    },
                    {
                        $limit: limit
                    }
                ])
            }

        }
    }
}