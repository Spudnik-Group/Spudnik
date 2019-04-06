import { Message } from 'discord.js';
import { CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from './custom-helpers';

const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea'];
const no = ['no', 'n', 'nah', 'nope'];

/**
 * Post a message.
 *
 * @export
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedMessage = (msg: CommandoMessage, text: string, timeout?: number) => {
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
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedError = (msg: CommandoMessage, text: string, timeout?: number) => {
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
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedSuccess = (msg: CommandoMessage, text: string, timeout?: number) => {
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
 * @param {CommandoMessage} msg
 * @param {string} url
 * @param {string} [description]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedImage = (msg: CommandoMessage, url: string, description?: string) => {
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
export const getRandomInt = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Find the user id being mentioned.
 *
 * @export
 * @param {string} usertxt
 * @returns string
 */
export const resolveMention = (usertxt: string) => {
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
export const delay = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const shuffle = (array: any[]) => {
	const arr = array.slice(0);

	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}

	return arr;
}

export const list = (arr: any[], conj = 'and') => {
	const len = arr.length;

	return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
}

export const shorten = (text: string, maxLen = 2000) => {
	return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
}

export const duration = (ms: number) => {
	const sec = Math.floor((ms / 1000) % 60).toString();
	const min = Math.floor((ms / (1000 * 60)) % 60).toString();
	const hrs = Math.floor(ms / (1000 * 60 * 60)).toString();

	return `${hrs.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`;
}

export const randomRange = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const trimArray = (arr: any[], maxLen = 10) => {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`${len} more...`);
	}

	return arr;
}

export const base64 = (text: string, mode = 'encode') => {
	if (mode === 'encode') {
		return Buffer.from(text).toString('base64');
	}

	if (mode === 'decode') {
		return Buffer.from(text, 'base64').toString('utf8') || null;
	}

	throw new TypeError(`${mode} is not a supported base64 mode.`);
}

export const hash = (text: string, algorithm: any) => {
	return require('crypto').createHash(algorithm).update(text).digest('hex');
}

export const today = (timeZone: number) => {
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

export const disambiguation = (items: any, label: any, property = 'name') => {
	const itemList = items.map((item: any) => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');

	return `Multiple ${label} found, please be more specific: ${itemList}`;
}

export const tomorrow = (timeZone: number) => {
	const thisDate = today(timeZone);
	thisDate.setDate(thisDate.getDate() + 1);

	return thisDate;
}

export const awaitPlayers = async(msg: any, max: number, min: number, { text = 'join game', time = 30000, dmCheck = false } = {}) => {
	const joined: any[] = [];

	joined.push(msg.author.id);

	const filter = (res: any) => {
		if (res.author.bot) { return false; }
		
		if (joined.includes(res.author.id)) { return false; }
		
		if (res.content.toLowerCase() !== text.toLowerCase()) { return false; }
		
		joined.push(res.author.id);
		res.react('✅').catch((): void => null);
		
		return true;
	}

	const verify = await msg.channel.awaitMessages(filter, { max: max, time: time });

	verify.set(msg.id, msg);
	
	if (dmCheck) {
		for (const message of verify.values()) {
			try {
				await message.author.send('Hi! Just testing that DMs work, pay this no mind.');
			} catch (err) {
				verify.delete(message.id);
			}
		}
	}

	if (verify.size < min) { return false; }

	return verify.map((message: any) => message.author);
}

export const verify = async(channel: any, user: any, time = 30000) => {
	const filter = (res: any) => {
		const value = res.content.toLowerCase();
		
		return res.author.id === user.id && (yes.includes(value) || no.includes(value));
	}

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

/**
 * Escapes any Discord-flavour markdown in a string.
 * @param {string} text Content to escape
 * @param {boolean} [onlyCodeBlock=false] Whether to only escape codeblocks (takes priority)
 * @param {boolean} [onlyInlineCode=false] Whether to only escape inline code
 * @returns {string}
 */
export const escapeMarkdown = (text: string, onlyCodeBlock: boolean = false, onlyInlineCode: boolean = false) => {
	if (onlyCodeBlock) { return text.replace(/```/g, '`\u200b``'); }
	if (onlyInlineCode) { return text.replace(/\\(`|\\)/g, '$1').replace(/(`|\\)/g, '\\$1'); }

	return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1');
}

/**
 * Delete the calling message for commands, if it's deletable by the bot
 * 
 * @export
 * @param {CommandoMessage} msg
 * @param {CommandoClient} client
 * @returns void
 */
export const deleteCommandMessages = (msg: CommandoMessage, client: CommandoClient) => {
	if (msg.deletable && msg.guild.settings.get('deleteCommandMessages', false)) msg.delete();
}

/**
 * Stop the bot's typing status
 * 
 * @export
 * @param {CommandoMessage} msg
 * @returns void
 */
export const stopTyping = (msg: CommandoMessage) => {
	msg.channel.stopTyping(true);
}

/**
 * Start the bot's typing status
 * 
 * @export
 * @param {CommandoMessage} msg
 * @returns void
 */
export const startTyping = (msg: CommandoMessage) => {
	msg.channel.startTyping(1);
}
