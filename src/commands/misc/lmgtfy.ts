/**
 * Copyright (c) 2020 Spudnik Group
 */

import { sendSimpleEmbeddedMessage } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';

/**
 * Generates a "Let Me Google That For You" link.
 *
 * @export
 * @class LmgtfyCommand
 * @extends {Command}
 */
export default class LmgtfyCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns a Let Me Google That For You link, so you can school a n00b.',
			name: 'lmgtfy',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '<query:string>'
		});
	}

	/**
	 * Run the "lmgtfy" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof LmgtfyCommand
	 */
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessage(msg, `<http://lmgtfy.com/?q=${encodeURI(query)}>`);
	}

}
