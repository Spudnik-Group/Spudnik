/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, Timestamp, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { perms } from '@lib/constants/permissions';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { Role } from 'discord.js';

export default class RoleInfoComand extends Command {

	private timestamp: Timestamp;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['roleinfo'],
			description: 'Get information on a role with an id or a mention.',
			usage: '<Role:role>'
		});
		this.timestamp = new Timestamp('dddd, MMMM d YYYY');
	}

	public run(msg: KlasaMessage, [role]: [Role]): Promise<KlasaMessage | KlasaMessage[]> {
		const allPermissions = Object.entries(role.permissions.serialize()).filter((perm: [string, boolean]) => perm[1]).map(([perm]: [string, boolean]) => perms[perm])
			.join(', ');
		const defaultRole = msg.guild.settings.get(GuildSettings.Tos.Role);

		return msg.sendEmbed(baseEmbed(msg)
			.setTitle('Role Info')
			.setAuthor(role.name)
			.addField('❯ Name', role.name, true)
			.addField('❯ ID', role.id, true)
			.addField('❯ Is Default (TOS) Role', defaultRole === role.toString(), true)
			.addField('❯ Members', role.members.size, true)
			.addField('❯ Creation Date', this.timestamp.display(role.createdAt), true)
			.addField('❯ Hoisted', role.hoist ? 'Yes' : 'No', true)
			.addField('❯ Mentionable', role.mentionable ? 'Yes' : 'No', true)
			.addField('❯ External', role.managed ? 'Yes' : 'No', true)
			.addField('❯ Permissions', allPermissions || 'None')
			.setThumbnail(`https://dummyimage.com/250/${role.hexColor.slice(1)}/&test=%20`));
	}

}
