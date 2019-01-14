import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping, deleteCommandMessages } from '../../lib/helpers';
import { getEmbedColor, modLogMessage } from '../../lib/custom-helpers';
import moment = require('moment');

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
	constructor(client: CommandoClient) {
		super(client, {
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

				Supplying no subcommand returns an error.
				MANAGE_MESSAGES permission required.`,
			examples: [
				'!adblock enable',
				'!adblock disable'
			],
			group: 'mod',
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
	 * @param {CommandMessage} msg
	 * @param {{ subCommand: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof AdblockCommand
	 */
	public async run(msg: CommandMessage, args: { subCommand: string }): Promise<Message | Message[]> {
		const modlogChannel = msg.guild.settings.get('modlogchannel', null);
		const adblockEnabled = msg.guild.settings.get('adblockEnabled', false);
		const adblockEmbed: MessageEmbed = new MessageEmbed({
			author: {
				name: '🛑 Adblock'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		if (args.subCommand === 'enable') {
			if (adblockEnabled) {
				stopTyping(msg);
				return sendSimpleEmbeddedMessage(msg, 'Adblock feature already enabled!', 3000);
			} else {
				msg.guild.settings.set('adblockEnabled', true)
					.catch((err: Error) => this.catchError(msg, args, err));
			}
		} else if (args.subCommand === 'disable') {
			if (!adblockEnabled) {
				stopTyping(msg);
				return sendSimpleEmbeddedMessage(msg, 'Adblock feature already disabled!', 3000);
			} else {
				msg.guild.settings.set('adblockEnabled', false)
					.catch((err: Error) => this.catchError(msg, args, err));
			}
		}
		
		// Set up embed message
		adblockEmbed.setDescription(stripIndents`
			**Member:** ${msg.author.tag} (${msg.author.id})
			**Action:** Adblock ${args.subCommand}
		`);

		// Log the event in the mod log
		if (msg.guild.settings.get('modlogs', true)) {
			modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, adblockEmbed);
		}
		deleteCommandMessages(msg, this.client);
		stopTyping(msg);

		// Send the success response
		return msg.embed(adblockEmbed);
	}

	private catchError(msg: CommandMessage, args: { subCommand: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`adblock\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`Adblock ${args.subCommand}\`
		**Error Message:** ${err}`);
		// Inform the user the command failed
		stopTyping(msg);
		if (args.subCommand === 'enable') {
			return sendSimpleEmbeddedError(msg, 'Enabling adblock feature failed!');
		} else {
			return sendSimpleEmbeddedError(msg, 'Disabling adblock feature failed!');
		}
	}
}
