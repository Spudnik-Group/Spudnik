import chalk from 'chalk';
import { Guild, GuildMember, TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import * as Mongoose from 'mongoose';
import * as path from 'path';
import { Configuration } from './config';
import { MongoProvider } from './providers/mongodb-provider';

/**
 * The Spudnik Discord Bot.
 *
 * @export
 * @class Spudnik
 */
export class Spudnik {
	public Config: Configuration;
	public Discord: CommandoClient;

	/**
	 * Creates an instance of Spudnik.
	 *
	 * @param {Configuration} config
	 * @memberof Spudnik
	 */
	constructor(config: Configuration) {
		this.Config = config;

		this.Discord = new CommandoClient({
			commandPrefix: '!',
			messageCacheLifetime: 30,
			messageSweepInterval: 60,
			unknownCommandResponse: false,
			owner: this.Config.getOwner(),
		});

		this.setupCommands();
		this.setupEvents();
		this.setupDatabase();
		this.login();

		console.log(chalk.blue('---Spudnik MECO---'));
	}

	/**
	 * Sets up commands for the bot.
	 *
	 * @private
	 * @memberof Spudnik
	 */
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

	/**
	 * Sets up the database.
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private setupDatabase = () => {
		this.Discord.setProvider(
			Mongoose.connect(this.Config.getDatabaseConnection()).then(() => new MongoProvider(Mongoose.connection)),
		).catch((err) => {
			console.error(err);
			process.exit(-1);
		});
	}

	/**
	 * Sets up the bot events watchers.
	 *
	 * @private
	 * @memberof Spudnik
	 */
	private setupEvents = () => {
		this.Discord
			.once('ready', () => {
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
			})
			.on('guildMemberAdd', (member: GuildMember) => {
				const guild = member.guild;
				const welcomeChannel = this.Discord.provider.get(guild, 'welcomeChannel', guild.systemChannelID);
				const welcomeMessage = this.Discord.provider.get(guild, 'welcomeMessage', '@here, please Welcome {user} to {guild}!');
				const welcomeEnabled = this.Discord.provider.get(guild, 'welcomeEnabled', false);

				if (welcomeEnabled) {
					const message = welcomeMessage.replace('{guild}', guild.name).replace('{user}', member.displayName);
					const channel = guild.channels.get(welcomeChannel);
					if (channel && channel.type === 'text') {
						(channel as TextChannel).send(message);
					} else {
						console.log(chalk.red(`There was an error trying to welcome a new guild member to ${guild}, the channel may not exist or was set to a non-text channel`));
					}
				}
			})
			.on('guildMemberRemove', (member: GuildMember) => {
				const guild = member.guild;
				const goodbyeChannel = this.Discord.provider.get(guild, 'goodbyeChannel', guild.systemChannelID);
				const goodbyeMessage = this.Discord.provider.get(guild, 'goodbyeMessage', '{user} has left the server.');
				const goodbyeEnabled = this.Discord.provider.get(guild, 'goodbyeEnabled', false);

				if (goodbyeEnabled) {
					const message = goodbyeMessage.replace('{guild}', guild.name).replace('{user}', member.displayName);
					const channel = guild.channels.get(goodbyeChannel);
					if (channel && channel.type === 'text') {
						(channel as TextChannel).send(message);
					} else {
						console.log(chalk.red(`There was an error trying to say goodbye a former guild member in ${guild}, the channel may not exist or was set to a non-text channel`));
					}
				}
			})
			.on('guildCreate', () => {
				this.Discord.user.setActivity(`${this.Discord.commandPrefix}help | ${this.Discord.guilds.array().length} Servers`);
			})
			.on('guildDelete', (guild: Guild) => {
				this.Discord.user.setActivity(`${this.Discord.commandPrefix}help | ${this.Discord.guilds.array().length} Servers`);
			})
			.on('disconnected', () => {
				console.log(chalk.red('Disconnected from Discord!'));
			})
			.on('error', console.error)
			.on('warn', console.warn)
			.on('debug', (err: Error) => {
				if (this.Config.getDebug()) {
					console.log(err);
				}
			})
			.on('commandError', (cmd, err) => {
				console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
			});
	}

	/**
	 * Log the bot into discord.
	 *
	 * @private
	 * @memberof Spudnik
	 */
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
