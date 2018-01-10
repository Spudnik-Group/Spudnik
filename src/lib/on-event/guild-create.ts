import { Spudnik } from "../../spudnik";

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildCreate', () => {
		Spudnik.Discord.user.setGame(`${Spudnik.Config.getCommandPrefix()}help | ${Spudnik.Discord.guilds.array().length} Servers`);
	});
};
