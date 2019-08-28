import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping } from '../../lib/helpers';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';

/**
 * Enable or disable the adblock feature.
 *
 * @export
 * @class AdblockCommand
 * @extends {Command}
 */
export default class AdblockCommand extends Command {
	/**
	 * Creates an instance of AdblockCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof AdblockCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
			description: 'Enable or disable the adblock feature.',
			details: stripIndents`
				syntax: \`!adblock <enable|disable>\`

				\`MANAGE_MESSAGES\` permission required.`,
			examples: [
				'!adblock enable',
				'!adblock disable'
			],
			group: 'feature',
			guildOnly: true,
			memberName: 'adblock',
			name: 'adblock',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	/**
	 * Run the "adblock" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof AdblockCommand
	 */
	public async run(msg: KlasaMessage, args: { subCommand: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const adblockEnabled = await msg.guild.settings.get('adblockEnabled', false);
		const adblockEmbed: MessageEmbed = new MessageEmbed({
			author: {
				name: '🛑 Adblock'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		if (args.subCommand.toLowerCase() === 'enable') {
			if (adblockEnabled) {
				stopTyping(msg);

				return sendSimpleEmbeddedMessage(msg, 'Adblock feature already enabled!', 3000);
			} else {
				try {
					await msg.guild.settings.set('adblockEnabled', true);
					// Set up embed message
					adblockEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Adblock _Enabled_
					`);

					return this.sendSuccess(msg, adblockEmbed);
				} catch (err) {
					return this.catchError(msg, args, err)
				}
			}
		} else if (args.subCommand.toLowerCase() === 'disable') {
			if (adblockEnabled) {
				try {
					await msg.guild.settings.set('adblockEnabled', false);
					// Set up embed message
					adblockEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Adblock _Disabled_
					`);

					return this.sendSuccess(msg, adblockEmbed);
				} catch (err) {
					return this.catchError(msg, args, err)
				}
			} else {
				stopTyping(msg);

				return sendSimpleEmbeddedMessage(msg, 'Adblock feature already disabled!', 3000);
			}
		}
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`adblock\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			**Input:** \`Adblock ${args.subCommand.toLowerCase()}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		stopTyping(msg);

		if (args.subCommand.toLowerCase() === 'enable') {
			return sendSimpleEmbeddedError(msg, 'Enabling adblock feature failed!');
		} else {
			return sendSimpleEmbeddedError(msg, 'Disabling adblock feature failed!');
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