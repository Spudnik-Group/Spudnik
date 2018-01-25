import { Guild } from 'discord.js';
import { Spudnik } from '../../spudnik';

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildDelete', (guild: Guild) => {
		Spudnik.Discord.user.setActivity(`${Spudnik.Discord.commandPrefix}help | ${Spudnik.Discord.guilds.array().length} Servers`);
	});
};
