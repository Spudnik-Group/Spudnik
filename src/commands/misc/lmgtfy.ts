/**
 * Copyright (c) 2020 Spudnik Group
 */

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

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['google-this'],
			description: 'Returns a Let Me Google That For You link, so you can school a n00b.',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '<query:...string>'
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
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleEmbed(`<http://lmgtfy.com/?q=${encodeURI(query)}>`);
	}

}
