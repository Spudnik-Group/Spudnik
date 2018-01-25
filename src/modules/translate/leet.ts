import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbededMessage } from '../../lib/helpers';

export default class LeetCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Converts boring regular text to 1337.',
			group: 'translate',
			guildOnly: true,
			memberName: 'leet',
			name: 'leet',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: '61v3 m3 4 qu3ry.\n',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		msg.delete();
		return sendSimpleEmbededMessage(msg, require('leet').convert(args.query));
	}
}
