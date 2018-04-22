import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
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
			description: 'Looks something up on Urban Dictionary. If no query is supplied, returns a random thing.',
			group: 'ref',
			guildOnly: true,
			memberName: 'urban',
			name: 'urban',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					default: '',
					key: 'query',
					prompt: 'what should I look up on Urban Dictionary?\n',
					type: 'string',
				},
			],
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
					color: 5592405,
					title,
					description: message,
					footer: {
						text: example,
					},
				});
			});
		} catch (err) {
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
		}
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
