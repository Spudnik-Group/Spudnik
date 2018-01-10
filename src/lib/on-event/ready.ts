import chalk from 'chalk';

import { Spudnik } from "../../spudnik";
import { Role } from '../config'
import { AntiraidSettings } from '../antiraid-settings';

// Import schemas need on ready
import { GuildAntiraidSettingsSchema } from '../schemas/guild-antiraid-settings-schema';
import { GuildAssignableRolesSchema } from '../schemas/guild-assignable-roles-schema';
import { GuildDefaultRoleSchema } from '../schemas/guild-default-role-schema';

module.exports = (Spudnik: Spudnik) => {
	const guildAntiraidSettings = Spudnik.Database.model('GuildAntiraidSettings', GuildAntiraidSettingsSchema);
	const guildAssignableRoles = Spudnik.Database.model('GuildAssignableRolesSchema', GuildAssignableRolesSchema);
	const guildDefaultRoles = Spudnik.Database.model('GuildDefaultRoles', GuildDefaultRoleSchema);

	Spudnik.Discord.once('ready', () => {
		console.log(`Logged into Discord! Serving in ${Spudnik.Discord.guilds.array().length} Discord servers`);
		console.log(chalk.blue(`---Spudnik Launch Success---`));

		// Update bot status
		Spudnik.Discord.user.setPresence({ game: { name: `${Spudnik.Config.getCommandPrefix()}help | ${Spudnik.Discord.guilds.array().length} Servers` } });

		// Setup anti-raid settings
		/*
		guildAntiraidSettings.find((error: any, guildSettings: AntiraidSettings[]) => {
			if (error) {
				console.log(chalk.red('Error: ' + error));
				return false;
			}

			guildSettings.forEach((settings: AntiraidSettings) => {
				const guild = Spudnik.Discord.guilds.find('id', settings.guildId);
				if (guild) {
					Spudnik.Config.antiraidGuilds[settings.guildId] = new AntiraidSettings(guild, settings);
				}
			});

			return true;
		});
		*/

		// Setup roles
		guildAssignableRoles.find((err: any, guildSettings: object[]) => {
			if (err) {
				console.log(chalk.red(`Error: ${err}`));
				return false;
			}

			guildSettings.forEach((settings: any) => {
				const guild = Spudnik.Discord.guilds.find('id', settings.guildId);

				if (guild) {
					if (!Spudnik.Config.roles[settings.guildId]) {
						Spudnik.Config.roles[settings.guildId] = new Role();
					}

					Spudnik.Config.roles[settings.guildId].assignable = settings.roleIds;
				}
			});

			return true;
		});

		guildDefaultRoles.find((err: any, guildSettings: any[]) => {
			if (err) {
				console.log(chalk.red(`Error: ${err}`));
				return false;
			}

			guildSettings.forEach(settings => {
				const guild = Spudnik.Discord.guilds.find('id', settings.guildId);

				if (guild) {
					if (!Spudnik.Config.roles[settings.guildId]) {
						Spudnik.Config.roles[settings.guildId] = new Role();
					}

					Spudnik.Config.roles[settings.guildId].default = settings.roleId;
				}
			});

			return true;
		});
	});
};
