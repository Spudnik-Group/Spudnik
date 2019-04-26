import { Message, MessageEmbed, Channel, TextChannel, User } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { getEmbedColor } from './custom-helpers';

const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea'];
const no = ['no', 'n', 'nah', 'nope'];

/**
 * Post a simple embedded message.
 *
 * @export
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedMessage = (msg: CommandoMessage, text: string, timeout?: number): Promise<Message | Message[]> => {
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
 * Post a simple embedded message, with supplied author details.
 *
 * @export
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {MessageEmbed['author']} author
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedMessageWithAuthor = (msg: CommandoMessage, text: string, author: MessageEmbed['author'], timeout?: number): Promise<Message | Message[]> => {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: author,
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
 * Post a simple embedded message, with supplied title.
 *
 * @export
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {string} title
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedMessageWithTitle = (msg: CommandoMessage, text: string, title: string, timeout?: number): Promise<Message | Message[]> => {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: {
			icon_url: msg.client.user.displayAvatarURL,
			name: `${msg.client.user.username}`
		},
		color: getEmbedColor(msg),
		description: `${text}`,
		title: `${title}`
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
 * Post a simple embedded error message.
 *
 * @export
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedError = (msg: CommandoMessage, text: string, timeout?: number): Promise<Message | Message[]> => {
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
 * Send a simple embedded success message.
 *
 * @export
 * @param {CommandoMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedSuccess = (msg: CommandoMessage, text: string, timeout?: number): Promise<Message | Message[]> => {
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
 * Post a simple embedded image.
 *
 * @export
 * @param {CommandoMessage} msg
 * @param {string} url
 * @param {string} [description]
 * @returns Promise<Message | Message[]>
 */
export const sendSimpleEmbeddedImage = (msg: CommandoMessage, url: string, description?: string): Promise<Message | Message[]> => {
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
 * Generate a random integer, from supplied min and max values.
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns number
 */
export const getRandomInt = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a mention of the supplied user text.
 *
 * @export
 * @param {string} usertxt
 * @returns string
 */
export const resolveMention = (usertxt: string): string => {
	let userid = usertxt;

	if (usertxt.startsWith('<@!')) {
		userid = usertxt.substr(3, usertxt.length - 4);
	} else if (usertxt.startsWith('<@')) {
		userid = usertxt.substr(2, usertxt.length - 3);
	}

	return userid;
}

/**
 * Returns a timeout as a promise.
 *
 * @export
 * @param {number} ms
 * @returns Promise<any>
 */
export const delay = (ms: number): Promise<any> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Returns a shuffled version of the supplied array.
 * 
 * @export
 * @param  {any[]} array
 * @returns any[]
 */
export const shuffle = (array: any[]): any[] => {
	const arr = array.slice(0);

	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}

	return arr;
}
/**
 * Returns a string of values from a supplied array.
 * 
 * @param  {any[]} arr
 * @param  {} conj='and'
 * @returns string
 */
export const list = (arr: any[], conj = 'and'): string => {
	const len = arr.length;

	return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
}
/**
 * Returns a shortened version of the supplied string, appended with an ellipses.
 * 
 * @param  {string} text
 * @param  {} maxLen=2000
 * @returns string
 */
export const shorten = (text: string, maxLen = 2000): string => {
	return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
}

/**
 * Returns a formatted duration from a supplied number.
 * 
 * @param  {number} ms
 * @returns string
 */
export const duration = (ms: number): string => {
	const sec = Math.floor((ms / 1000) % 60).toString();
	const min = Math.floor((ms / (1000 * 60)) % 60).toString();
	const hrs = Math.floor(ms / (1000 * 60 * 60)).toString();

	return `${hrs.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`;
}

/**
 * Returns a trimmed array.
 * 
 * @param  {any[]} arr
 * @param  {} maxLen=10
 * @returns any
 */
export const trimArray = (arr: any[], maxLen = 10): any[] => {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`${len} more...`);
	}

	return arr;
}

/**
 * Returns a cryptographic hash of the supplied text.
 * 
 * @param {string} text 
 * @param {any} algorithm
 * @returns string
 */
export const hash = (text: string, algorithm: any): string => {
	return require('crypto').createHash(algorithm).update(text).digest('hex');
}

/**
 * Returns the beginning of the current day.
 * 
 * @param {number} timeZone
 * @returns Date
 */
export const today = (timeZone: number): Date => {
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

/**
 * @param  {any} items
 * @param  {any} label
 * @param  {} property='name'
 * @returns string
 */
export const disambiguation = (items: any, label: any, property = 'name'): string => {
	const itemList = items.map((item: any) => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');

	return `Multiple ${label} found, please be more specific: ${itemList}`;
}

/**
 * Returns the beginning of the next day.
 * 
 * @param  {number} timeZone
 * @returns Date
 */
export const tomorrow = (timeZone: number): Date => {
	const thisDate = today(timeZone);
	thisDate.setDate(thisDate.getDate() + 1);

	return thisDate;
}
/**
 * Waits for players for the current instance of a text-based game.
 * 
 * @param  {any} msg
 * @param  {number} max
 * @param  {number} min
 * @param  {} {text='joingame', time=30000, dmCheck=false}
 * @returns Promise
 */
export const awaitPlayers = async(msg: any, max: number, min: number, { text = 'join game', time = 30000, dmCheck = false } = {}): Promise<any> => {
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
/**
 * Verify's a potential player entering an instance of a text-based game.
 * 
 * @export
 * @param {Channel} channel
 * @param {User} user
 * @param {number} [time=30000]
 * @returns Promise
 */
export const verify = async(channel: Channel, user: User, time: number = 30000): Promise<boolean | 0> => {
	const filter = (res: any) => {
		const value = res.content.toLowerCase();
		
		return res.author.id === user.id && (yes.includes(value) || no.includes(value));
	}

	const verify = await (channel as TextChannel).awaitMessages(filter, {
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
 * 
 * @export
 * @param {string} text Content to escape
 * @param {boolean} [onlyCodeBlock=false] Whether to only escape codeblocks (takes priority)
 * @param {boolean} [onlyInlineCode=false] Whether to only escape inline code
 * @returns string
 */
export const escapeMarkdown = (text: string, onlyCodeBlock: boolean = false, onlyInlineCode: boolean = false): string => {
	if (onlyCodeBlock) { return text.replace(/```/g, '`\u200b``'); }
	if (onlyInlineCode) { return text.replace(/\\(`|\\)/g, '$1').replace(/(`|\\)/g, '\\$1'); }

	return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1');
}

/**
 * Stop the bot's typing status
 * 
 * @export
 * @param {CommandoMessage} msg
 * @returns void
 */
export const stopTyping = (msg: CommandoMessage): void => {
	msg.channel.stopTyping(true);
}

/**
 * Start the bot's typing status
 * 
 * @export
 * @param {CommandoMessage} msg
 * @returns void
 */
export const startTyping = (msg: CommandoMessage): void => {
	msg.channel.startTyping(1);
}
