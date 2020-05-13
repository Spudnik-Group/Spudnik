/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, Possible, KlasaMessage } from 'klasa';
import { standardPlatforms } from '@lib/constants/game-platforms';
import { resolveChannel } from './base';
import { list } from '@lib/utils/util';
import { isValidCommandCategory } from './custom-helpers';

// TODO: add jsdoc
export const commandOrCategory = (cmdOrCategory: string): string => {
	if (!cmdOrCategory) throw 'Please provide a valid command or command category name';
	const command = this.client.commands.array().find((command: Command) => command.name.toLowerCase() === cmdOrCategory.toLowerCase());
	if (command) return cmdOrCategory; // Valid command name

	if (isValidCommandCategory(cmdOrCategory)) return cmdOrCategory; // Valid category name

	throw 'Please provide a valid command or command category name';
};

// TODO: add jsdoc
export const platform = (platform: string): string => {
	if (standardPlatforms.includes(platform.toLowerCase())) return platform;

	throw `Please provide a valid platform. Options are: ${list(standardPlatforms, 'or')}.`;
};

// TODO: add jsdoc
export const basicFeatureContent = (arg: string, possible: Possible, message: KlasaMessage, [subCommand]: [string]): any => {
	if (subCommand === 'channel' && (!arg || !message.guild.channels.get(resolveChannel(arg)))) throw 'Please provide a channel for the message to be displayed in.';
	if (subCommand === 'message' && !arg) throw 'Please include the new text for the message.';

	return arg;
};
