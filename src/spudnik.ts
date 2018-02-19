import chalk from 'chalk';
import * as Mongoose from 'mongoose';
import * as path from 'path';
import { SpudnikClient } from './lib/client';
import { Configuration } from './lib/config';
import { MongoProvider } from './lib/providers/mongodb-provider';

// tslint:disable-next-line:no-var-requires
const { mongoDb }: { mongoDb: string } = require('../config/config.json');

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

		this.setupDatabase();
		this.login();

		require('./lib/on-event')(this);
		console.log(chalk.blue('---Spudnik MECO---'));
	}

	public setupCommands = () => {
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
			.registerCommandsIn(path.join(__dirname, 'modules'));
	}
	public setupDatabase = () => {
		this.Discord.setProvider(
			Mongoose.connect(mongoDb).then(() => new MongoProvider(Mongoose.connection)),
		).catch((err) => {
			console.error(err);
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
