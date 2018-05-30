import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post an Urban Dictionary definition.
 *
 * @export
 * @class UrbanCommand
 * @extends {Command}
 */
export default class UrbanCommand extends Command {
	/**
	 * Creates an instance of UrbanCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UrbanCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'query',
					prompt: 'What should I look up on Urban Dictionary?\n',
					type: 'string'
				}
			],
			description: 'Returns the Urban Dictionary result of the supplied query. If no query is supplied, returns a random thing.',
			details: oneLine`
				syntax: \`!urban (query)\`\n
				\n
				Supplying no query will return a random result.\n
				Urban Dictionary results are NSFW.
			`,
			examples: [
				'!urban',
				'!urban shorty'
			],
			group: 'ref',
			memberName: 'urban',
			name: 'urban',
			nsfw: true,
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "urban" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof UrbanCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const response = sendSimpleEmbeddedMessage(msg, 'Loading...');
		const targetWord = args.query === '' ? require('urban').random() : require('urban')(args.query);
		try {
			targetWord.first((json: any) => {
				let title = `Urban Dictionary: ${args.query}`;
				let message;
				let example;

				if (json) {
					title = `Urban Dictionary: ${json.word}`;
					message = `${json.definition}`;
					if (json.example) {
						example = `Example: ${json.example}`;
					}
				} else {
					message = 'No matches found';
				}

				return msg.embed({
					color: getEmbedColor(msg),
					description: message,
					footer: {
						text: example
					},
					title: title
				});
			});
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:urban: ${err}`);
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
		return response;
	}
}
