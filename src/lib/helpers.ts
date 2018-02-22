import chalk from 'chalk';
import { Message } from 'discord.js';
import { CommandMessage } from 'discord.js-commando';
import * as fs from 'fs';

export function sendSimpleEmbeddedMessage(msg: CommandMessage, text: string, timeout?: number): Promise<Message | Message[]> {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: {
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`,
		},
		color: 5592405,
		description: `${text}`,
	});

	if (timeout) {
		promise.then((reply: Message | Message[]) => {
			if (reply instanceof Message) {
				reply.delete({ timeout }).catch(() => undefined);
			} else if (reply instanceof Array) {
				msg.channel.bulkDelete(reply);
			}
		});
	}
	return promise;
}
export function sendSimpleEmbeddedError(msg: CommandMessage, text: string, timeout?: number): Promise<Message | Message[]> {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: {
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`,
		},
		color: 16711680,
		description: `${text}`,
	});

	if (timeout) {
		promise.then((reply: Message | Message[]) => {
			if (reply instanceof Message) {
				reply.delete({ timeout }).catch(() => undefined);
			} else if (reply instanceof Array) {
				msg.channel.bulkDelete(reply);
			}
		});
	}
	return promise;
}
export function sendSimpleEmbeddedSuccess(msg: CommandMessage, text: string, timeout?: number): Promise<Message | Message[]> {
	const promise: Promise<Message | Message[]> = msg.embed({
		author: {
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`,
		},
		color: 3447003,
		description: `${text}`,
	});

	if (timeout) {
		promise.then((reply: Message | Message[]) => {
			if (reply instanceof Message) {
				reply.delete({ timeout }).catch(() => undefined);
			} else if (reply instanceof Array) {
				msg.channel.bulkDelete(reply);
			}
		});
	}
	return promise;
}
export function sendSimpleEmbeddedImage(msg: CommandMessage, url: string, description?: string): Promise<Message | Message[]> {
	return msg.embed({
		author: {
			icon_url: msg.guild.me.user.displayAvatarURL,
			name: `${msg.guild.me.user.username}`,
		},
		color: 3447003,
		description,
		image: { url },
	});
}
export function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function getFileContents(filePath: string): string {
	try {
		return fs.readFileSync(filePath, 'utf-8');
	} catch (err) {
		console.log(chalk.red(err));
		return '';
	}
}
export function getJsonObject(filePath: string): any {
	return JSON.parse(getFileContents(filePath));
}
export function resolveMention(usertxt: string): string {
	let userid = usertxt;
	if (usertxt.startsWith('<@!')) {
		userid = usertxt.substr(3, usertxt.length - 4);
	} else if (usertxt.startsWith('<@')) {
		userid = usertxt.substr(2, usertxt.length - 3);
	}
	return userid;
}
