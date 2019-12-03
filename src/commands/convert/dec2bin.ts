import { sendSimpleEmbeddedMessageWithAuthor, Convert } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Converts Decimal to Binary
 *
 * @export
 * @class Dec2BinCommand
 * @extends {Command}
 */
export default class Dec2BinCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Converts hexadecimal to decimal',
			name: 'dec2bin',
			usage: '<numberToConvert:int>'
		});
	}

	/**
	 * Run the "dec2bin" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Dec2BinCommand
	 */
	public async run(msg: KlasaMessage, [numberToConvert]): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${numberToConvert} = ${Convert.dec2bin(numberToConvert)}`, { name: 'Decimal to Binary Conversion:' });
	}
}
