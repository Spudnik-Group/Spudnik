const chalk = require('chalk');
const AntiraidSettings = require('../../classes/antiraid-settings');
const GuildAntiraidSettingsSchema = require('../../classes/guild-antiraid-settings-schema');
const guildAssignableRolesSchema = require('../../classes/guild-assignable-roles-schema');
const guildDefaultRoleSchema = require('../../classes/guild-default-role-schema');

module.exports = Spudnik => {
	const GuildAntiraidSettings = Spudnik.Database.model('GuildAntiraidSettings', GuildAntiraidSettingsSchema);
	const guildAssignableRoles = Spudnik.Database.model('GuildAssignableRolesSchema', guildAssignableRolesSchema);
	const guildDefaultRoles = Spudnik.Database.model('GuildDefaultRoles', guildDefaultRoleSchema);

	Spudnik.Discord.once('ready', () => {
		console.log(`Logged into Discord! Serving in ${Spudnik.Discord.guilds.array().length} Discord servers`);
	});

	Spudnik.Discord.on('ready', () => {
		// Update bot status
		Spudnik.Discord.user.setPresence({ game: { name: `${Spudnik.Config.commandPrefix}help | ${Spudnik.Discord.guilds.array().length} Servers`, type: 0 } });

		// Setup anti-raid settings
		GuildAntiraidSettings.find((error, guildSettings) => {
			if (error) {
				console.log(chalk.red('Error: ' + error));
				return false;
			}

			guildSettings.forEach(settings => {
				const guild = Spudnik.Discord.guilds.find('id', settings.guildId);
				if (guild) {
					Spudnik.antiraidGuilds[settings.guildId] = new AntiraidSettings(guild, settings);
				}
			});

			return true;
		});

		// Setup roles
		if (!Spudnik.Config.roles) {
			Spudnik.Config.roles = [];
		}

		guildAssignableRoles.find((err, guildSettings) => {
			if (err) {
				console.log(chalk.red(`Error: ${err}`));
				return false;
			}

			guildSettings.forEach(settings => {
				const guild = Spudnik.Discord.guilds.find('id', settings.guildId);

				if (guild) {
					if (!Spudnik.Config.roles[settings.guildId]) {
						Spudnik.Config.roles[settings.guildId] = {};
					}

					Spudnik.Config.roles[settings.guildId].assignable = settings.roleIds;
				}
			});

			return true;
		});

		guildDefaultRoles.find((err, guildSettings) => {
			if (err) {
				console.log(chalk.red(`Error: ${err}`));
				return false;
			}

			guildSettings.forEach(settings => {
				const guild = Spudnik.Discord.guilds.find('id', settings.guildId);

				if (guild) {
					if (!Spudnik.Config.roles[settings.guildId]) {
						Spudnik.Config.roles[settings.guildId] = {};
					}

					Spudnik.Config.roles[settings.guildId].default = settings.roleId;
				}
			});

			return true;
		});
	});
};
