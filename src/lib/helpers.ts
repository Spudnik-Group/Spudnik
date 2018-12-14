import { Message } from 'discord.js';
import { CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from './custom-helpers';

/**
 * Post a message.
 *
 * @export
 * @param {CommandMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export function sendSimpleEmbeddedMessage(msg: CommandMessage, text: string, timeout?: number): Promise<Message | Message[]> {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: {
			icon_url: msg.client.user.displayAvatarURL,
			name: `${msg.client.user.username}`
		},
		color: getEmbedColor(msg),
		description: `${text}`
	});

	if (timeout) {
		promise.then((reply: Message | Message[]) => {
			if (reply instanceof Message) {
				reply.delete({ timeout: timeout }).catch(() => undefined);
			} else if (reply instanceof Array) {
				msg.channel.bulkDelete(reply);
			}
		});
	}
	return promise;
}

/**
 * Post an error message.
 *
 * @export
 * @param {CommandMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export function sendSimpleEmbeddedError(msg: CommandMessage, text: string, timeout?: number): Promise<Message | Message[]> {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: {
			icon_url: msg.client.user.displayAvatarURL,
			name: `${msg.client.user.username}`
		},
		color: 16711680,
		description: `${text}`
	});

	if (timeout) {
		promise.then((reply: Message | Message[]) => {
			if (reply instanceof Message) {
				reply.delete({ timeout: timeout }).catch(() => undefined);
			} else if (reply instanceof Array) {
				msg.channel.bulkDelete(reply);
			}
		});
	}
	return promise;
}

/**
 * Send a success message.
 *
 * @export
 * @param {CommandMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export function sendSimpleEmbeddedSuccess(msg: CommandMessage, text: string, timeout?: number): Promise<Message | Message[]> {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: {
			icon_url: msg.client.user.displayAvatarURL,
			name: `${msg.client.user.username}`
		},
		color: 3447003,
		description: `${text}`
	});

	if (timeout) {
		promise.then((reply: Message | Message[]) => {
			if (reply instanceof Message) {
				reply.delete({ timeout: timeout }).catch(() => undefined);
			} else if (reply instanceof Array) {
				msg.channel.bulkDelete(reply);
			}
		});
	}
	return promise;
}

/**
 * Post an image.
 *
 * @export
 * @param {CommandMessage} msg
 * @param {string} url
 * @param {string} [description]
 * @returns Promise<Message | Message[]>
 */
export function sendSimpleEmbeddedImage(msg: CommandMessage, url: string, description?: string): Promise<Message | Message[]> {
	return msg.embed({
		author: {
			icon_url: msg.client.user.displayAvatarURL,
			name: `${msg.client.user.username}`
		},
		color: 3447003,
		description: description,
		image: { url: url }
	});
}

/**
 * Get a random integer.
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns number
 */
export function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Find the user id being mentioned.
 *
 * @export
 * @param {string} usertxt
 * @returns string
 */
export function resolveMention(usertxt: string): string {
	let userid = usertxt;
	if (usertxt.startsWith('<@!')) {
		userid = usertxt.substr(3, usertxt.length - 4);
	} else if (usertxt.startsWith('<@')) {
		userid = usertxt.substr(2, usertxt.length - 3);
	}
	return userid;
}

/**
 * Delete the calling message for commands, if it's deletable by the bot
 * 
 * @export
 * @param {CommandMessage} msg
 * @param {CommandoClient} client
 * @returns void
 */
export const deleteCommandMessages = (msg: CommandMessage, client: CommandoClient) => {
	if (msg.deletable && client.provider.get(msg.guild, 'deletecommandmessages', false)) msg.delete();
};

/**
 * Stop the bot's typing status
 * 
 * @export
 * @param {CommandMessage} msg
 * @returns void
 */
export const stopTyping = (msg: CommandMessage) => {
	msg.channel.stopTyping(true);
};

/**
 * Start the bot's typing status
 * 
 * @export
 * @param {CommandMessage} msg
 * @returns void
 */
export const startTyping = (msg: CommandMessage) => {
	msg.channel.startTyping(1);
};
