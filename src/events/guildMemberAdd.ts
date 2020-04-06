/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';
import { SpudConfig } from '@lib//config/spud-config';
import { TextChannel, GuildMember } from 'discord.js';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Event {

	public async run(member: GuildMember): Promise<void> {
		const { guild } = member;
		if (SpudConfig.botListGuilds.includes(guild.id)) return; // Guild is on Blacklist, ignore.
		const welcomeEnabled = guild.settings.get(GuildSettings.Welcome.Enabled);
		const welcomeChannel = guild.settings.get(GuildSettings.Welcome.Channel);

		if (welcomeEnabled && welcomeChannel) {
			const welcomeMessage = guild.settings.get(GuildSettings.Welcome.Message);
			const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
			const channel = guild.channels.get(welcomeChannel);

			if (channel) {
				await (channel as TextChannel).send(message);
			} else {
				this.client.emit('warn', `There was an error trying to welcome a new guild member in ${guild}, the channel may no longer exist or was set to a non-text channel`);
			}
		}
	}

}
