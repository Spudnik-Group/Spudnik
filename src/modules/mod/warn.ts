import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Enable or disable the adblock feature.
 *
 * @export
 * @class WarnCommand
 * @extends {Command}
 */
export default class WarnCommand extends Command {
	/**
	 * Creates an instance of WarnCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof WarnCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'subCommand',
					prompt: 'Would you like to enable or disable the feature?\n',
					type: 'string'
				}
			],
			description: 'Enable or disable the adblock feature.',
			details: stripIndents`
				syntax: \`!adblock <enable|disable>\`

				Supplying no subcommand returns an error.
				Manage Messages permission required.`,
			examples: [
				'!adblock enable',
				'!adblock disable'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'warn',
			name: 'warn',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Determine if a member has permission to run the "adblock" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof WarnCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.member.hasPermission('MANAGE_MESSAGES');
	}

	/**
	 * Run the "warn" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof WarnCommand
	 */
	public async run(msg: CommandMessage, args: { subCommand: string }): Promise<Message | Message[]> {
		const adblockEnabled = msg.client.provider.get(msg.guild.id, 'adblockEnabled', false);

		if (args.subCommand === 'enable') {
			if (adblockEnabled) {
				return sendSimpleEmbeddedMessage(msg, 'Adblock feature already enabled!');
			} else {
				msg.client.provider.set(msg.guild.id, 'adblockEnabled', true);

				return sendSimpleEmbeddedMessage(msg, 'Adblock feature enabled.');
			}
		} else if (args.subCommand === 'disable') {
			if (!adblockEnabled) {
				return sendSimpleEmbeddedMessage(msg, 'Adblock feature already disabled!');
			} else {
				msg.client.provider.set(msg.guild.id, 'adblockEnabled', false);

				return sendSimpleEmbeddedMessage(msg, 'Adblock feature disabled.');
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Invalid subcommand! See `help adblock` for details.');
		}
	}
}
