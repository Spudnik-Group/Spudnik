import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Post a link to the Spudnik Command Discord Server.
 *
 * @export
 * @class SupportCommand
 * @extends {Command}
 */
export default class SupportCommand extends Command {
	/**
	 * Creates an instance of SupportCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof SupportCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns a link to my support server!',
			examples: ['!support'],
			group: 'help',
			guarded: true,
			guildOnly: true,
			memberName: 'support',
			name: 'support',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "support" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SupportCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, '<https://spudnik.io/support>');
	}
}
