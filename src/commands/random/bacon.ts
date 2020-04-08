/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getRandomInt } from '@lib/helpers/base';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';
import { bacon } from '../../extras/data';

/**
 * Post a random bacon gif.
 *
 * @export
 * @class BaconCommand
 * @extends {Command}
 */
export default class BaconCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Blesses you with a random bacon gif.',
			name: 'bacon',
			requiredPermissions: Permissions.FLAGS.ATTACH_FILES
		});
	}

	/**
	 * Run the "bacon" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof BaconCommand
	 */
	public run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleImage(null, bacon[getRandomInt(0, bacon.length)]);
	}

}
