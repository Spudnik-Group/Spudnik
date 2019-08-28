import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbeddedImage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

// tslint:disable-next-line:no-var-requires
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
			clientPermissions: ['ATTACH_FILES'],
			description: 'Blesses you with a random bacon gif.',
			examples: ['!bacon'],
			group: 'random',
			guildOnly: true,
			memberName: 'bacon',
			name: 'bacon',
			throttling: {
				duration: 3,
				usages: 2
			}
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
		deleteCommandMessages(msg);

		return sendSimpleEmbeddedImage(msg, bacon[getRandomInt(0, bacon.length)]);
	}
}
