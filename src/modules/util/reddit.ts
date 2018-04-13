import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

export default class RedditCommand extends Command {
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

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedMessage(msg, 'https://on.grey.gg/reddit');
	}
}
