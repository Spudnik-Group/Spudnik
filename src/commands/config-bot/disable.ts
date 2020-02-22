/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { getEmbedColor, sendSimpleEmbeddedError, modLogMessage, isCommandCategoryEnabled, isCommandEnabled, commandOrCategory, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import * as fs from 'fs';

/**
 * Disables a command or command category.
 *
 * @export
 * @class DisableCommand
 * @extends {Command}
 */
export default class DisableCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			description: 'Disables a command or command category.',
			guarded: true,
			name: 'disable',
			permissionLevel: 6, // MANAGE_GUILD
			usage: '<cmdOrCat:command|cmdOrCat:string>'
		});

		this.createCustomResolver('cmdOrCat', commandOrCategory)
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
		const disableEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/cross-mark_274c.png',
				name: 'Disable'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		if (typeof cmdOrCat === 'string') {
			// category
			const groups: any[] = fs.readdirSync('commands')
				.filter(path => fs.statSync(`commands/${path}`).isDirectory());
			const parsedGroup: string = cmdOrCat.toLowerCase();

			if (!isCommandCategoryEnabled(msg, cmdOrCat)) {
				return sendSimpleEmbeddedError(msg,
					`The \`${cmdOrCat}\` category is already disabled.`, 3000);
			} else if (groups.find((g: string) => g === parsedGroup)) {
				await msg.guild.settings.update('disabledCommandCategories', cmdOrCat.toLowerCase(), msg.guild);

				disableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Disabled the \`${cmdOrCat}\` category.`);
				modLogMessage(msg, disableEmbed);

				return msg.sendEmbed(disableEmbed);
			} else {
				return sendSimpleEmbeddedMessage(msg, `No groups matching that name. Use \`${msg.guild.settings.get('prefix')}commands\` to view a list of command groups.`, 3000);
			}
		} else {
			// command
			if (!isCommandEnabled(msg, cmdOrCat)) {
				return sendSimpleEmbeddedError(msg, `The \`${cmdOrCat.name}\` command is already disabled.`, 3000);
			} else {
				if (cmdOrCat.guarded) {
					return sendSimpleEmbeddedError(msg,
						`You cannot disable the \`${cmdOrCat.name}\` command.`, 3000
					);
				}
				await msg.guild.settings.update('disabledCommands', cmdOrCat.name.toLowerCase(), msg.guild);

				disableEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Action:** Disabled the \`${cmdOrCat.name}\` command.`);
				modLogMessage(msg, disableEmbed);

				return msg.sendEmbed(disableEmbed);
			}
		}
	}
}
