/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Convert } from '@lib/helpers/convert';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Converts Decimal to Hexadecimal
 *
 * @export
 * @class Dec2HexCommand
 * @extends {Command}
 */
export default class Dec2HexCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Converts decimal to hexadecimal',
			name: 'dec2hex',
			usage: '<numberToConvert:int>'
		});
	}

	/**
	 * Run the "dec2hex" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Dec2HexCommand
	 */
	public async run(msg: KlasaMessage, [numberToConvert]): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleEmbedWithAuthor(`${numberToConvert} = 0x${Convert.dec2hex(numberToConvert).toUpperCase()}`, { name: 'Decimal to Hexadecimal Conversion:' });
	}

}
