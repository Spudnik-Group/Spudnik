/**
 * Copyright (c) 2020 Spudnik Group
 */

import { sendSimpleEmbeddedMessageWithAuthor, Convert } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Convert Binary to Hexadecimal
 *
 * @export
 * @class Bin2HexCommand
 * @extends {Command}
 */
export default class Bin2HexCommand extends Command {

public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Converts binary to decimal',
			name: 'bin2hex',
			usage: '<numberToConvert:regex/^[0-1]+$/>'
		});
	}

	/**
	 * Run the "bin2hex" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Bin2HexCommand
	 */
	public async run(msg: KlasaMessage, [numberToConvert]): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${numberToConvert} = 0x${Convert.bin2hex(numberToConvert).toUpperCase()}`, { name: 'Binary to Hexadecimal Conversion:' });
	}

}
