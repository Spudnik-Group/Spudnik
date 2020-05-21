/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { modLogMessage, isCommandCategoryEnabled, isCommandEnabled } from '@lib/helpers/custom-helpers';
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
			usage: '<commandOrCategory:commandOrCategory>'
		});

		this.createCustomResolver('commandOrCategory', commandOrCategory);
	}

	/**
	 * Run the "DisableCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} commandOrCategory
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DisableCommand
	 */
	public async run(msg: KlasaMessage, [commandOrCategory]: [Command|string]): Promise<KlasaMessage | KlasaMessage[]> {
		const disableEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Disable);

		if (typeof commandOrCategory === 'string') {
			// Category
			if (!isCommandCategoryEnabled(msg, commandOrCategory)) return msg.sendSimpleError(`The \`${commandOrCategory}\` category is already disabled.`, 3000);
			if (requiredCategories.includes(commandOrCategory)) return msg.sendSimpleError(`You cannot disable the \`${commandOrCategory}\` category.`, 3000);

			await msg.guild.settings.update(GuildSettings.Commands.DisabledCategories, commandOrCategory.toLowerCase());

			disableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Disabled the \`${commandOrCategory}\` category.`);

			await modLogMessage(msg, disableEmbed);

			return msg.sendEmbed(disableEmbed);
		}
		// Command
		if (!isCommandEnabled(msg, commandOrCategory)) return msg.sendSimpleError(`The \`${commandOrCategory.name}\` command is already disabled.`, 3000);
		if (commandOrCategory.guarded) return msg.sendSimpleError(`You cannot disable the \`${commandOrCategory.name}\` command.`, 3000);

		await msg.guild.settings.update(GuildSettings.Commands.Disabled, commandOrCategory.name.toLowerCase());

		disableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Disabled the \`${commandOrCategory.name}\` command.`);

		await modLogMessage(msg, disableEmbed);

		return msg.sendEmbed(disableEmbed);
	}

}
