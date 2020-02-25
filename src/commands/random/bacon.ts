/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getRandomInt, sendSimpleEmbeddedImage } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';

const { bacon }: { bacon: string[] } = require('../../extras/data');

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
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedImage(msg, bacon[getRandomInt(0, bacon.length)]);
	}

}
