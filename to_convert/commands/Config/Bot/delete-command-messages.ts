import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping } from '../../helpers/helpers';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../helpers/custom-helpers';
import * as format from 'date-fns/format';
import { Command } from 'klasa';

/**
 * Enable or disable the DeleteCommandMessages feature.
 *
 * @export
 * @class DeleteCommandMessagesCommand
 * @extends {Command}
 */
export default class DeleteCommandMessagesCommand extends Command {
	/**
	 * Creates an instance of DeleteCommandMessagesCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DeleteCommandMessagesCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: [
				'deletecommandmessages'
			],
			args: [
				{
					key: 'subCommand',
					prompt: 'Would you like to enable or disable the feature?\n',
					type: 'string',
					validate: (subCommand: string) => {
						const allowedSubCommands = ['enable', 'disable'];
						
						if (allowedSubCommands.indexOf(subCommand) !== -1) return true;
						
						return 'You provided an invalid subcommand.';
					}
				}
			],
			clientPermissions: ['MANAGE_MESSAGES'],
			description: 'Enable or disable the Delete Command Messages feature.',
			details: stripIndents`
				syntax: \`!delete-command-messages <enable|disable>\`

				\`MANAGE_MESSAGES\` permission required.`,
			examples: [
				'!delete-command-messages enable',
				'!delete-command-messages disable'
			],
			group: 'bot_config',
			guildOnly: true,
			memberName: 'delete-command-messages',
			name: 'delete-command-messages',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	/**
	 * Run the "DeleteCommandMessages" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ subCommand: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DeleteCommandMessagesCommand
	 */
	public async run(msg: KlasaMessage, args: { subCommand: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const deleteCommandMessagesEnabled = await msg.guild.settings.get('deleteCommandMessage', false);
		const deleteCommandMessagesEmbed: MessageEmbed = new MessageEmbed({
			author: {
				name: '🛑 DeleteCommandMessages'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		if (args.subCommand.toLowerCase() === 'enable') {
			if (deleteCommandMessagesEnabled) {
				stopTyping(msg);

				return sendSimpleEmbeddedMessage(msg, 'DeleteCommandMessages feature already enabled!', 3000);
			} else {
				try {
					await msg.guild.settings.set('deleteCommandMessage', true);
					// Set up embed message
					deleteCommandMessagesEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** DeleteCommandMessages _Enabled_
					`);

					return this.sendSuccess(msg, deleteCommandMessagesEmbed);
				} catch (err) {
					return this.catchError(msg, args, err)
				}
			}
		} else if (args.subCommand.toLowerCase() === 'disable') {
			if (deleteCommandMessagesEnabled) {
				try {
					await msg.guild.settings.set('deleteCommandMessage', false);
					// Set up embed message
					deleteCommandMessagesEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** DeleteCommandMessages _Disabled_
					`);

					return this.sendSuccess(msg, deleteCommandMessagesEmbed);
				} catch (err) {
					return this.catchError(msg, args, err)
				}
			} else {
				stopTyping(msg);

				return sendSimpleEmbeddedMessage(msg, 'DeleteCommandMessages feature already disabled!', 3000);
			}
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
		stopTyping(msg);

		if (args.subCommand.toLowerCase() === 'enable') {
			return sendSimpleEmbeddedError(msg, 'Enabling DeleteCommandMessages feature failed!');
		} else {
			return sendSimpleEmbeddedError(msg, 'Disabling DeleteCommandMessages feature failed!');
		}
	}
	
	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);
		deleteCommandMessages(msg);
		stopTyping(msg);

		// Send the success response
		return msg.embed(embed);
	}
}
