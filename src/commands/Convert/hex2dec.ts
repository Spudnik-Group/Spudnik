import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Converts Hexadecimal to Decimal
 *
 * @export
 * @class Hex2DecCommand
 * @extends {Command}
 */
export default class Hex2DecCommand extends Command {
	/**
	 * Creates an instance of Hex2DecCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Hex2DecCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			args: [
				{
					key: 'numberToConvert',
					prompt: 'Please enter a valid number to convert.\n',
					type: 'string',
					validate: (numberToConvert: string) => {
						return /^(0[x|X])?[0-9A-Fa-f]+$/.test(numberToConvert);
					}
				}
			],
			description: 'Converts hexadecimal to decimal',
			examples: [
				'!hex2dec 0xFF',
				'!hex2dec ff'
			],
			group: 'convert',
			guildOnly: true,
			memberName: 'hex2dec',
			name: 'hex2dec',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "hex2dec" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Hex2DecCommand
	 */
	public async run(msg: KlasaMessage, args: { numberToConvert: string }): Promise<KlasaMessage | KlasaMessage[]> {
		args.numberToConvert = !args.numberToConvert.toLowerCase().startsWith('0x') ? `0x${args.numberToConvert.toUpperCase()}` : `0x${args.numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}`;

		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = ${Convert.hex2dec(args.numberToConvert)}`, {name: 'Hexadecimal to Decimal Conversion:'});
	}
}