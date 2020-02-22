/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Channel, TextChannel, User, PermissionString, Message } from 'discord.js';
import { KlasaMessage } from 'klasa';

const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea'];
const no = ['no', 'n', 'nah', 'nope'];

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

export const resolveChannel = (channeltxt: string): string => {
	let channelid = channeltxt;

	if (channeltxt && channeltxt.startsWith('<#!')) {
		channelid = channeltxt.substr(3, channeltxt.length - 4);
	} else if (channeltxt && channeltxt.startsWith('<#')) {
		channelid = channeltxt.substr(2, channeltxt.length -3);
	} else {
		return null;
	}


	return channelid;
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
 * @param {string} algorithm
 * @returns string
 */
export const hash = (text: string, algorithm: string): string => {
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
 * @param  {any[]} items
 * @param  {string} label
 * @param  {} property='name'
 * @returns string
 */
export const disambiguation = (items: any[], label: string, property = 'name'): string => {
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
 * @param  {KlasaMessage} msg
 * @param  {number} max
 * @param  {number} min
 * @param  {} {text='joingame', time=30000, dmCheck=false}
 * @returns Promise
 */
export const awaitPlayers = async (msg: KlasaMessage, max: number, min: number, { text = 'join game', time = 30000, dmCheck = false } = {}): Promise<any> => {
	const joined: string[] = [];

	joined.push(msg.author.id);

	const verify = await msg.channel.awaitMessages((res: Message) => {
		if (res.author.bot) { return false; }

		if (joined.includes(res.author.id)) { return false; }

		if (res.content.toLowerCase() !== text.toLowerCase()) { return false; }

		joined.push(res.author.id);
		res.react('✅').catch((): void => null);

		return true;
	}, { max: max, time: time });

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

	return verify.map((message: KlasaMessage) => message.author);
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
export const verify = async (channel: Channel, user: User, time: number = 30000): Promise<boolean | 0> => {
	const verify = await (channel as TextChannel).awaitMessages((res: Message) => {
		const value = res.content.toLowerCase();

		return res.author.id === user.id && (yes.includes(value) || no.includes(value));
	}, {
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

// TODO: add jsdoc
export const isNormalInteger = (str: string) => {
	const n = Math.floor(Number(str));

	return String(n) === str && n >= 0;
}

export const getPermissionsFromBitfield = (permissions): Array<PermissionString> => {
	const permissionsList = [];
	if (permissions.has('ADMINISTRATOR')) permissionsList.push('ADMINISTRATOR')
	if (permissions.has('CREATE_INSTANT_INVITE')) permissionsList.push('CREATE_INSTANT_INVITE')
	if (permissions.has('KICK_MEMBERS')) permissionsList.push('KICK_MEMBERS')
	if (permissions.has('BAN_MEMBERS')) permissionsList.push('BAN_MEMBERS')
	if (permissions.has('MANAGE_CHANNELS')) permissionsList.push('MANAGE_CHANNELS')
	if (permissions.has('MANAGE_GUILD')) permissionsList.push('MANAGE_GUILD')
	if (permissions.has('ADD_REACTIONS')) permissionsList.push('ADD_REACTIONS')
	if (permissions.has('VIEW_AUDIT_LOG')) permissionsList.push('VIEW_AUDIT_LOG')
	if (permissions.has('PRIORITY_SPEAKER')) permissionsList.push('PRIORITY_SPEAKER')
	if (permissions.has('STREAM')) permissionsList.push('STREAM')
	if (permissions.has('VIEW_CHANNEL')) permissionsList.push('VIEW_CHANNEL')
	if (permissions.has('SEND_MESSAGES')) permissionsList.push('SEND_MESSAGES')
	if (permissions.has('SEND_TTS_MESSAGES')) permissionsList.push('SEND_TTS_MESSAGES')
	if (permissions.has('MANAGE_MESSAGES')) permissionsList.push('MANAGE_MESSAGES')
	if (permissions.has('EMBED_LINKS')) permissionsList.push('EMBED_LINKS')
	if (permissions.has('ATTACH_FILES')) permissionsList.push('ATTACH_FILES')
	if (permissions.has('READ_MESSAGE_HISTORY')) permissionsList.push('READ_MESSAGE_HISTORY')
	if (permissions.has('MENTION_EVERYONE')) permissionsList.push('MENTION_EVERYONE')
	if (permissions.has('USE_EXTERNAL_EMOJIS')) permissionsList.push('USE_EXTERNAL_EMOJIS')
	if (permissions.has('CONNECT')) permissionsList.push('CONNECT')
	if (permissions.has('SPEAK')) permissionsList.push('SPEAK')
	if (permissions.has('MUTE_MEMBERS')) permissionsList.push('MUTE_MEMBERS')
	if (permissions.has('DEAFEN_MEMBERS')) permissionsList.push('DEAFEN_MEMBERS')
	if (permissions.has('MOVE_MEMBERS')) permissionsList.push('MOVE_MEMBERS')
	if (permissions.has('USE_VAD')) permissionsList.push('USE_VAD')
	if (permissions.has('CHANGE_NICKNAME')) permissionsList.push('CHANGE_NICKNAME')
	if (permissions.has('MANAGE_NICKNAMES')) permissionsList.push('MANAGE_NICKNAMES')
	if (permissions.has('MANAGE_ROLES')) permissionsList.push('MANAGE_ROLES')
	if (permissions.has('MANAGE_WEBHOOKS')) permissionsList.push('MANAGE_WEBHOOKS')
	if (permissions.has('MANAGE_EMOJIS')) permissionsList.push('MANAGE_EMOJIS')

	return permissionsList;
}
