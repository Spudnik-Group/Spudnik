/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { modLogMessage, isCommandCategoryEnabled, isCommandEnabled } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import * as fs from 'fs';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { commandOrCategory } from '@lib/helpers/resolvers';
import { specialEmbed } from '@lib/helpers/embed-helpers';

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
	 * @memberof EnableCommand
	 */
	public async run(msg: KlasaMessage, [cmdOrCat]): Promise<KlasaMessage | KlasaMessage[]> {
		const enableEmbed: MessageEmbed = specialEmbed(msg, 'enable');

		if (typeof cmdOrCat === 'string') {
			// Category
			const groups: any[] = fs.readdirSync('commands')
				.filter(path => fs.statSync(`commands/${path}`).isDirectory());
			const parsedGroup: string = cmdOrCat.toLowerCase();

			if (isCommandCategoryEnabled(msg, cmdOrCat)) {
				return msg.sendSimpleError(`The \`${cmdOrCat}\` category is already enabled.`, 3000);
			} else if (groups.find((g: string) => g === parsedGroup)) {
				await msg.guild.settings.update(GuildSettings.Commands.DisabledCategories, cmdOrCat.toLowerCase());

				enableEmbed.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Action:** Enabled the \`${cmdOrCat}\` category.`);

				await modLogMessage(msg, enableEmbed);

				return msg.sendEmbed(enableEmbed);
			}
			return msg.sendSimpleEmbed(`No groups matching that name. Use \`${msg.guild.settings.get(GuildSettings.Prefix)}commands\` to view a list of command groups.`, 3000);

		}
		// Command
		if (isCommandEnabled(msg, cmdOrCat)) {
			return msg.sendSimpleError(`The \`${cmdOrCat.name}\` command is already enabled.`, 3000);
		}
		await msg.guild.settings.update(GuildSettings.Commands.Disabled, cmdOrCat.name.toLowerCase());

		enableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Enabled the \`${cmdOrCat.name}\` command${isCommandCategoryEnabled(msg, cmdOrCat.category) ? '' : `, but the \`${cmdOrCat.category}\` category is disabled, so it still can't be used`}.`);

		await modLogMessage(msg, enableEmbed);

		return msg.sendEmbed(enableEmbed);
	}

}
