/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { CommandStore, KlasaMessage, Command } from 'klasa';
import { sendSimpleEmbeddedMessage } from '@lib/helpers';
import { Permissions } from 'discord.js';

/**
 * Returns links to upvote the bot on bot listing sites.
 *
 * @export
 * @class UpvoteCommand
 * @extends {Command}
 */
export default class UpvoteCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns links to upvote the bot on bot listing sites.',
			guarded: true,
			name: 'upvote',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS
		});
	}

	/**
	 * Run the "upvote" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UpvoteCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return sendSimpleEmbeddedMessage(msg, stripIndents`UPVOTE THIS BOT FOR THE MOTHERLAND!
			* [bots.ondiscord.xyz](https://bots.ondiscord.xyz/bots/398591330806398989)
			* [discord.bots.gg](https://discord.bots.gg/bots/398591330806398989)
			* [botsfordiscord.com](https://botsfordiscord.com/bot/398591330806398989)
			* [discordbotlist.com](https://discordbotlist.com/bots/398591330806398989)
			* [discordbots.org](https://discordbots.org/bot/398591330806398989)`);
	}
}
