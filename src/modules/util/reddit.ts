import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a link to the GReY Reddit.
 * 
 * @export
 * @class RedditCommand
 * @extends {Command}
 */
export default class RedditCommand extends Command {
	/**
	 * Creates an instance of RedditCommand.
	 * 
	 * @param {CommandoClient} client 
	 * @memberof RedditCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Link to the GReY Reddit!',
			group: 'util',
			guildOnly: true,
			memberName: 'reddit',
			name: 'reddit',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	/**
	 * Run the "reddit" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof RedditCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedMessage(msg, 'https://on.grey.gg/reddit');
	}
}
