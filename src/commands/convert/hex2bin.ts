import { sendSimpleEmbeddedMessageWithAuthor, Convert } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Converts Hexadecimal to Binary
 *
 * @export
 * @class Hex2BinCommand
 * @extends {Command}
 */
export default class Hex2BinCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Converts hexadecimal to decimal',
			name: 'hex2bin',
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
	public async run(msg: KlasaMessage, [numberToConvert]): Promise<KlasaMessage | KlasaMessage[]> {
		numberToConvert = numberToConvert['input'];
		numberToConvert = !numberToConvert.toLowerCase().startsWith('0x') ? `0x${numberToConvert.toUpperCase()}` : `0x${numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}`;

		return sendSimpleEmbeddedMessageWithAuthor(msg, `${numberToConvert} = ${Convert.hex2bin(numberToConvert)}`, { name: 'Hexadecimal to Binary Conversion:' });
	}
}
