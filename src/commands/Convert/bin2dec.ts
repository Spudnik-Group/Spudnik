import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Bin2DecCommand
	 */
	public async run(msg: KlasaMessage, args: { numberToConvert: string }): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessageWithAuthor(msg, `${args.numberToConvert} = ${Convert.bin2dec(args.numberToConvert)}`, {name: 'Binary to Decimal Conversion:'});
	}
}
