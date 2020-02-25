/**
 * Copyright (c) 2020 Spudnik Group
 */

import { sendSimpleEmbeddedMessageWithAuthor, Convert } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Converts Hexadecimal to Decimal
 *
 * @export
 * @class Hex2DecCommand
 * @extends {Command}
 */
export default class Hex2DecCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Converts hexadecimal to decimal',
			name: 'hex2dec',
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
	public async run(msg: KlasaMessage, [numberToConvert]): Promise<KlasaMessage | KlasaMessage[]> {
		numberToConvert = numberToConvert.input;
		numberToConvert = !numberToConvert.toLowerCase().startsWith('0x') ? `0x${numberToConvert.toUpperCase()}` : `0x${numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}`;

		return sendSimpleEmbeddedMessageWithAuthor(msg, `${numberToConvert} = ${Convert.hex2dec(numberToConvert)}`, { name: 'Hexadecimal to Decimal Conversion:' });
	}

}
