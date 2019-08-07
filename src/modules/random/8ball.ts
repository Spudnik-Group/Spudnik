import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
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
			args: [
				{
					key: 'query',
					prompt: 'What would you like to ask the magic 8-ball?',
					type: 'string'
				}
			],
			description: 'Ask the magic 8 ball a question.',
			details: 'syntax: `!8ball <query>`',
			examples: ['!8ball Is my life on the right track?'],
			group: 'random',
			guildOnly: true,
			memberName: '8ball',
			name: '8ball',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "8ball" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof EightBallCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		let response = 'Error getting answer. Try again later?';
		if (eightBall && eightBall.length > 0) {
			response = eightBall[getRandomInt(0, eightBall.length) - 1];
			
			deleteCommandMessages(msg);

			return msg.reply(new MessageEmbed({
				color: getEmbedColor(msg),
				description: `:8ball: **${response}**`,
				title: args.query
			}));
		} else {
			return sendSimpleEmbeddedError(msg, response, 3000);
		}
	}
}
