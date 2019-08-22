import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: CommandoClient) {
		super(client, {
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof BaconCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		deleteCommandMessages(msg);

		return sendSimpleEmbeddedImage(msg, bacon[getRandomInt(0, bacon.length)]);
	}
}
