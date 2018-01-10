import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

import * as Discord from 'discord.js';
import { Client as DiscordClient } from 'discord.js';

import * as Mongoose from 'mongoose';

import { Configuration, Config } from './lib/config';
import { Authorization, Auth } from './lib/auth';
import { SettingProviderConfig } from './lib/setting-provider';


export class Spudnik {
	public Auth: Authorization;
	public Config: Configuration;
	public Discord: DiscordClient;
	public Database: Mongoose.Mongoose;

	// Helpers
	public require = (filePath: string) => {
		delete require.cache[path.join('./', filePath)];
		return require(path.join('./', filePath))(this);
	};

	public getFileContents = (filePath: string) => {
		try {
			return fs.readFileSync(path.join('./', filePath), 'utf-8');
		} catch (err) {
			console.log(chalk.red(err));
			return '';
		}
	};

	public getFileArray = (srcPath: string) => {
		try {
			srcPath = path.join('./', srcPath);
			return fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isFile());
		} catch (err) {
			console.log(chalk.red(err));
			return [];
		}
	};

	public getJsonObject = (filePath: string) => {
		return JSON.parse(this.getFileContents(filePath));
	};

	public resolveMention = (usertxt: string) => {
		let userid = usertxt;
		if (usertxt.startsWith('<@!')) {
			userid = usertxt.substr(3, usertxt.length - 4);
		} else if (usertxt.startsWith('<@')) {
			userid = usertxt.substr(2, usertxt.length - 3);
		}
		return userid;
	};

	// Functions
	constructor(auth: Authorization, config: Configuration) {
		this.Auth = auth;
		this.Config = config;

		// Set up database 
		const databaseConfig = this.Config.getDatabase();

		if (!databaseConfig) {
			throw new Error('There are not any database settings specified in the config file.');
		}

		Mongoose.connect(`mongodb://${databaseConfig.getConnection()}`, (databaseConfig.getOptions() || {}), err => {
			if (err) {
				throw err;
			}
			console.log(chalk.magenta(`Successfully connected to MongoDB at ${databaseConfig.getConnection()}.`));
		});

		this.Database = Mongoose;

		// Bot login
		this.Database.connection.once('open', () => {
			this.Discord = new Discord.Client();

			if (this.Auth.getToken()) {
				console.log(chalk.magenta('Logging in to Discord...'));
				this.Discord.login(this.Auth.getToken());
				require('./lib/on-event')(this);
			} else {
				console.log(chalk.red('ERROR: Spudnik must have a Discord bot token...'));
			}

			console.log(chalk.blue(`---Spudnik MECO---`));
		});
	}
}
