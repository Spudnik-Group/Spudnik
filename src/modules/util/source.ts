import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

export default class SourceCommand extends Command {
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

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedMessage(msg, 'https://github.com/Spudnik-Group/Spudnik');
	}
}
