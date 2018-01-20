import chalk from 'chalk';
import { Client as DiscordClient, Message, RichEmbed } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import * as fs from 'fs';
import * as Mongoose from 'mongoose';
import * as path from 'path';
import { Auth, Authorization } from './lib/auth';
import { Config, Configuration } from './lib/config';
import { MongoProvider } from './lib/providers/mongodb-provider';
import { SettingProviderConfig } from './lib/providers/setting-provider-config';

export class Spudnik {
	public Auth: Authorization;
	public Config: Configuration;
	public Database: Mongoose.Mongoose;
	public Discord: CommandoClient;

	constructor(auth: Authorization, config: Configuration) {
		this.Auth = auth;
		this.Config = config;
		this.Database = Mongoose;

		this.Discord = new CommandoClient({
			commandPrefix: '!',
			messageCacheLifetime: 30,
			messageSweepInterval: 60,
			owner: '223806022588956673',
		});

		this.setupDatabase();
		this.login();

		require('./lib/on-event')(this);
		console.log(chalk.blue('---Spudnik MECO---'));

		this.setupCommands();
	}

	public getFileContents = (filePath: string) => {
		try {
			return fs.readFileSync(filePath, 'utf-8');
		} catch (err) {
			console.log(chalk.red(err));
			return '';
		}
	}
	public getJsonObject = (filePath: string) => {
		return JSON.parse(this.getFileContents(filePath));
	}
	public resolveMention = (usertxt: string) => {
		let userid = usertxt;
		if (usertxt.startsWith('<@!')) {
			userid = usertxt.substr(3, usertxt.length - 4);
		} else if (usertxt.startsWith('<@')) {
			userid = usertxt.substr(2, usertxt.length - 3);
		}
		return userid;
	}
	public processMessage = (output: any, msg: Message, expires: boolean, delCalling: boolean) => {
		return msg.channel.send(output).then((message) => {
			if (expires) {
				if (message instanceof Message) {
					message.delete(5000);
				}
			}
			if (delCalling) {
				msg.delete();
			}
		});
	}
	public setupCommands = () => {
		this.Discord.registry
			.registerGroups([
				['nsfw', 'Nsfw'],
				['util', 'Util'],
				['gifs', 'Gifs'],
				['levels', 'Levels'],
			])
			.registerDefaults()
			.registerCommandsIn(path.join(__dirname, 'modules'));
	}
	public setupDatabase = () => {
		const databaseConfig = this.Config.getDatabase();
		if (!databaseConfig) {
			throw new Error('There are not any database settings specified in the config file.');
		}

		this.Discord.setProvider(
			Mongoose.connect(databaseConfig.getConnection()).then(() => new MongoProvider(Mongoose.connection)),
		).catch((err: any) => {
			console.error('Failed to connect to database.');
			process.exit(-1);
		});
	}
	public login = () => {
		if (this.Auth.getToken()) {
			console.log(chalk.magenta('Logging in to Discord...'));

			this.Discord.login(this.Auth.getToken());
		} else {
			console.error('Spudnik must have a Discord bot token...');
			process.exit(-1);
		}
	}
}
