/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { modLogMessage, isCommandCategoryEnabled, isCommandEnabled, isValidCommandCategory } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { commandOrCategory } from '@lib/helpers/resolvers';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Enables a command or command group.
 *
 * @export
 * @class EnableCommand
 * @extends {Command}
 */
export default class EnableCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['enable-command', 'cmd-off', 'command-off'],
			description: 'Enables a command or command group.',
			guarded: true,
			name: 'enable',
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
	 * @memberof EnableCommand
	 */
	public async run(msg: KlasaMessage, [cmdOrCat]: [Command|string]): Promise<KlasaMessage | KlasaMessage[]> {
		const enableEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Enable);

		if (typeof cmdOrCat === 'string') {
			// Category
			if (!isValidCommandCategory(cmdOrCat)) return msg.sendSimpleEmbed(`No commands or command categories matching that name. Use \`${msg.guild.settings.get(GuildSettings.Prefix)}commands\` to view a list of command categories.`, 3000);
			if (isCommandCategoryEnabled(msg, cmdOrCat)) return msg.sendSimpleError(`The \`${cmdOrCat}\` category is already enabled.`, 3000);

			await msg.guild.settings.update(GuildSettings.Commands.DisabledCategories, cmdOrCat.toLowerCase());

			enableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Enabled the \`${cmdOrCat}\` category.`);

			await modLogMessage(msg, enableEmbed);

			return msg.sendEmbed(enableEmbed);
		}
		// Command
		if (isCommandEnabled(msg, cmdOrCat)) return msg.sendSimpleError(`The \`${cmdOrCat.name}\` command is already enabled.`, 3000);

		await msg.guild.settings.update(GuildSettings.Commands.Disabled, cmdOrCat.name.toLowerCase());

		enableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Enabled the \`${cmdOrCat.name}\` command${isCommandCategoryEnabled(msg, cmdOrCat.category) ? '' : `, but the \`${cmdOrCat.category}\` category is disabled, so it still can't be used`}.`);

		await modLogMessage(msg, enableEmbed);

		return msg.sendEmbed(enableEmbed);
	}

}
