/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Task } from 'klasa';
import { Guild, GuildMember } from 'discord.js';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Task {

	public async run({ guild, user }: { guild: string, user: string }): Promise<void> {
		const _guild: Guild = this.client.guilds.get(guild);
		if (!_guild) return;
		const member: GuildMember = await _guild.members.fetch(user).catch(() => null);
		if (!member) return;
		await member.roles.remove(_guild.settings.get(GuildSettings.Roles.Muted));
	}

}
