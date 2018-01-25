import { GuildMember } from 'discord.js';
import { Spudnik } from '../../spudnik';

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildMemberRemove', (member: GuildMember) => {
		const guild = member.guild;
		if (guild.systemChannel) {
			guild.systemChannel.send(`${member.user.username} has left the server.`);
		}
	});
};
