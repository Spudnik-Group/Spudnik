/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Permissions } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Enable or disable the DeleteCommandMessages feature.
 *
 * @export
 * @class DeleteCommandMessagesCommand
 * @extends {Command}
 */
export default class DeleteCommandMessagesCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [
				'deletecommandmessages'
			],
			description: 'Enable or disable the Delete Command Messages feature.',
			name: 'delete-command-messages',
			permissionLevel: 1, // MANAGE_MESSAGES
			requiredPermissions: Permissions.FLAGS['MANAGE_MESSAGES'],
			subcommands: true,
			usage: '<on|off>'
		});
	}

	/**
	 * Enable the feature
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DeleteCommandMessagesCommand
	 */
	public async on(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const deleteCommandMessagesEnabled = msg.guild.settings.get(GuildSettings.Commands.DeleteCommandMessages);
		const deleteCommandMessagesEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.DeleteCommandMessages);

		if (deleteCommandMessagesEnabled) {
			return msg.sendSimpleEmbed('DeleteCommandMessages feature already enabled!', 3000);
		}
		try {
			await msg.guild.settings.update(GuildSettings.Commands.DeleteCommandMessages, true);

			// Set up embed message
			deleteCommandMessagesEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** DeleteCommandMessages _Enabled_
				`);

			return this.sendSuccess(msg, deleteCommandMessagesEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'enable' }, err);
		}

	}

	/**
	 * Disable the feature
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DeleteCommandMessagesCommand
	 */
	public async off(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const deleteCommandMessagesEnabled = msg.guild.settings.get(GuildSettings.Commands.DeleteCommandMessages);
		const deleteCommandMessagesEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.DeleteCommandMessages);

		if (deleteCommandMessagesEnabled) {
			try {
				await msg.guild.settings.update(GuildSettings.Commands.DeleteCommandMessages, false);

				// Set up embed message
				deleteCommandMessagesEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** DeleteCommandMessages _Disabled_
				`);

				return this.sendSuccess(msg, deleteCommandMessagesEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'disable' }, err);
			}
		} else {
			return msg.sendSimpleEmbed('DeleteCommandMessages feature already disabled!', 3000);
		}
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`delete-command-messages\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`delete-command-messages ${args.subCommand.toLowerCase()}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		if (args.subCommand.toLowerCase() === 'enable') {
			return msg.sendSimpleError('Enabling DeleteCommandMessages feature failed!');
		}
		return msg.sendSimpleError('Disabling DeleteCommandMessages feature failed!');

	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		// Send the success response
		return msg.sendEmbed(embed);
	}

}
