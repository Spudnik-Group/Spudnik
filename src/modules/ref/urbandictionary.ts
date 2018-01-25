import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

export default class UrbanCommand extends Command {
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

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const targetWord = args.query === '' ? require('urban').random() : require('urban')(args.query);
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
		return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
	}
}
