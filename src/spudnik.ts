import chalk from 'chalk';
import * as Mongoose from 'mongoose';
import * as path from 'path';
import { SpudnikClient } from './lib/client';
import { Configuration } from './lib/config';
import { MongoProvider } from './lib/providers/mongodb-provider';

export class Spudnik {
	public Config: Configuration;
	public Database: Mongoose.Mongoose;
	public Discord: SpudnikClient;

	constructor(config: Configuration) {
		this.Config = config;
		this.Database = Mongoose;

		this.Discord = new SpudnikClient({
			commandPrefix: '!',
			messageCacheLifetime: 30,
			messageSweepInterval: 60,
			owner: this.Config.getOwner(),
			config: this.Config,
		});

		this.setupDatabase();
		this.login();

		require('./lib/on-event')(this);
		console.log(chalk.blue('---Spudnik MECO---'));

		this.setupCommands();
	}

	public setupCommands = () => {
		this.Discord.registry
			.registerGroups([
				['util', 'Utiltiy'],
				['mod', 'Moderation'],
				['ref', 'Reference'],
				['random', 'Random'],
				['translate', 'Translate'],
				['misc', 'Misc'],
				['music', 'Music'],
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
		if (this.Config.getToken()) {
			console.log(chalk.magenta('Logging in to Discord...'));

			this.Discord.login(this.Config.getToken());
		} else {
			console.error('Spudnik must have a Discord bot token...');
			process.exit(-1);
		}
	}
}
