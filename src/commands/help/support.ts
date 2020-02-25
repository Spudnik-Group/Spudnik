/**
 * Copyright (c) 2020 Spudnik Group
 */

import { sendSimpleEmbeddedMessage } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';

/**
 * Post a link to the Spudnik Command Discord Server.
 *
 * @export
 * @class SupportCommand
 * @extends {Command}
 */
export default class SupportCommand extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns a link to my support server!',
			guarded: true,
			name: 'support',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS
		});
	}

	/**
	 * Run the "support" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SupportCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessage(msg, '<https://spudnik.io/support>');
	}
}
