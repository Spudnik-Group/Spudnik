/**
 * Copyright (c) 2020 Spudnik Group
 */

import { KlasaClient, CommandStore, KlasaMessage, Command } from 'klasa';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Permissions } from 'discord.js';

/**
 * Post a link to the Spudnik code repository.
 *
 * @export
 * @class SourceCommand
 * @extends {Command}
 */
export default class SourceCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns a link to my source code!',
			guarded: true,
			name: 'source',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS
		});
	}

	/**
	 * Run the "source" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SourceCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessage(msg, '<https://github.com/Spudnik-Group/Spudnik>');
	}
}
