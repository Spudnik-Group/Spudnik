import { MessageEmbed } from 'discord.js';
import { getEmbedColor, getRandomInt, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Ask the magic 8 ball a question.',
			extendedHelp: 'syntax: `!8ball <query>`',
			name: '8ball',
			usage: '<query:string>'
		});
	}

	/**
	 * Run the "8ball" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof EightBallCommand
	 */
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		let response = 'Error getting answer. Try again later?';
		if (eightBall && eightBall.length > 0) {
			response = eightBall[getRandomInt(0, eightBall.length) - 1];

			return msg.send(new MessageEmbed({
				color: getEmbedColor(msg),
				description: `:8ball: **${response}**`,
				title: query
			}), { reply: msg.author });
		} else {
			return sendSimpleEmbeddedError(msg, response, 3000);
		}
	}
}
