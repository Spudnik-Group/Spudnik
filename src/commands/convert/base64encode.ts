import { MessageEmbed } from 'discord.js';
import { Convert, getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Base64 encodes a string
 *
 * @export
 * @class Base64EncodeCommand
 * @extends {Command}
 */
export default class Base64EncodeCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Base64 encodes a string',
			name: 'base64encode',
			usage: '<stringToEncode:string>'
		});
	}

	/**
	 * Run the "base64encode" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Base64EncodeCommand
	 */
	public async run(msg: KlasaMessage, [stringToEncode]): Promise<KlasaMessage | KlasaMessage[]> {
		const returnMessage = new MessageEmbed({
			author: {
				name: 'Base64 Encoded String:'
			},
			color: getEmbedColor(msg)
		})
			.addField({
				inline: false,
				name: 'Input:',
				value: `${stringToEncode}`
			}, false)
			.addField({
				inline: false,
				name: 'Output:',
				value: `${Convert.base64encode(stringToEncode)}`
			}, false);

		return msg.sendEmbed(returnMessage);
	}
}
