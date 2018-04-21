import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbeddedImage } from '../../lib/helpers';

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
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Blesses you with a random bacon gif.',
			group: 'random',
			guildOnly: true,
			memberName: 'bacon',
			name: 'bacon',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	/**
	 * Run the "bacon" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof BaconCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedImage(msg, bacon[getRandomInt(0, bacon.length)]);
	}
}
