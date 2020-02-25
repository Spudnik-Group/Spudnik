/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';
import { SpudConfig } from '@lib/config/spud-config';
import { TextChannel, GuildMember, Guild } from 'discord.js';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Event {

	async run(member: GuildMember) {
		const guild: Guild = member.guild;
		if (SpudConfig.botListGuilds.includes(guild.id)) { return; } //Guild is on Blacklist, ignore.
		const goodbyeEnabled = guild.settings.get(GuildSettings.Goodbye.Enabled);
		const goodbyeChannel = guild.settings.get(GuildSettings.Goodbye.Channel);

		if (goodbyeEnabled && goodbyeChannel) {
			const goodbyeMessage = guild.settings.get(GuildSettings.Goodbye.Message);
			const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}> (${member.user.tag})`);
			const channel = guild.channels.get(goodbyeChannel);

			if (channel) {
				(channel as TextChannel).send(message);
			} else {
				this.client.emit('warn', `There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
			}
		}
	}

};
