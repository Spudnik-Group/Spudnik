/**
 * Copyright (c) 2020 Spudnik Group
 */

import { CommandStore, KlasaMessage, Command } from 'klasa';
import { Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';

/**
 * Provides links to suggest features, submit bugs, or email the devs.
 *
 * @export
 * @class FeedbackCommand
 * @extends {Command}
 */
export default class FeedbackCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Provides links to suggest features, submit bugs, or email the devs.',
			guarded: true,
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
	public run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleEmbed(stripIndents`
			*Give us Feedback!*
			
			Make a [Feature Suggestion](<https://feathub.com/Spudnik-Group/Spudnik>)
			File a [GitHub Issue](<https://github.com/Spudnik-Group/Spudnik/issues/new/choose>)
			OR E-mail the Devs: comrades@spudnik.io
		`);
	}

}
