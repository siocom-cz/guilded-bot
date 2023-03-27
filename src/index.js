import WebSocket from 'ws';
import database from './database.js';
import initializeModels from './models.js';
import { unknownCommand } from './commands/unknownCommand.js';
import { options } from './requests.js';
import {Colors, sendSuccess} from "./commands/helpers.js";
import {commands} from "./commands/index.js";

const Models = initializeModels(database);

const wsUrl = 'wss://www.guilded.gg/websocket/v1';

const CHANNELS = {
    '#prikazy': 'f8c5f605-f74c-4be8-99d9-ff1e441c1ed1',
};

const cache = {
    topInterval: 0,
};

const initializeServer = () => {
    const socket = new WebSocket(wsUrl, {...options});

    socket.on('open', () => {
        console.log('Connected to Guilded Server');
        void sendSuccess(`Bot je nyní připojen a připraven k použití.`, 'Bot zapnut', CHANNELS["#prikazy"])
    });

    socket.on('message', async (data) => {
        const json = JSON.parse(data);
        const { t: eventType, d: eventData } = json;

        if (eventType === 'ChatMessageCreated') {
            const { message, serverId } = eventData;
            const { channelId, content } = message;

            cache.serverId = serverId;

            if (channelId === CHANNELS['#prikazy']) {
                const ctx = { Models, database, cache };
                await handleCommand(ctx, content, message);
            }
        }
    });

    socket.on('close', () => {
        console.log('Connection closed');
        void sendSuccess(`Bot je nyní odpojen. Znovu připojení za 5s.`, 'Bot odpojen', CHANNELS["#prikazy"])
        setTimeout(() => initializeServer(), 5000);
    });
}



const handleCommand = async (ctx, content, message) => {
    const msgData = content.trimStart().split(' ')
    const cmd = msgData[0]
    const args = msgData.slice(1)

    if(commands[cmd]) {
        await commands[cmd].fn(ctx, args, message);
    } else if (cmd.startsWith('/')) {
        await unknownCommand(ctx, cmd, args, message);
    }
};

process.on('SIGINT', async () => {
    await sendShutdownMessage();
});

process.on('SIGTERM', async () => {
    await sendShutdownMessage();
});

async function sendShutdownMessage() {
    void sendSuccess(`Bot je nyní odpojen.`, 'Bot vypnut', CHANNELS["#prikazy"], undefined, {color: Colors.RED})
}

initializeServer();