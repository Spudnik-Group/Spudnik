import { getRandomInt, sendSimpleEmbeddedImage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

const { bacon }: { bacon: string[] } = require('../../extras/data');

/**
 * Post a random bacon gif.
 *
 * @export
 * @class BaconCommand
 * @extends {Command}
 */
export default class BaconCommand extends Command {
	/**
	 * Creates an instance of BaconCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BaconCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Blesses you with a random bacon gif.',
			name: 'bacon'
		});
	}

	/**
	 * Run the "bacon" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof BaconCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedImage(msg, bacon[getRandomInt(0, bacon.length)]);
	}
}
