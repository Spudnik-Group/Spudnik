/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Message, MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { getEmbedColor } from './custom-helpers';

/**
 * Post a simple embedded message.
 *
 * @export
 * @param {KlasaMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const sendSimpleEmbeddedMessage = (msg: KlasaMessage, text: string, timeout?: number): Promise<KlasaMessage | KlasaMessage[]> => {
	const promise: Promise<KlasaMessage | KlasaMessage[]> = msg.sendEmbed(new MessageEmbed({
		author: {
			iconURL: msg.client.user.displayAvatarURL(),
			name: `${msg.client.user.username}`
		},
		color: getEmbedColor(msg),
		description: `${text}`
	}));

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
 * @param {KlasaMessage} msg
 * @param {string} text
 * @param {MessageEmbed['author']} author
 * @param {number} [timeout]
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const sendSimpleEmbeddedMessageWithAuthor = (msg: KlasaMessage, text: string, author: MessageEmbed['author'], timeout?: number): Promise<KlasaMessage | KlasaMessage[]> => {
	const promise: Promise<KlasaMessage | KlasaMessage[]> = msg.sendEmbed(new MessageEmbed({
		author: author,
		color: getEmbedColor(msg),
		description: `${text}`
	}));

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
 * @param {KlasaMessage} msg
 * @param {string} text
 * @param {string} title
 * @param {number} [timeout]
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const sendSimpleEmbeddedMessageWithTitle = (msg: KlasaMessage, text: string, title: string, timeout?: number): Promise<KlasaMessage | KlasaMessage[]> => {
	const promise: Promise<KlasaMessage | KlasaMessage[]> = msg.sendEmbed(new MessageEmbed({
		author: {
			iconURL: msg.client.user.displayAvatarURL(),
			name: `${msg.client.user.username}`
		},
		color: getEmbedColor(msg),
		description: `${text}`,
		title: `${title}`
	}));

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
 * @param {KlasaMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const sendSimpleEmbeddedError = (msg: KlasaMessage, text: string, timeout?: number): Promise<KlasaMessage | KlasaMessage[]> => {
	const promise: Promise<KlasaMessage | KlasaMessage[]> = msg.sendEmbed(new MessageEmbed({
		author: {
			iconURL: msg.client.user.displayAvatarURL(),
			name: `${msg.client.user.username}`
		},
		color: 16711680,
		description: `${text}`
	}));

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
 * @param {KlasaMessage} msg
 * @param {string} text
 * @param {number} [timeout]
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const sendSimpleEmbeddedSuccess = (msg: KlasaMessage, text: string, timeout?: number): Promise<KlasaMessage | KlasaMessage[]> => {
	const promise: Promise<KlasaMessage | KlasaMessage[]> = msg.sendEmbed(new MessageEmbed({
		author: {
			iconURL: msg.client.user.displayAvatarURL(),
			name: `${msg.client.user.username}`
		},
		color: 3447003,
		description: `${text}`
	}));

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
 * @param {KlasaMessage} msg
 * @param {string} url
 * @param {string} [description]
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const sendSimpleEmbeddedImage = (msg: KlasaMessage, url: string, description?: string): Promise<KlasaMessage | KlasaMessage[]> => {
	return msg.sendEmbed(new MessageEmbed({
		author: {
			iconURL: msg.client.user.displayAvatarURL(),
			name: `${msg.client.user.username}`
		},
		color: 3447003,
		description: description,
		image: { url: url }
	}));
}
