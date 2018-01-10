import { Spudnik } from "../../spudnik";

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildMemberRemove', member => {
		const guild = member.guild;
		if (guild.defaultChannel) {
			guild.defaultChannel.send(`${member.user.username} has left the server.`);
		}
	});
};
