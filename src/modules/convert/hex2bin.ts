import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';

/**
 * Convert Hexadecimal to Binary
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
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'numberToConvert',
					prompt: 'What number do you want to convert?\n',
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof Hex2BinCommand
	 */
	public async run(msg: CommandoMessage, args: { numberToConvert: string }): Promise<Message | Message[]> {
		args.numberToConvert = !args.numberToConvert.toLowerCase().startsWith('0x') ? `0x${args.numberToConvert.toUpperCase()}` : `0x${args.numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}`;

		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = ${Convert.hex2bin(args.numberToConvert)}`, {name: 'Hexadecimal to Binary Conversion:'});
	}
}
