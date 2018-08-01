import chalk from 'chalk';
import * as crypto from 'crypto';
import { Message } from 'discord.js';
import { CommandMessage } from 'discord.js-commando';
import * as fs from 'fs';
import { getEmbedColor } from './custom-helpers';

const { IMGUR_KEY } = process.env;
const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea'];
const no = ['no', 'n', 'nah', 'nope'];

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
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`
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
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`
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
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`
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
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`
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

/**
 * Return a timeout as a promise.
 *
 * @export
 * @param {number} ms
 * @returns {Promise}
 */
export function delay(ms: number): Promise<any> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shuffle(array: any[]): any[] {
	const arr = array.slice(0);
	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
}

export function list(arr: any[], conj = 'and') {
	const len = arr.length;
	return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
}

export function shorten(text: string, maxLen = 2000) {
	return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
}

export function duration(ms: number) {
	const sec = Math.floor((ms / 1000) % 60).toString();
	const min = Math.floor((ms / (1000 * 60)) % 60).toString();
	const hrs = Math.floor(ms / (1000 * 60 * 60)).toString();
	return `${hrs.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`;
}

export function randomRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function trimArray(arr: any[], maxLen = 10) {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`${len} more...`);
	}
	return arr;
}

export function base64(text: string, mode = 'encode') {
	if (mode === 'encode') {
		return Buffer.from(text).toString('base64');
	}
	if (mode === 'decode') {
		return Buffer.from(text, 'base64').toString('utf8') || null;
	}
	throw new TypeError(`${mode} is not a supported base64 mode.`);
}

export function hash(text: string, algorithm: any) {
	return crypto.createHash(algorithm).update(text).digest('hex');
}

export function today(timeZone: number) {
	const now = new Date();
	if (timeZone) {
		now.setUTCHours(now.getUTCHours() + timeZone);
	}
	now.setHours(0);
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);
	return now;
}

export function tomorrow(timeZone: number) {
	const thisDate = today(timeZone);
	thisDate.setDate(thisDate.getDate() + 1);
	return thisDate;
}

export async function awaitPlayers(msg: Message, max: number, min: number, { text = 'join game', time = 30000 } = {}) {
	const joined: any[] = [];
	joined.push(msg.author.id);
	const filter = (res: any) => {
		if (msg.author.bot) { return false; }
		if (joined.includes(res.author.id)) { return false; }
		if (res.content.toLowerCase() !== text.toLowerCase()) { return false; }
		joined.push(res.author.id);
		return true;
	};
	const verify = await msg.channel.awaitMessages(filter, { max: max, time: time });
	verify.set(msg.id, msg);
	if (verify.size < min) { return false; }
	return verify.map((message: any) => message.author);
}

export async function verify(channel: any, user: any, time = 30000) {
	const filter = (res: any) => {
		const value = res.content.toLowerCase();
		return res.author.id === user.id && (yes.includes(value) || no.includes(value));
	};
	const verify = await channel.awaitMessages(filter, {
		max: 1,
		time: time
	});
	if (!verify.size) { return 0; }
	const choice = verify.first().content.toLowerCase();
	if (yes.includes(choice)) { return true; }
	if (no.includes(choice)) { return false; }
	return false;
}
