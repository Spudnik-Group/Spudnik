import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage, deleteCommandMessages } from '../../lib/helpers';

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
			description: 'Returns a link to my source code!',
			examples: ['!source'],
			group: 'misc',
			guildOnly: true,
			memberName: 'source',
			name: 'source',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "source" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof SourceCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		deleteCommandMessages(msg, this.client);
		return sendSimpleEmbeddedMessage(msg, '<https://github.com/Spudnik-Group/Spudnik>');
	}
}
