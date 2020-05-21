/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';
import { SpudConfig } from '@lib/config/spud-config';
import { TextChannel, GuildMember } from 'discord.js';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Event {

	public async run(member: GuildMember): Promise<void> {
		const { guild } = member;
		if (SpudConfig.botListGuilds.includes(guild.id)) return; // Guild is on Blacklist, ignore.
		const goodbyeEnabled = guild.settings.get(GuildSettings.Goodbye.Enabled);
		const goodbyeChannel = guild.settings.get(GuildSettings.Goodbye.Channel);

		if (goodbyeEnabled && goodbyeChannel) {
			const goodbyeMessage = guild.settings.get(GuildSettings.Goodbye.Message);
			const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}> (${member.user.tag})`);
			const channel = guild.channels.get(goodbyeChannel);

			if (channel) {
				await (channel as TextChannel).send(message);
			} else {
				this.client.emit('warn', `There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
			}
		}
	}

}
