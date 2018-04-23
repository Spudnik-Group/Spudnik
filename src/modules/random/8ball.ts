import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbeddedError } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
const { eightBall }: { eightBall: string[] } = require('../../extras/data');

/**
 * Post a random "Magic 8-ball" response to a question.
 *
 * @export
 * @class EightBallCommand
 * @extends {Command}
 */
export default class EightBallCommand extends Command {
	/**
	 * Creates an instance of EightBallCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof EightBallCommand
	 */
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

	/**
	 * Run the "8ball" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof EightBallCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		let response = 'Error getting answer. Try again later?';
		if (eightBall) {
			response = 'I don\'t know what to tell you. I\'m all out of answers.';
			if (eightBall.length > 0) {
				response = eightBall[getRandomInt(0, eightBall.length) - 1];
				return msg.embed(new MessageEmbed({
					color: 5592405,
					title: args.query,
					description: `:8ball: **${response}**`,
				}));
			} else {
				return sendSimpleEmbeddedError(msg, response);
			}
		} else {
			return sendSimpleEmbeddedError(msg, response);
		}
	}
}
