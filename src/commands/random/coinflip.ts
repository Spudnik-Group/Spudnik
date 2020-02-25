/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getRandomInt, sendSimpleEmbeddedImage } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';

const { coinflip }: { coinflip: any[] } = require('../../extras/data');

/**
 * Simulate a coin flip.
 *
 * @export
 * @class CoinFlipCommand
 * @extends {Command}
 */
export default class CoinFlipCommand extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Flips a coin for you.',
			name: 'coinflip',
			requiredPermissions: Permissions.FLAGS.ATTACH_FILES
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
