/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, Possible, KlasaMessage } from 'klasa';
import * as fs from 'fs';
import { standardPlatforms } from '@lib/constants/game-platforms';
import { list, resolveChannel } from './helpers';

export const hexColor = color => {
	if (!color) return;
	if (!isNaN(color.match(/^ *[a-f0-9]{6} *$/i) ? parseInt(color, 16) : NaN)) {
		return color;
	}

	throw 'Please provide a valid color hex number.';
};

export const commandOrCategory = cmdOrCategory => {
	if (!cmdOrCategory) throw 'Please provide a valid command or command category name';
	const command = this.client.commands.array().find((command: Command) => command.name.toLowerCase() === cmdOrCategory.toLowerCase());
	if (command) return cmdOrCategory; // Valid command name

	const categories: any[] = fs.readdirSync('commands')
		.filter(path => fs.statSync(`commands/${path}`).isDirectory());
	const category = categories.find(category => category === cmdOrCategory.toLowerCase());
	if (category) return cmdOrCategory; // Valid category name

	throw 'Please provide a valid command or command category name';
};

export const battletag = tag => {
	if (tag.match(/(\w{3,12})#(\d{4,5})/i)) return tag;

	throw 'Please provide a valid battletag in the format: `username#0000`';
};

export const platform = platform => {
	if (standardPlatforms.includes(platform)) return platform;

	throw `Please provide a valid platform. Options are: ${list(standardPlatforms, 'or')}.`;
};

export const basicFeatureContent = (arg: string, possible: Possible, message: KlasaMessage, [subCommand]) => {
	if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw 'Please provide a channel for the Goodbye message to be displayed in.';
	if (subCommand === 'message' && !arg) throw 'Please include the new text for the Goodbye message.';

	return arg;
};
