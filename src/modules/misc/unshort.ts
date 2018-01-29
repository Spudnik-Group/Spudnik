import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbededError, sendSimpleEmbededMessage } from '../../lib/helpers';

export default class UnshortCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['unshorten'],
			description: 'Unshorten a link.',
			group: 'misc',
			guildOnly: true,
			memberName: 'unshort',
			name: 'unshort',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'what link should I unshorten?\n',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		require('unshort')(args.query, (err: Error, url: string) => {
			if (url) {
				msg.delete();
				return sendSimpleEmbededMessage(msg, `Original url is: <${url}>`);
			}
			return sendSimpleEmbededError(msg, 'This url can\'t be expanded');
		});
		return sendSimpleEmbededError(msg, 'Error expanding url. Try again?');
	}
}
