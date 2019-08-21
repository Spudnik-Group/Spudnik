import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Converts Decimal to Hexadecimal
 *
 * @export
 * @class Dec2HexCommand
 * @extends {Command}
 */
export default class Dec2HexCommand extends Command {
	/**
	 * Creates an instance of Dec2HexCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Dec2HexCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'numberToConvert',
					prompt: 'Please enter a valid number to convert.\n',
					type: 'string',
					validate: (numberToConvert: string) => {
						return /^[0-9]+$/.test(numberToConvert);
					}
				}
			],
			description: 'Converts decimal to hexadecimal',
			examples: ['!dec2hex 42'],
			group: 'convert',
			guildOnly: true,
			memberName: 'dec2hex',
			name: 'dec2hex',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "dec2hex" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof Dec2HexCommand
	 */
	public async run(msg: CommandoMessage, args: { numberToConvert: string }): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = 0x${Convert.dec2hex(args.numberToConvert).toUpperCase()}`, {name: 'Decimal to Hexadecimal Conversion:'});
	}
}
