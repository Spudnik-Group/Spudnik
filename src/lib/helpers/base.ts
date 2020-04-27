/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Channel, TextChannel, User, PermissionString, Message, Permissions } from 'discord.js';
import { KlasaMessage } from 'klasa';

const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea'];
const no = ['no', 'n', 'nah', 'nope'];

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
};

// TODO: add jsdoc
export const resolveChannel = (channeltxt: string): string => {
	let channelid = channeltxt;

	if (channeltxt && channeltxt.startsWith('<#!')) {
		channelid = channeltxt.substr(3, channeltxt.length - 4);
	} else if (channeltxt && channeltxt.startsWith('<#')) {
		channelid = channeltxt.substr(2, channeltxt.length - 3);
	} else {
		return null;
	}


	return channelid;
};

/**
 * Waits for players for the current instance of a text-based game.
 *
 * @param  {KlasaMessage} msg
 * @param  {number} max
 * @param  {number} min
 * @param  {} {text='joingame', time=30000, dmCheck=false}
 * @returns Promise
 */
export const awaitPlayers = async (msg: KlasaMessage, max: number, min: number, { text = 'join game', time = 30000, dmCheck = false }: any = {}): Promise<any> => {
	const joined: string[] = [];

	joined.push(msg.author.id);

	const verify = await msg.channel.awaitMessages((res: Message) => {
		if (res.author.bot) return false;

		if (joined.includes(res.author.id)) return false;

		if (res.content.toLowerCase() !== text.toLowerCase()) return false;

		joined.push(res.author.id);
		res.react('✅').catch((): void => null);

		return true;
	}, { max, time });

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

	if (verify.size < min) return false;

	return verify.map((message: KlasaMessage) => message.author);
};
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
		time
	});

	if (!verify.size) return 0;

	const choice = verify.first().content.toLowerCase();

	if (yes.includes(choice)) return true;
	if (no.includes(choice)) return false;

	return false;
};

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
	if (onlyCodeBlock) return text.replace(/```/g, '`\u200b``');
	if (onlyInlineCode) return text.replace(/\\(`|\\)/g, '$1').replace(/(`|\\)/g, '\\$1');

	return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1').replace(/\<(\#|\@)([0-9]{18})\>/g, '<\\$1$2>');
};

// TODO: add jsdoc
export const getPermissionsFromBitfield = (permissions: Permissions): Array<PermissionString> => {
	const permissionsList = [];
	if (permissions.has('ADMINISTRATOR')) permissionsList.push('ADMINISTRATOR');
	if (permissions.has('CREATE_INSTANT_INVITE')) permissionsList.push('CREATE_INSTANT_INVITE');
	if (permissions.has('KICK_MEMBERS')) permissionsList.push('KICK_MEMBERS');
	if (permissions.has('BAN_MEMBERS')) permissionsList.push('BAN_MEMBERS');
	if (permissions.has('MANAGE_CHANNELS')) permissionsList.push('MANAGE_CHANNELS');
	if (permissions.has('MANAGE_GUILD')) permissionsList.push('MANAGE_GUILD');
	if (permissions.has('ADD_REACTIONS')) permissionsList.push('ADD_REACTIONS');
	if (permissions.has('VIEW_AUDIT_LOG')) permissionsList.push('VIEW_AUDIT_LOG');
	if (permissions.has('PRIORITY_SPEAKER')) permissionsList.push('PRIORITY_SPEAKER');
	if (permissions.has('STREAM')) permissionsList.push('STREAM');
	if (permissions.has('VIEW_CHANNEL')) permissionsList.push('VIEW_CHANNEL');
	if (permissions.has('SEND_MESSAGES')) permissionsList.push('SEND_MESSAGES');
	if (permissions.has('SEND_TTS_MESSAGES')) permissionsList.push('SEND_TTS_MESSAGES');
	if (permissions.has('MANAGE_MESSAGES')) permissionsList.push('MANAGE_MESSAGES');
	if (permissions.has('EMBED_LINKS')) permissionsList.push('EMBED_LINKS');
	if (permissions.has('ATTACH_FILES')) permissionsList.push('ATTACH_FILES');
	if (permissions.has('READ_MESSAGE_HISTORY')) permissionsList.push('READ_MESSAGE_HISTORY');
	if (permissions.has('MENTION_EVERYONE')) permissionsList.push('MENTION_EVERYONE');
	if (permissions.has('USE_EXTERNAL_EMOJIS')) permissionsList.push('USE_EXTERNAL_EMOJIS');
	if (permissions.has('CONNECT')) permissionsList.push('CONNECT');
	if (permissions.has('SPEAK')) permissionsList.push('SPEAK');
	if (permissions.has('MUTE_MEMBERS')) permissionsList.push('MUTE_MEMBERS');
	if (permissions.has('DEAFEN_MEMBERS')) permissionsList.push('DEAFEN_MEMBERS');
	if (permissions.has('MOVE_MEMBERS')) permissionsList.push('MOVE_MEMBERS');
	if (permissions.has('USE_VAD')) permissionsList.push('USE_VAD');
	if (permissions.has('CHANGE_NICKNAME')) permissionsList.push('CHANGE_NICKNAME');
	if (permissions.has('MANAGE_NICKNAMES')) permissionsList.push('MANAGE_NICKNAMES');
	if (permissions.has('MANAGE_ROLES')) permissionsList.push('MANAGE_ROLES');
	if (permissions.has('MANAGE_WEBHOOKS')) permissionsList.push('MANAGE_WEBHOOKS');
	if (permissions.has('MANAGE_EMOJIS')) permissionsList.push('MANAGE_EMOJIS');

	return permissionsList;
};
