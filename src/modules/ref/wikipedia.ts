import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping, deleteCommandMessages } from '../../lib/helpers';
import * as WikiJS from 'wikijs';

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
			details: stripIndents`
				syntax: \`!wiki <query>\`
			`,
			examples: ['!wiki Sputnik 1'],
			group: 'ref',
			guildOnly: true,
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
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof WikiCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		startTyping(msg);

		return WikiJS.default().search(args.query, 1)
			.then(async (data: WikiJS.Result) => {
				try {
					const page: any = await WikiJS.default().page(data.results[0]);
					const summary: string = await page.summary();

					const messageOut: MessageEmbed = new MessageEmbed({
						color: getEmbedColor(msg)	
					});

					const sumText = summary.split('\n');
					let paragraph = sumText.shift();

					if (paragraph) {
						const lenParagraph = paragraph.length;
						const lenFullUrl = page.raw.fullurl.length;

						// Wikipedia API Limitation:
						//     IPA phonetics are not returned in the summary but the parenthesis that they are encapsulated in are...
						paragraph = paragraph.replace(' ()', '').replace('()', '');

						// Discord API Limitation:
						//     Embed description cannot be over 2048 characters
						if((lenParagraph + 5 + lenFullUrl) > 2048){
							paragraph = `${paragraph.substring(0, 2048 - (5 + lenFullUrl))}...`;
						}
						
						messageOut.setDescription(`${paragraph}\n\n${page.raw.fullurl}`);
						messageOut.setTitle(page.raw.title);
					}
					else {
						messageOut.setDescription('No results. Try again?');
					}

					deleteCommandMessages(msg, this.client);
					stopTyping(msg);

					// Send the success response
					return msg.embed(messageOut);
				}
				catch (err) {
					msg.client.emit('warn', `Error in command ref:wiki: ${err}`);
					stopTyping(msg);
					return sendSimpleEmbeddedError(msg, 'No results found. Try again?', 3000);
				}
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command ref:wiki: ${err}`);
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
