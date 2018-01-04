module.exports = Spudnik => {
	Spudnik.Discord.on('guildDelete', guild => {
		Spudnik.Discord.user.setGame(`${Spudnik.Config.commandPrefix}help | ${Spudnik.Discord.guilds.array().length} Servers`);

		// Upon the bot leaving a server, we should no longer keep their antiraid settings.
		delete Spudnik.antiraidGuilds[guild.id];
	});
};
