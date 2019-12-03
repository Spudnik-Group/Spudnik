import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, getEmbedColor } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Enable or disable the DeleteCommandMessages feature.
 *
 * @export
 * @class DeleteCommandMessagesCommand
 * @extends {Command}
 */
export default class DeleteCommandMessagesCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: [
				'deletecommandmessages'
			],
			requiredPermissions: ['MANAGE_MESSAGES'],
			description: 'Enable or disable the Delete Command Messages feature.',
			name: 'delete-command-messages',
			permissionLevel: 1, // MANAGE_MESSAGES
			usage: '<on|off>',
			subcommands: true
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
		const deleteCommandMessagesEnabled = await msg.guild.settings.get('deleteCommandMessages');
		const deleteCommandMessagesEmbed: MessageEmbed = new MessageEmbed({
			author: {
				name: '🛑 DeleteCommandMessages'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		if (deleteCommandMessagesEnabled) {
			return sendSimpleEmbeddedMessage(msg, 'DeleteCommandMessages feature already enabled!', 3000);
		} else {
			try {
				await msg.guild.settings.update('deleteCommandMessages', true, msg.guild);
				// Set up embed message
				deleteCommandMessagesEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** DeleteCommandMessages _Enabled_
				`);

				return this.sendSuccess(msg, deleteCommandMessagesEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'enable' }, err)
			}
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
		const deleteCommandMessagesEnabled = await msg.guild.settings.get('deleteCommandMessages');
		const deleteCommandMessagesEmbed: MessageEmbed = new MessageEmbed({
			author: {
				name: '🛑 DeleteCommandMessages'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		if (deleteCommandMessagesEnabled) {
			try {
				await msg.guild.settings.update('deleteCommandMessages', false, msg.guild);
				// Set up embed message
				deleteCommandMessagesEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** DeleteCommandMessages _Disabled_
				`);

				return this.sendSuccess(msg, deleteCommandMessagesEmbed);
			} catch (err) {
				return this.catchError(msg, { subCommand: 'disable' }, err)
			}
		} else {
			return sendSimpleEmbeddedMessage(msg, 'DeleteCommandMessages feature already disabled!', 3000);
		}
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`delete-command-messages\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`delete-command-messages ${args.subCommand.toLowerCase()}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		if (args.subCommand.toLowerCase() === 'enable') {
			return sendSimpleEmbeddedError(msg, 'Enabling DeleteCommandMessages feature failed!');
		} else {
			return sendSimpleEmbeddedError(msg, 'Disabling DeleteCommandMessages feature failed!');
		}
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		// Send the success response
		return msg.sendEmbed(embed);
	}
}
