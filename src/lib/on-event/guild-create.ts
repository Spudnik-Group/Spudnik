import { Spudnik } from '../../spudnik';

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildCreate', () => {
		Spudnik.Discord.user.setActivity(`${Spudnik.Discord.commandPrefix}help | ${Spudnik.Discord.guilds.array().length} Servers`);
	});
};
