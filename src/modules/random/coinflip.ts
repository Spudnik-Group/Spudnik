import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbeddedImage } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
const { coinflip }: { coinflip: any[] } = require('../../extras/data');

/**
 * Simulate a coin flip.
 *
 * @export
 * @class CoinFlipCommand
 * @extends {Command}
 */
export default class CoinFlipCommand extends Command {
	/**
	 * Creates an instance of CoinFlipCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CoinFlipCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Flips a coin for you.',
			examples: ['!coinflip'],
			group: 'random',
			guildOnly: true,
			memberName: 'coinflip',
			name: 'coinflip',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "coinflip" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CoinFlipCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedImage(msg, coinflip[getRandomInt(0, 1)].image);
	}
}
