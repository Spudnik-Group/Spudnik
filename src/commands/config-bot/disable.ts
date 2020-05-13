/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { modLogMessage, isCommandCategoryEnabled, isCommandEnabled, isValidCommandCategory } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { commandOrCategory } from '@lib/helpers/resolvers';

const requiredCategories = ['bot-info', 'config-bot', 'help'];

/**
 * Disables a command or command category.
 *
 * @export
 * @class DisableCommand
 * @extends {Command}
 */
export default class DisableCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			description: 'Disables a command or command category.',
			guarded: true,
			permissionLevel: 6, // MANAGE_GUILD
			usage: '<cmdOrCat:optional-command|cmdOrCat:string>'
		});

		this.createCustomResolver('cmdOrCat', commandOrCategory);
	}

	/**
	 * Run the "DisableCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} cmdOrCat
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DisableCommand
	 */
	public async run(msg: KlasaMessage, [cmdOrCat]: [Command|string]): Promise<KlasaMessage | KlasaMessage[]> {
		const disableEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Disable);

		if (typeof cmdOrCat === 'string') {
			// Category
			if (!isValidCommandCategory(cmdOrCat)) return msg.sendSimpleEmbed(`No commands or command categories matching that name. Use \`${msg.guild.settings.get(GuildSettings.Prefix)}commands\` to view a list of command categories.`, 3000);
			if (!isCommandCategoryEnabled(msg, cmdOrCat)) return msg.sendSimpleError(`The \`${cmdOrCat}\` category is already disabled.`, 3000);
			if (requiredCategories.includes(cmdOrCat)) return msg.sendSimpleError(`You cannot disable the \`${cmdOrCat}\` category.`, 3000);

			await msg.guild.settings.update(GuildSettings.Commands.DisabledCategories, cmdOrCat.toLowerCase());

			disableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Disabled the \`${cmdOrCat}\` category.`);

			await modLogMessage(msg, disableEmbed);

			return msg.sendEmbed(disableEmbed);
		}
		// Command
		if (!isCommandEnabled(msg, cmdOrCat)) return msg.sendSimpleError(`The \`${cmdOrCat.name}\` command is already disabled.`, 3000);
		if (cmdOrCat.guarded) return msg.sendSimpleError(`You cannot disable the \`${cmdOrCat.name}\` command.`, 3000);

		await msg.guild.settings.update(GuildSettings.Commands.Disabled, cmdOrCat.name.toLowerCase());

		disableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Disabled the \`${cmdOrCat.name}\` command.`);

		await modLogMessage(msg, disableEmbed);

		return msg.sendEmbed(disableEmbed);
	}

}
