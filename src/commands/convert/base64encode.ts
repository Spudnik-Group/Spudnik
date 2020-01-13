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
			usage: '<stringToEncode:...string>'
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
		console.log(stringToEncode);
		console.log(Convert.base64encode(stringToEncode));

		const returnMessage = new MessageEmbed({
			author: {
				name: 'Base64 Encoded String:'
			},
			color: getEmbedColor(msg)
		})
			.addField('Input:', stringToEncode)
			.addField('Output:', Convert.base64encode(stringToEncode));

		return msg.sendEmbed(returnMessage);
	}
}
