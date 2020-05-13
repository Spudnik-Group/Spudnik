/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Permissions, Invite } from 'discord.js';

export default class TopInvitesCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ti'],
			description: 'Shows the top invites in a server.',
			requiredPermissions: Permissions.FLAGS.MANAGE_GUILD
		});
	}

	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const invites = await msg.guild.fetchInvites();
		const topTen = invites.filter((inv: Invite) => inv.uses > 0).sort((a: Invite, b: Invite) => b.uses - a.uses).first(10);
		if (topTen.length === 0) throw 'There are no invites, or none of them have been used!';

		return msg.sendSimpleEmbed(
			topTen.map((inv: Invite) => `**${inv.inviter.username}**'s invite **${inv.code}** has **${inv.uses.toLocaleString()}** uses.`).join('\n')
		);
	}

}
