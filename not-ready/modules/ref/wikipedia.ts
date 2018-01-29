import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbededError } from '../../lib/helpers';

export default class WikiCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns the summary of the first matching search result from Wikipedia.',
			group: 'ref',
			guildOnly: true,
			memberName: 'wiki',
			name: 'wiki',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'what Wiki article should I look up?\n',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		require('wikijs').default().search(args.query, 1).then((data: any) => {
			require('wikijs').default().page(data.results[0]).then((page: any) => {
				page.summary().then((summary: any) => {
					const sumText = summary.toString().split('\n');
					const continuation = () => {
						const paragraph = sumText.shift();
						if (paragraph) {
							return msg.embed({
								color: 5592405,
								title: page.title,
								description: `${paragraph}\n\n${page.fullurl}`,
							});
						}
					};
					continuation();
				});
			});
		}, (err: Error) => {
			return sendSimpleEmbededError(msg, err.toString());
		});
		return sendSimpleEmbededError(msg, 'There was an error with the request. Try again?');
	}
}
