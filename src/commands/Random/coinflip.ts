import { getRandomInt, sendSimpleEmbeddedImage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Flips a coin for you.',
			name: 'coinflip'
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
		return sendSimpleEmbeddedImage(msg, coinflip[getRandomInt(0, 1)].image);
	}
}
