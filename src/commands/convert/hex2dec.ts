/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Convert } from '@lib/helpers/convert';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Converts Hexadecimal to Decimal
 *
 * @export
 * @class Hex2DecCommand
 * @extends {Command}
 */
export default class Hex2DecCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Converts hexadecimal to decimal',
			usage: '<numberToConvert:regex/^(0[x|X])?[0-9A-Fa-f]+$/>'
		});
	}

	/**
	 * Run the "hex2dec" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Hex2DecCommand
	 */
	public run(msg: KlasaMessage, [numberToConvert]: [any]): Promise<KlasaMessage | KlasaMessage[]> {
		numberToConvert = numberToConvert.input;
		numberToConvert = numberToConvert.toLowerCase().startsWith('0x') ? `0x${numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}` : `0x${numberToConvert.toUpperCase()}`;

		return msg.sendSimpleEmbedWithAuthor(`${numberToConvert} = ${Convert.hex2dec(numberToConvert)}`, { name: 'Hexadecimal to Decimal Conversion:' });
	}

}
