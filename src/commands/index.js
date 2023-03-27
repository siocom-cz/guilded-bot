import {dailyCommand} from "./dailyCommand.js";
import {workCommand} from "./workCommand.js";
import {pointsCommand} from "./pointsCommand.js";
import {topCommand} from "./topCommand.js";
import {helpCommand} from "./helpCommand.js";

export const commands = {
    '/daily': {fn: dailyCommand, desc: 'Vyzvedni si denní odměnu která je možná jednou za den.'},
    '/work': {fn: workCommand, desc: 'Vyzvedni si odměnu, která je možná každou hodinu.'},
    '/points': {fn: pointsCommand, desc: 'Zjisti kolik máš bodů.'},
    '/top': {fn: topCommand, desc: 'Zobraz si top statistiky: ("/top" nebo "/top points") A "/top streaks"'},
    '/help': {fn: (ctx,_,data) => helpCommand(ctx, commands, data), desc: 'Zobraz si seznam dostupných příkazů'},
}