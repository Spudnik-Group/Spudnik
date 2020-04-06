/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, Possible, KlasaMessage } from 'klasa';
import * as fs from 'fs';
import { standardPlatforms } from '@lib/constants/game-platforms';
import { list, resolveChannel } from './base';

export const hexColor = (color: string): string|number => {
	if (!color) return;
	if (!isNaN(color.match(/^ *[a-f0-9]{6} *$/i) ? parseInt(color, 16) : NaN)) {
		return color;
	}

	throw new Error('Please provide a valid color hex number.');
};

export const commandOrCategory = (cmdOrCategory: string): string => {
	if (!cmdOrCategory) throw new Error('Please provide a valid command or command category name');
	const command = this.client.commands.array().find((command: Command) => command.name.toLowerCase() === cmdOrCategory.toLowerCase());
	if (command) return cmdOrCategory; // Valid command name

	const categories: any[] = fs.readdirSync('commands')
		.filter((path: string) => fs.statSync(`commands/${path}`).isDirectory());
	const category = categories.find((category: any) => category === cmdOrCategory.toLowerCase());
	if (category) return cmdOrCategory; // Valid category name

	throw new Error('Please provide a valid command or command category name');
};

export const battletag = (tag: string): string => {
	if (tag.match(/(\w{3,12})#(\d{4,5})/i)) return tag;

	throw new Error('Please provide a valid battletag in the format: `username#0000`');
};

export const platform = (platform: string): string => {
	if (standardPlatforms.includes(platform.toLowerCase())) return platform;

	throw new Error(`Please provide a valid platform. Options are: ${list(standardPlatforms, 'or')}.`);
};

export const basicFeatureContent = (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]): any => {
	if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw new Error('Please provide a channel for the message to be displayed in.');
	if (subCommand === 'message' && !arg) throw new Error('Please include the new text for the message.');

	return arg;
};
