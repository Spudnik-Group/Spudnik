import { MessageEmbed } from 'discord.js';
import { Convert, getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Base64 decodes a string
 *
 * @export
 * @class Base64DecodeCommand
 * @extends {Command}
 */
export default class Base64DecodeCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Base64 decodes a string',
			name: 'base64decode',
			usage: '<stringToDecode:regex/^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)?$/>'
		});
	}

	/**
	 * Run the "base64decode" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Base64DecodeCommand
	 */
	public async run(msg: KlasaMessage, [stringToDecode]): Promise<KlasaMessage | KlasaMessage[]> {
		const returnMessage = new MessageEmbed({
			author: {
				name: 'Base64 Decoded String:'
			},
			color: getEmbedColor(msg)
		})
			.addField('Input:', stringToDecode)
			.addField('Output:', Convert.base64decode(stringToDecode));

		return msg.sendEmbed(returnMessage);
	}
}
