/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Convert } from '@lib/helpers/convert';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Converts Hexadecimal to Binary
 *
 * @export
 * @class Hex2BinCommand
 * @extends {Command}
 */
export default class Hex2BinCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Converts hexadecimal to decimal',
			usage: '<numberToConvert:regex/^(0[x|X])?[0-9A-Fa-f]+$/>'
		});
	}

	/**
	 * Run the "hex2bin" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Hex2BinCommand
	 */
	public run(msg: KlasaMessage, [numberToConvert]: [any]): Promise<KlasaMessage | KlasaMessage[]> {
		numberToConvert = numberToConvert.input;
		numberToConvert = numberToConvert.toLowerCase().startsWith('0x') ? `0x${numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}` : `0x${numberToConvert.toUpperCase()}`;

		return msg.sendSimpleEmbedWithAuthor(`${numberToConvert} = ${Convert.hex2bin(numberToConvert)}`, { name: 'Hexadecimal to Binary Conversion:' });
	}

}
