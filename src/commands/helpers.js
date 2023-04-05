import { request } from "../requests.js";

export const Colors = {
    RED: 16711680,
    GREEN: 65280,
    BLUE: 255,
    YELLOW: 16776960,
    ORANGE: 16753920,
    PURPLE: 8388736,
    CYAN: 65535,
    PINK: 16711935,
    WHITE: 16777215,
    GRAY: 8421504,
    BLACK: 0,
};


/**
 * Checks if the provided arguments match the specified requirements.
 * @param {string[]} args - The arguments provided by the user.
 * @param {Object} options - The options for checking arguments.
 * @param {number} options.requiredArgs - The minimum number of required arguments.
 * @param {string[][]|null[]} [options.validValues] - The array of valid values for each argument. Use `null` for any value.
 * @param {string[]} [options.defaultValues] - The default values for optional arguments.
 * @param {string} channelId - The channel ID for sending error messages.
 * @param {string} id - The user ID for mentioning a user.
 * @returns {boolean} Returns true if the arguments are valid, otherwise false.
 */
export function checkArguments(args, options, channelId, id) {
    const { requiredArgs, validValues, defaultValues } = options;

    if (defaultValues) {
        for (let i = 0; i < defaultValues.length; i++) {
            if (!args[i]) {
                args[i] = defaultValues[i];
            }
        }
    }

    if (args.length < requiredArgs) {
        void sendSuccess(`Příkaz vyžaduje minimálně ${requiredArgs} argument${requiredArgs > 1 ? "y" : ""}!`, 'Ups!', channelId, id, {color: Colors.RED});
        return false;
    }

    if (validValues) {
        for (let i = 0; i < validValues.length; i++) {
            if (validValues[i] && !validValues[i].includes(args[i]) && validValues[i] !== null) {
                void sendSuccess(`Neplatná hodnota pro argument ${i + 1}: "${args[i]}". Povolené hodnoty: ${validValues[i].join(", ")}`, 'Ups!', channelId, id, {color: Colors.RED});
                return false;
            }
        }
    }

    return true;
}

/**
 * Sends an error message to the specified channel.
 * @param {string} message - The error message to send.
 * @param {string} channelId - The channel ID where the message should be sent.
 * @param {string} id - The user ID for mentioning a user.
 * @returns {Promise<void>}
 */
export function sendError(message, channelId, id) {
    console.error(message);
    void request(`/v1/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify({
            embeds: [
                {
                    title: "Chyba!",
                    description: message,
                    color: Colors.RED,
                },
            ],
            isSilent: true,
            replyMessageIds: [id],
        }),
    });
}

/**
 * Sends a success message to the specified channel.
 * @param {string} message - The message to send.
 * @param {string} title - The title to send.
 * @param {string} channelId - The channel ID where the message should be sent.
 * @param {string?} id - The user ID for mentioning a user.
 * @param {object?} embedData - Data for embed content
 * @returns {Promise<void>}
 */
export function sendSuccess(message, title, channelId, id, embedData = {}) {
    const body = {
        embeds: [
            {
                title: title,
                description: message,
                color: Colors.GREEN,
                ...embedData
            },
        ],
        isSilent: true,
    }
    if(id !== undefined) {
        body.replyMessageIds = [id]
    }

    void request(`/v1/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}