/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';
import { coinflip } from '../../extras/data';
import { getRandomInt } from '@lib/utils/util';

/**
 * Simulate a coin flip.
 *
 * @export
 * @class CoinFlipCommand
 * @extends {Command}
 */
export default class CoinFlipCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
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
	public run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleImage(null, coinflip[getRandomInt(0, 1)].image);
	}

}
