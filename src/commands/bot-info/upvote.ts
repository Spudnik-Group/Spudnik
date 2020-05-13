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
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		return msg.sendSimpleEmbed(stripIndents`
			Upvote Spudnik for the Motherland!
			* [discord.boats](https://discordapp.com/channels/294483428651302924/453976646341361675/563127272635236373)
			* [cloudlist.xyz](https://www.cloudlist.xyz/bots/398591330806398989)
			* [top.gg](https://top.gg/bot/398591330806398989)
			* [botsfordiscord.com](https://botsfordiscord.com/bot/398591330806398989)
			* [discordbotlist.com](https://discordbotlist.com/bots/398591330806398989)
			* [lbots.org](https://lbots.org/bots/398591330806398989)
			* [listmybots.com](https://listmybots.com/bot/398591330806398989)
			* [discordextremelist.xyz](https://discordextremelist.xyz/bots/398591330806398989)

			Review Spudnik for the Motherland!
			* [discordapps.dev](https://discordapps.dev/en-GB/bots/398591330806398989)
		`);
	}

}
