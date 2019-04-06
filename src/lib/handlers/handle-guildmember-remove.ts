import { GuildMember, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';

export const handleGuildMemberRemove = (member: GuildMember, client: CommandoClient) => {
	const guild = member.guild;
	const goodbyeEnabled = client.provider.get(guild, 'goodbyeEnabled', false);
	const goodbyeChannel = client.provider.get(guild, 'goodbyeChannel');

	if (goodbyeEnabled && goodbyeChannel) {
		const goodbyeMessage = client.provider.get(guild, 'goodbyeMessage', '{user} has left the server.');
		const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', `<@${member.id}> (${member.user.tag})`);
		const channel = guild.channels.get(goodbyeChannel);
		
		if (channel && channel.type === 'text') {
			(channel as TextChannel).send(message);
		} else {
			client.emit('warn', `There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`);
		}
	}
}