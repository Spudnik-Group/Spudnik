import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

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
					type: 'string'
				}
			],
			description: 'Enable or disable the adblock feature.',
			guildOnly: true,
			group: 'mod',
			memberName: 'adblock',
			name: 'adblock',
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
	 * @memberof AdblockCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.member.hasPermission('MANAGE_MESSAGES');
	}

	/**
	 * Run the "adblock" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof AdblockCommand
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
