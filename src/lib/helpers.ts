import chalk from 'chalk';
import { Message } from 'discord.js';
import { CommandMessage } from 'discord.js-commando';
import * as fs from 'fs';
import { getEmbedColor } from './custom-helpers';

/**
 * Post a message.
 *
 * @export
 * @param {CommandMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns {(Promise<Message | Message[]>)}
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
 * @returns {(Promise<Message | Message[]>)}
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
 * @returns {(Promise<Message | Message[]>)}
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
 * @returns {(Promise<Message | Message[]>)}
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
 * @returns {number}
 */
export function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get file contents.
 *
 * @export
 * @param {string} filePath
 * @returns {string}
 */
export function getFileContents(filePath: string): string {
	try {
		return fs.readFileSync(filePath, 'utf-8');
	} catch (err) {
		console.log(chalk.red(err));
		return '';
	}
}

/**
 * Get json from a file.
 *
 * @export
 * @param {string} filePath
 * @returns {*}
 */
export function getJsonObject(filePath: string): any {
	return JSON.parse(getFileContents(filePath));
}

/**
 * Find the user id being mentioned.
 *
 * @export
 * @param {string} usertxt
 * @returns {string}
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
