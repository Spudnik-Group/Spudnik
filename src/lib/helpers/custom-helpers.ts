/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel, MessageEmbed } from 'discord.js';
import { oneLine } from 'common-tags';
import { KlasaMessage, Command } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import * as fs from 'fs';

/**
 * Get Embed Color.
 *
 * @export
 * @param {KlasaMessage} msg
 * @returns number
 */
export const getEmbedColor = (msg: KlasaMessage): number => {
	let embedColor: number = parseInt(msg.guild.settings.get(GuildSettings.EmbedColor), 16);

	// This shouldn't happen, but if it does, return the default embed color
	if (embedColor > parseInt('FFFFFF', 16) || embedColor < 0) {
		embedColor = parseInt('555555', 16);
	}

	return embedColor;
};

/**
 * Log the message to the corresponding guild's mod log channel
 *
 * @export
 * @param {KlasaMessage} msg
 * @param {MessageEmbed} embed
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const modLogMessage = async (msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> | null => {
	const { guild } = msg;
	const outChannelID = guild.settings.get(GuildSettings.Modlog.Channel);
	const outChannel = (msg.guild.channels.get(outChannelID) as TextChannel);

	if (!guild.settings.get(GuildSettings.Modlog.InitialMessageSent)) {
		await msg.reply(oneLine`
			📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
			(or some other name configured by the ${guild.settings.get(GuildSettings.Prefix)}modlog command) and give me access to it.
			This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
		await guild.settings.update(GuildSettings.Modlog.InitialMessageSent, true);
	}

	return outChannelID && guild.settings.get(GuildSettings.Modlog.Enabled)
		? outChannel.sendEmbed(new MessageEmbed(embed))
		: null;
};

// TODO: add jsdoc
export const getPermissionsFromLevel = (permissionsLevel: number): string => {
	const permissionLevels = [
		'OPEN',
		'MANAGE_MESSAGES',
		'MANAGE_ROLES',
		'KICK_MEMBERS',
		'BAN_MEMBERS',
		'',
		'MANAGE_GUILD',
		'GUILD OWNER',
		'',
		'BOT OWNER',
		'BOT OWNER'
	];

	return permissionLevels[permissionsLevel];
};

// TODO: add jsdoc
export const getCommandCategories = (): string[] => fs.readdirSync('commands').filter((path: string) => fs.statSync(`commands/${path}`).isDirectory());

// TODO: add jsdoc
export const isValidCommandCategory = (categoryName: string): boolean => {
	const categories: any[] = fs.readdirSync('commands')
		.filter((path: string) => fs.statSync(`commands/${path}`).isDirectory());
	const parsedCategory: string = categoryName.toLowerCase();

	return Boolean(categories.find((g: string) => g === parsedCategory));
};

// TODO: add jsdoc
export const isCommandCategoryEnabled = (msg: KlasaMessage, categoryName: string): boolean => !msg.guild.settings.get(GuildSettings.Commands.DisabledCategories).includes(categoryName.toLowerCase());

// TODO: add jsdoc
export const isCommandEnabled = (msg: KlasaMessage, command: Command): boolean => !msg.guild.settings.get(GuildSettings.Commands.Disabled).includes(command.name.toLowerCase());

// TODO: add jsdoc
export const canCommandBeUsed = (msg: KlasaMessage, command: Command): boolean => {
	if (!isCommandCategoryEnabled(msg, command.category)) return false;
	if (!isCommandEnabled(msg, command)) return false;

	return true;
};
