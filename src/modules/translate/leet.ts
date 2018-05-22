import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Convert text to 1337 speak.
 *
 * @export
 * @class LeetCommand
 * @extends {Command}
 */
export default class LeetCommand extends Command {
	/**
	 * Creates an instance of LeetCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof LeetCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Converts boring regular text to 1337.',
			group: 'translate',
			guildOnly: true,
			memberName: 'leet',
			name: 'leet',
			throttling: {
				duration: 3,
				usages: 2
			},
			args: [
				{
					key: 'query',
					prompt: '61v3 m3 4 qu3ry.\n',
					type: 'string'
				}
			]
		});
	}

	/**
	 * Run the "leet" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof LeetCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		msg.delete();
		return sendSimpleEmbeddedMessage(msg, require('leet').convert(args.query));
	}
}
