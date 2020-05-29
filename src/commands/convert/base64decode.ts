/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Convert } from '@lib/helpers/convert';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Base64 decodes a string
 *
 * @export
 * @class Base64DecodeCommand
 * @extends {Command}
 */
export default class Base64DecodeCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Base64 decodes a string',
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
	public run(msg: KlasaMessage, [stringToDecode]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const returnMessage = baseEmbed(msg)
			.setAuthor('Base64 Decoded String:')
			.addField('Input:', `\`${stringToDecode}\``)
			.addField('Output:', `\`${Convert.base64decode(stringToDecode)}\``);

		return msg.sendEmbed(returnMessage);
	}

}
