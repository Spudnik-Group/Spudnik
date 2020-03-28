/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { modLogMessage, isCommandCategoryEnabled, isCommandEnabled } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import * as fs from 'fs';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed } from '@lib/helpers/embed-helpers';
import { commandOrCategory } from '@lib/helpers/resolvers';

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
			name: 'disable',
			permissionLevel: 6, // MANAGE_GUILD
			usage: '<cmdOrCat:command|cmdOrCat:string>'
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
	public async run(msg: KlasaMessage, [cmdOrCat]): Promise<KlasaMessage | KlasaMessage[]> {
		const disableEmbed: MessageEmbed = specialEmbed(msg, 'disable');

		if (typeof cmdOrCat === 'string') {
			// Category
			const groups: any[] = fs.readdirSync('commands')
				.filter(path => fs.statSync(`commands/${path}`).isDirectory());
			const parsedGroup: string = cmdOrCat.toLowerCase();

			if (!isCommandCategoryEnabled(msg, cmdOrCat)) {
				return msg.sendSimpleError(`The \`${cmdOrCat}\` category is already disabled.`, 3000);
			} else if (groups.find((g: string) => g === parsedGroup)) {
				await msg.guild.settings.update(GuildSettings.Commands.DisabledCategories, cmdOrCat.toLowerCase());

				disableEmbed.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Action:** Disabled the \`${cmdOrCat}\` category.`);

				await modLogMessage(msg, disableEmbed);

				return msg.sendEmbed(disableEmbed);
			}
			return msg.sendSimpleEmbed(`No groups matching that name. Use \`${msg.guild.settings.get(GuildSettings.Prefix)}commands\` to view a list of command groups.`, 3000);

		}
		// Command
		if (!isCommandEnabled(msg, cmdOrCat)) {
			return msg.sendSimpleError(`The \`${cmdOrCat.name}\` command is already disabled.`, 3000);
		}
		if (cmdOrCat.guarded) {
			return msg.sendSimpleError(`You cannot disable the \`${cmdOrCat.name}\` command.`, 3000);
		}
		await msg.guild.settings.update(GuildSettings.Commands.Disabled, cmdOrCat.name.toLowerCase());

		disableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Disabled the \`${cmdOrCat.name}\` command.`);
		await modLogMessage(msg, disableEmbed);

		return msg.sendEmbed(disableEmbed);


	}

}
