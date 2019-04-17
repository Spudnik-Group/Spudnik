import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';

/**
 * Convert Hexadecimal to Decimal
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof Hex2DecCommand
	 */
	public async run(msg: CommandoMessage, args: { numberToConvert: string }): Promise<Message | Message[]> {
		args.numberToConvert = !args.numberToConvert.toLowerCase().startsWith('0x') ? `0x${args.numberToConvert.toUpperCase()}` : `0x${args.numberToConvert.toLowerCase().replace('0x', '').toUpperCase()}`;

		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = ${Convert.hex2dec(args.numberToConvert)}`, {name: 'Hexadecimal to Decimal Conversion:'});
	}
}
