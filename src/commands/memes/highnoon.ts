/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions } from 'discord.js';

/**
 * Show the XKCD "Now" comic.
 *
 * @export
 * @class HighNoonCommand
 * @extends {Command}
 */
export default class HighNoonCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Displays the High Noon XKCD comic.',
			name: 'highnoon',
			requiredPermissions: Permissions.FLAGS.ATTACH_FILES
		});
	}

	/**
	 * Run the "highnoon" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof HighNoonCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleImage("IT'S HIGH NOON...", 'http://imgs.xkcd.com/comics/now.png');
	}

}
