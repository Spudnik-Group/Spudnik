/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { CommandStore, KlasaMessage, Command } from 'klasa';
import { Permissions } from 'discord.js';

/**
 * Returns links to upvote the bot on bot listing sites.
 *
 * @export
 * @class UpvoteCommand
 * @extends {Command}
 */
export default class UpvoteCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns links to upvote the bot on bot listing sites.',
			guarded: true,
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
	public run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleEmbed(stripIndents`
			Upvote Spudnik for the Motherland!
			* [arcane-center.xyz](https://arcane-center.xyz/bot/398591330806398989)
			* [botlist.space](https://botlist.space/bot/398591330806398989)
			* [botsfordiscord.com](https://botsfordiscord.com/bot/398591330806398989)
			* [cloudlist.xyz](https://www.cloudlist.xyz/bots/398591330806398989)
			* [discordbotlist.com](https://discordbotlist.com/bots/398591330806398989)
			* [discordextremelist.xyz](https://discordextremelist.xyz/bots/398591330806398989)
			* [listmybots.com](https://listmybots.com/bots/398591330806398989)
			* [mythicalbots.xyz](https://mythicalbots.xyz/bot/398591330806398989)
			* [top.gg](https://top.gg/bot/398591330806398989)

			Rate/Review Spudnik for the Motherland!
			* [bots.ondiscord.xyz](https://bots.ondiscord.xyz/bots/398591330806398989)
			* [discord.boats](https://discord.boats/bot/398591330806398989)
			* [discordapps.dev](https://discordapps.dev/en-GB/bots/398591330806398989)
		`);
	}

}
