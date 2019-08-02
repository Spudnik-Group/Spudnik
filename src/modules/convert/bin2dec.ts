import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessageWithAuthor } from '../../lib/helpers';
import { Convert } from '../../lib/convert';
import { deleteCommandMessages } from '../../lib/custom-helpers';

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
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'numberToConvert',
					prompt: 'What number do you want to convert?\n',
					type: 'string',
					validate: (numberToConvert: string) => {
						return /^[0-1]+$/.test(numberToConvert);
					}
				}
			],
			description: 'Converts binary to decimal',
			examples: [
				'!bin2dec 100',
				'!bin2dec 0101'
			],
			group: 'convert',
			guildOnly: true,
			memberName: 'bin2dec',
			name: 'bin2dec',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "bin2dec" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof Bin2DecCommand
	 */
	public async run(msg: CommandoMessage, args: { numberToConvert: string }): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = ${Convert.bin2dec(args.numberToConvert)}`, {name: 'Binary to Decimal Conversion:'});
	}
}
