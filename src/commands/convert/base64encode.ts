/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { Convert } from '@lib/helpers/convert';

/**
 * Base64 encodes a string
 *
 * @export
 * @class Base64EncodeCommand
 * @extends {Command}
 */
export default class Base64EncodeCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Base64 encodes a string',
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
	public async run(msg: KlasaMessage, [stringToEncode]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		console.log(stringToEncode);
		console.log(Convert.base64encode(stringToEncode));

		const returnMessage = baseEmbed(msg)
			.setAuthor('Base64 Encoded String:')
			.addField('Input:', stringToEncode)
			.addField('Output:', Convert.base64encode(stringToEncode));

		return msg.sendEmbed(returnMessage);
	}

}
