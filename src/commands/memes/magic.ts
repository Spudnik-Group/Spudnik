/**
 * Copyright (c) 2020 Spudnik Group
 */

import { sendSimpleEmbeddedImage } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';

/**
 * Display a magical gif of Shia Labeouf.
 *
 * @export
 * @class MagicCommand
 * @extends {Command}
 */
export default class MagicCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Displays a magical gif of Shia Labeouf.',
			name: 'magic',
			requiredPermissions: Permissions.FLAGS.ATTACH_FILES
		});
	}

	/**
	 * Run the "magic" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof MagicCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedImage(msg, 'https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.gif');
	}

}
