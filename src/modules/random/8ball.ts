import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbededError } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
const { eightBall }: { eightBall: string[] } = require('../extras/data');

export default class EightBallCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Ask the magic 8 ball a question.',
			group: 'random',
			guildOnly: true,
			memberName: '8ball',
			name: '8ball',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'What would you like to ask the magic 8-ball?',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		let response = 'Error getting answer. Try again later?';
		if (eightBall) {
			response = 'I don\'t know what to tell you. I\'m all out of answers.';
			if (eightBall.length > 0) {
				response = eightBall[getRandomInt(0, eightBall.length) - 1];
				return msg.embed(new MessageEmbed({
					color: 5592405,
					title: args.query,
					description: `:8ball: **${response}**`
				}));
			} else {
				return sendSimpleEmbededError(msg, response);
			}
		} else {
			return sendSimpleEmbededError(msg, response);
		}
	}
}
