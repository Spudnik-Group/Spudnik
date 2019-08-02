import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';
import { deleteCommandMessages } from 'src/lib/custom-helpers';

/**
 * Converts Decimal to Binary
 *
 * @export
 * @class Dec2BinCommand
 * @extends {Command}
 */
export default class Dec2BinCommand extends Command {
	/**
	 * Creates an instance of Dec2BinCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Dec2BinCommand
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
						return /^[0-9]+$/.test(numberToConvert);
					}
				}
			],
			description: 'Converts hexadecimal to decimal',
			examples: ['!dec2bin 42'],
			group: 'convert',
			guildOnly: true,
			memberName: 'dec2bin',
			name: 'dec2bin',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "dec2bin" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof Dec2BinCommand
	 */
	public async run(msg: CommandoMessage, args: { numberToConvert: string }): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = ${Convert.dec2bin(args.numberToConvert)}`, {name: 'Decimal to Binary Conversion:'});
	}
}
