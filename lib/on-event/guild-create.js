module.exports = Spudnik => {
	Spudnik.Discord.on('guildCreate', () => {
		Spudnik.Discord.user.setGame(`${Spudnik.Config.commandPrefix}help | ${Spudnik.Discord.guilds.array().length} Servers`);
	});
};
