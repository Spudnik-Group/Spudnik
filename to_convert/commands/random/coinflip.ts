import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbeddedImage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			clientPermissions: ['ATTACH_FILES'],
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
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CoinFlipCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);

		return sendSimpleEmbeddedImage(msg, coinflip[getRandomInt(0, 1)].image);
	}
}
