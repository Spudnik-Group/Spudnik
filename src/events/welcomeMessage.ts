import { Guild, GuildMember, TextChannel } from 'discord.js';
import { Event } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Event {

	public async run(guild: Guild, member: GuildMember): Promise<void> {
		const welcomeEnabled = guild.settings.get(GuildSettings.Welcome.Enabled);
		const welcomeMessage = guild.settings.get(GuildSettings.Welcome.Message);
		const welcomeChannel = guild.settings.get(GuildSettings.Welcome.Channel);

		if (welcomeEnabled && welcomeMessage && welcomeChannel) {
			const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
			const channel = guild.channels.get(welcomeChannel);

			if (channel) {
				await (channel as TextChannel).send(message);
			} else {
				this.client.emit('warn', `There was an error trying to welcome a new guild member in ${guild}, the channel may no longer exist.`);
			}
		}
	}

}
