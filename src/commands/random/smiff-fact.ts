/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getRandomInt } from '@lib/helpers/base';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { smiff } from '../../extras/data.json';

/**
 * Post a random Will Smith fact.
 *
 * @export
 * @class SmiffFactCommand
 * @extends {Command}
 */
export default class SmiffFactCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['smith-fact', 'willsmith'],
			description: 'Returns a random Will Smith fact.',
			name: 'smiff-fact'
		});
	}

	/**
	 * Run the "smiff-fact" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SmiffFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleEmbedWithTitle(smiff[getRandomInt(0, smiff.length) - 1], 'Will Smith Fact');
	}

}
