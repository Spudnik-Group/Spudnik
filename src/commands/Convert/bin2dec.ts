import { sendSimpleEmbeddedMessageWithAuthor, Convert } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Convert Binary to Decimal
 *
 * @export
 * @class Bin2DecCommand
 * @extends {Command}
 */
export default class Bin2DecCommand extends Command {
	/**
	 * Creates an instance of Bin2DecCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Bin2DecCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Converts binary to decimal',
			name: 'bin2dec',
			usage: '<numberToConvert:regex/\\/^[0-1]+$\\/>'
		});
	}

	/**
	 * Run the "bin2dec" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Bin2DecCommand
	 */
	public async run(msg: KlasaMessage, [numberToConvert]): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${numberToConvert} = ${Convert.bin2dec(numberToConvert)}`, {name: 'Binary to Decimal Conversion:'});
	}
}
