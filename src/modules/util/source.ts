import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a link to the Spudnik code repository.
 *
 * @export
 * @class SourceCommand
 * @extends {Command}
 */
export default class SourceCommand extends Command {
	/**
	 * Creates an instance of SourceCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof SourceCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Link to my source code!',
			group: 'util',
			guildOnly: true,
			memberName: 'source',
			name: 'source',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	/**
	 * Run the "source" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SourceCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedMessage(msg, 'https://github.com/Spudnik-Group/Spudnik');
	}
}
