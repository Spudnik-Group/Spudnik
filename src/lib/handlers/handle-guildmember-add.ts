import { GuildMember, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';

const botlistGuilds: string[] = process.env.spud_botlist_guilds ? process.env.spud_botlist_guilds.split(',') : [];

export const handleGuildMemberAdd = (member: GuildMember, client: CommandoClient) => {
	const guild = member.guild;
	if (botlistGuilds.includes(guild.id)) { return; } //Guild is on Blacklist, ignore.
	const welcomeEnabled = client.provider.get(guild, 'welcomeEnabled', false);
	const welcomeChannel = client.provider.get(guild, 'welcomeChannel');

	if (welcomeEnabled && welcomeChannel) {
		const welcomeMessage = client.provider.get(guild, 'welcomeMessage', '@here, please Welcome {user} to {guild}!');
		const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}>`);
		const channel = guild.channels.get(welcomeChannel);
		
		if (channel && channel.type === 'text') {
			(channel as TextChannel).send(message);
		} else {
			client.emit('warn', `There was an error trying to welcome a new guild member in ${guild}, the channel may no longer exist or was set to a non-text channel`);
		}
	}
}
