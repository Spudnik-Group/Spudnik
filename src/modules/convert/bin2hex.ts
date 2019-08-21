import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Convert Binary to Hexadecimal
 *
 * @export
 * @class Bin2HexCommand
 * @extends {Command}
 */
export default class Bin2HexCommand extends Command {
	/**
	 * Creates an instance of Bin2HexCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Bin2HexCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'numberToConvert',
					prompt: 'Please enter a valid number to convert.\n',
					type: 'string',
					validate: (numberToConvert: string) => {
						return /^[0-1]+$/.test(numberToConvert);
					}
				}
			],
			description: 'Converts binary to decimal',
			examples: [
				'!bin2hex 100',
				'!bin2hex 0101'
			],
			group: 'convert',
			guildOnly: true,
			memberName: 'bin2hex',
			name: 'bin2hex',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "bin2hex" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof Bin2HexCommand
	 */
	public async run(msg: CommandoMessage, args: { numberToConvert: string }): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = 0x${Convert.bin2hex(args.numberToConvert).toUpperCase()}`, {name: 'Binary to Hexadecimal Conversion:'});
	}
}
