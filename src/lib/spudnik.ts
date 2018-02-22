import chalk from 'chalk';
import { Guild, GuildMember } from 'discord.js';
import * as Mongoose from 'mongoose';
import * as path from 'path';
import { SpudnikClient } from './client';
import { Configuration } from './config';
import { MongoProvider } from './providers/mongodb-provider';

// tslint:disable-next-line:no-var-requires
const { mongoDb }: { mongoDb: string } = require('../../config/config.json');

export class Spudnik {
	public Config: Configuration;
	public Discord: SpudnikClient;

	constructor(config: Configuration) {
		this.Config = config;

		this.Discord = new SpudnikClient({
			commandPrefix: '!',
			messageCacheLifetime: 30,
			messageSweepInterval: 60,
			owner: this.Config.getOwner(),
			config: this.Config,
		});

		this.setupCommands();
		this.setupEvents();
		this.setupDatabase();
		this.login();

		console.log(chalk.blue('---Spudnik MECO---'));
	}

	private setupCommands = () => {
		this.Discord.registry
			.registerGroups([
				['misc', 'Misc'],
				['music', 'Music'],
				['mod', 'Moderation'],
				['util', 'Utility'],
				['random', 'Random'],
				['ref', 'Reference'],
				['roles', 'Roles'],
				['translate', 'Translate'],
			])
			.registerDefaults()
			.registerCommandsIn(path.join(__dirname, '../modules'));
	}
	private setupDatabase = () => {
		this.Discord.setProvider(
			Mongoose.connect(mongoDb).then(() => new MongoProvider(Mongoose.connection)),
		).catch((err) => {
			console.error(err);
			process.exit(-1);
		});
	}
	private setupEvents = () => {
		/*const guildAssignableRoles = Spudnik.Database.model('GuildAssignableRolesSchema', GuildAssignableRolesSchema);
		const guildDefaultRoles = Spudnik.Database.model('GuildDefaultRoles', GuildDefaultRoleSchema);
		const guildWelcomeMessages = Spudnik.Database.model('GuildWelcomeMessages', GuildWelcomeMessagesSchema);*/

		this.Discord.once('ready', () => {
			console.log(chalk.magenta(`Logged into Discord! Serving in ${this.Discord.guilds.array().length} Discord servers`));
			console.log(chalk.blue('---Spudnik Launch Success---'));

			// Update bot status
			this.Discord.user.setPresence({
				activity: {
					type: 'STREAMING',
					name: `${this.Discord.commandPrefix}help | ${this.Discord.guilds.array().length} Servers`,
					url: 'https://www.spudnik.io',
				},
			});
			/*
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

				guildSettings.forEach((settings) => {
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

			// Setup welcome messages
			guildWelcomeMessages.find((err: any, guildSettings: any[]) => {
				if (err) {
					console.log(chalk.red(`Error: ${err}`));
					return false;
				}

				guildSettings.forEach((settings) => {
					console.log(chalk.yellow(settings));
					const guild = Spudnik.Discord.guilds.find('id', settings.guildId);

					if (guild) {
						if (!Spudnik.Config.welcomeMessages[settings.guildId]) {
							Spudnik.Config.welcomeMessages[settings.guildId] = settings.welcomeMessage;
						}
					}
				});

				return true;
			});*/
		});
		this.Discord.on('guildMemberAdd', (member: GuildMember) => {
			const guild = member.guild;
			const guildId = guild.id;

			if (!guild) {
				console.log(chalk.red(`A member joined a guild Spudnik is not a part of ('id': ${guildId})`));
			}

			/*
			// Add default role to new user
			if (Spudnik.Config.roles && (Object.keys(Spudnik.Config.roles).indexOf(guild.id) > -1) && Spudnik.Config.roles[guild.id].default) {
				const role = guild.roles.filter((x) => x.id === Spudnik.Config.roles[guild.id].default).first();

				if (role) {
					console.log(chalk.blue(`Added default role ${role.name}:${role.id} to ${member.nickname}:${member.id} on ${guild.name}:${guild.id}`));
					member.addRole(role);
				} else {
					console.log(chalk.red(`Default role for ${guild.name}:${guild.id} is not configured properly.`));
				}
			}

			// Welcome new user
			if (Spudnik.Config.welcomeMessages && Spudnik.Config.welcomeMessages[guild.id]) {
				const message = Spudnik.Config.welcomeMessages[guild.id].replace('{guild}', guild.name).replace('{user}', member.displayName);

				member.send(message);
			}
			*/
		});
		this.Discord.on('guildMemberRemove', (member: GuildMember) => {
			const guild = member.guild;
			if (guild.systemChannel) {
				guild.systemChannel.send(`${member.user.username} has left the server.`);
			}
		});
		this.Discord.on('guildCreate', () => {
			this.Discord.user.setActivity(`${this.Discord.commandPrefix}help | ${this.Discord.guilds.array().length} Servers`);
		});
		this.Discord.on('guildDelete', (guild: Guild) => {
			this.Discord.user.setActivity(`${this.Discord.commandPrefix}help | ${this.Discord.guilds.array().length} Servers`);
		});
		this.Discord.on('disconnected', () => {
			console.log(chalk.red('Disconnected from Discord!'));
		});
	}
	private login = () => {
		if (this.Config.getToken()) {
			console.log(chalk.magenta('Logging in to Discord...'));

			this.Discord.login(this.Config.getToken());
		} else {
			console.error('Spudnik must have a Discord bot token...');
			process.exit(-1);
		}
	}
}
