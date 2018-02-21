import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

export default class LmgtfyCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Let Me Google that for You.',
			group: 'misc',
			guildOnly: true,
			memberName: 'lmgtfy',
			name: 'lmgtfy',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'what should I Google for that noob?\n',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		msg.delete();
		return sendSimpleEmbeddedMessage(msg, `<http://lmgtfy.com/?q=${encodeURI(require('remove-markdown')(args.query))}>`);
	}
}
