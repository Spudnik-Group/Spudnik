/**
 * Copyright (c) 2020 Spudnik Group
 */

import { TextChannel, MessageEmbed } from 'discord.js';
import { oneLine } from 'common-tags';
import { KlasaMessage, Command } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

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
}

/**
 * Log the message to the corresponding guild's mod log channel
 * 
 * @export
 * @param {KlasaMessage} msg
 * @param {MessageEmbed} embed
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const modLogMessage = (msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> | null => {
	const guild = msg.guild;
	const outChannelID = guild.settings.get(GuildSettings.Modlog.Channel);
	const outChannel = (msg.guild.channels.get(outChannelID) as TextChannel);

	if (!guild.settings.get(GuildSettings.Modlog.InitialMessageSent)) {
		msg.reply(oneLine`
			📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
			(or some other name configured by the ${guild.settings.get(GuildSettings.Prefix)}modlog command) and give me access to it.
			This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
		guild.settings.update(GuildSettings.Modlog.InitialMessageSent, true);
	}

	return outChannelID && guild.settings.get(GuildSettings.Modlog.Enabled)
		? outChannel.sendEmbed(new MessageEmbed(embed))
		: null;
}

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
}

export const isCommandCategoryEnabled = (msg: KlasaMessage, commandCategory: string): boolean => {
	return !msg.guild.settings.get(GuildSettings.Commands.DisabledCategories).includes(commandCategory.toLowerCase());
}

export const isCommandEnabled = (msg: KlasaMessage, command: Command): boolean => {
	return !msg.guild.settings.get(GuildSettings.Commands.Disabled).includes(command.name.toLowerCase())
}

export const canCommandBeUsed = (msg: KlasaMessage, command: Command): boolean => {
	if (!isCommandCategoryEnabled(msg, command.category)) return false;
	if (!isCommandEnabled(msg, command)) return false;

	return true;
}
