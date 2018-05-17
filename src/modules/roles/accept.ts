import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Accept the guild rules, and be auto-assigned the default role.
 *
 * @export
 * @class AcceptCommand
 * @extends {Command}
 */
export default class AcceptCommand extends Command {
	/**
	 * Creates an instance of AcceptCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof AcceptCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Accept the guild rules, and be auto-assigned the default role.',
			group: 'roles',
			guildOnly: true,
			memberName: 'accept',
			name: 'accept',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	/**
	 * Determine if a member has permission to run the "accept" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof AcceptCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.guild.id === '223806376596602880';
	}

	/**
	 * Run the "accept" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof AcceptCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		//!accept enable #channel @rolename
		const acceptRole = msg.client.provider.get(msg.guild, 'defaultRole');
		if (!msg.member.guild.roles.has(acceptRole)) {
			msg.delete();
			msg.member.guild.roles.add(acceptRole);
			return sendSimpleEmbeddedMessage(msg, 'Rules accepted. Enjoy your stay!');
		} else {
			return sendSimpleEmbeddedMessage(msg, '');
		}
	}
}
