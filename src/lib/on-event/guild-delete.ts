import { Spudnik } from "../../spudnik";

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildDelete', guild => {
		Spudnik.Discord.user.setGame(`${Spudnik.Config.getCommandPrefix()}help | ${Spudnik.Discord.guilds.array().length} Servers`);

		// Upon the bot leaving a server, we should no longer keep their settings.
		// delete Spudnik.Config.antiraid[guild.id];
		// delete Spudnik.Config.roles[guild.id];
		// Spudnik.Database.clear(guild.id);
	});
};
