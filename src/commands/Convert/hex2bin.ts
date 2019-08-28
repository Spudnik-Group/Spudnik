import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Converts Hexadecimal to Binary
 *
 * @export
 * @class Hex2BinCommand
 * @extends {Command}
 */
export default class Hex2BinCommand extends Command {
	/**
	 * Creates an instance of Hex2BinCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Hex2BinCommand
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
				'!hex2bin 0xFF',
				'!hex2bin ff'
			],
			group: 'convert',
			guildOnly: true,
			memberName: 'hex2bin',
			name: 'hex2bin',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "hex2bin" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Hex2BinCommand
	 */
	public async run(msg: KlasaMessage, args: { numberToConvert: string }): Promise<KlasaMessage | KlasaMessage[]> {
		args.numberToConvert = !args.numberToConvert.toLowerCase().startsWith('0x') ? `0x${args.numberToConvert.toUpperCase()}` : `0x${args.numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}`;

		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = ${Convert.hex2bin(args.numberToConvert)}`, {name: 'Hexadecimal to Binary Conversion:'});
	}
}
