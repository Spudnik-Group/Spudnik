/**
 * Copyright (c) 2020 Spudnik Group
 */

import { CommandStore, KlasaMessage, Command } from 'klasa';
import { sendSimpleEmbeddedMessage } from '@lib/helpers';
import { Permissions } from 'discord.js';

/**
 * Provides links to suggest features, submit bugs, or email the devs.
 *
 * @export
 * @class FeedbackCommand
 * @extends {Command}
 */
export default class FeedbackCommand extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Provides links to suggest features, submit bugs, or email the devs.',
			guarded: true,
			name: 'feedback',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS
		});
	}

	/**
	 * Run the "feedback" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof FeedbackCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessage(msg, `
			*Give us Feedback!*
			
			Make a [Feature Suggestion](<https://feathub.com/Spudnik-Group/Spudnik>)
			File a [GitHub Issue](<https://github.com/Spudnik-Group/Spudnik/issues/new/choose>)
			Email the Devs: comrades@spudnik.io
		`);
	}
}
