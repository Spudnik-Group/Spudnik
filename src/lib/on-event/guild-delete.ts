import { Guild } from 'discord.js';
import { Spudnik } from '../../spudnik';

module.exports = (Spudnik: Spudnik) => {
	Spudnik.Discord.on('guildDelete', (guild: Guild) => {
		Spudnik.Discord.user.setGame(`${Spudnik.Config.getCommandPrefix()}help | ${Spudnik.Discord.guilds.array().length} Servers`);

		// Upon the bot leaving a server, we should no longer keep their settings.
		// TODO: fix - delete Spudnik.Config.antiraid[guild.id];
		// TODO: fix - delete Spudnik.Config.roles[guild.id];
		// TODO: fix - Spudnik.Database.clear(guild.id);
	});
};
