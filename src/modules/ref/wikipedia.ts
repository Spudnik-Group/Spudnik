import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { oneLine } from 'common-tags';

/**
 * Post a summary from Wikipedia.
 *
 * @export
 * @class WikiCommand
 * @extends {Command}
 */
export default class WikiCommand extends Command {
	/**
	 * Creates an instance of WikiCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof WikiCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: 'What Wiki article should I look up?\n',
					type: 'string'
				}
			],
			description: 'Returns the summary of the first matching search result from Wikipedia.',
			details: oneLine`
				syntax: \`!wiki <query>\`
			`,
			examples: ['!wiki Sputnik 1'],
			group: 'ref',
			memberName: 'wiki',
			name: 'wiki',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "wiki" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof WikiCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		require('wikijs').default().search(args.query, 1).then((data: any) => {
			require('wikijs').default().page(data.results[0]).then((page: any) => {
				page.summary().then((summary: any) => {
					const sumText = summary.toString().split('\n');
					const continuation = () => {
						const paragraph = sumText.shift();
						if (paragraph) {
							return msg.embed({
								color: getEmbedColor(msg),
								description: `${paragraph}\n\n${page.raw.fullurl}`,
								title: page.raw.title
							});
						}
					};
					continuation();
				});
			});
		}, (err: Error) => {
			msg.client.emit('warn', `Error in command ref:wiki: ${err}`);
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		});
		return response;
	}
}
