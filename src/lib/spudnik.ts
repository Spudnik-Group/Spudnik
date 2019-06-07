import chalk from 'chalk';
import { GuildMember, Message } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';
import * as http from 'http';
import Mongoose = require('mongoose');
import * as path from 'path';
import { MongoSettingsProvider } from './providers/mongo-settings-provider';
import {
	handleReady, handleRaw, handleMessage,
	handleGuildMemberAdd, handleGuildMemberRemove,
	handleDisconnected, handleError, handleWarn,
	handleCommandError, handleDebug
} from './handlers';

const { version }: { version: string } = require('../../package');
const PORT = process.env.PORT || 1337;

export interface Configuration {
	'bfdApiKey': string,
	'bodApiKey': string,
	'botListUpdateInterval': number;
	'botsggApiKey': string,
	'dbApiKey': string,
	'dblApiKey': string;
	'debug': boolean;
	'mongoDB': string;
	'owner': string | string[];
	'rollbarApiKey': string;
	'statusUpdateInterval': number;
	'token': string;
}

/**
 * The Spudnik Discord Bot.
 *
 * @export
 * @class Spudnik
 * @property {Configuration} Config
 * @property {CommandoClient} Discord
 */
export class Spudnik {
	/**
	 * @name Spudnik#Config
	 * @type Configuration
	 */
	public Config: Configuration;
	/**
	 * @name Spudnik#Discord
	 * @type CommandoClient
	 */
	public Discord: CommandoClient;

	/**
	 * Creates an instance of Spudnik.
	 *
	 * @param {Configuration} config
	 * @memberof Spudnik
	 */
	constructor(config: Configuration) {
		this.Config = config;

		console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));

		this.Discord = new CommandoClient({
			commandPrefix: '!',
			disabledEvents: [
				'GUILD_INTEGRATIONS_UPDATE',
				'GUILD_BAN_ADD',
				'GUILD_BAN_REMOVE',
				'GUILD_EMOJIS_UPDATE',
				'CHANNEL_PINS_UPDATE',
				'MESSAGE_DELETE',
				'MESSAGE_DELETE_BULK',
				'MESSAGE_REACTION_ADD',
				'MESSAGE_REACTION_REMOVE',
				'MESSAGE_REACTION_REMOVE_ALL',
				'PRESENCE_UPDATE',
				'VOICE_STATE_UPDATE',
				'TYPING_START',
				'VOICE_STATE_UPDATE',
				'VOICE_SERVER_UPDATE',
				'WEBHOOKS_UPDATE'
			],
			invite: 'https://spudnik.io/support',
			messageCacheLifetime: 30,
			messageSweepInterval: 60,
			owner: this.Config.owner
		});

		this.setupCommands();
		this.setupEvents();
		this.setupDatabase();
		this.login();
		this.startHeart();

		console.log(chalk.blue('---Spudnik MECO---'));
	}

	private setupCommands = () => {
		this.Discord.registry
			.registerDefaultTypes()
			.registerGroups([
				['convert', 'Convert'],
				['default', 'Default'],
				['dev', 'Developer'],
				['facts', 'Facts'],
				['feature', 'Feature'],
				['game', 'Game'],
				['gaming', 'Gaming'],
				['meme', 'Memes'],
				['misc', 'Misc'],
				['mod', 'Moderation'],
				['random', 'Random'],
				['ref', 'Reference'],
				['roles', 'Role'],
				['translate', 'Translate'],
				['util', 'Utility'],
				['util-required', 'Required Utility']
			])
			.registerCommandsIn(path.join(__dirname, '../modules'));
	}

	private setupDatabase = () => {
		Mongoose.Promise = require('bluebird').Promise;

		this.Discord.setProvider(
			Mongoose.connect(this.Config.mongoDB, { useMongoClient: true }).then(() => new MongoSettingsProvider(Mongoose.connection))
		).catch((err) => {
			if (process.env.NODE_ENV !== 'development') this.Discord.emit('error', `Failed to set provider!\nError: ${err}`);
			process.exit(-1);
		});
	}

	private setupEvents = () => {
		this.Discord
			.once('ready', async() => handleReady(version, this.Discord, this.Config))
			.on('raw', async(event: any) => handleRaw(event, this.Discord))
			.on('message', (message: Message) => handleMessage(message, this.Discord))
			.on('guildMemberAdd', (member: GuildMember) => handleGuildMemberAdd(member, this.Discord))
			.on('guildMemberRemove', (member: GuildMember) => handleGuildMemberRemove(member, this.Discord))
			.on('disconnected', (err: Error) => handleDisconnected(err, this.Discord))
			.on('error', (err: Error) => handleError(err, this.Config))
			.on('warn', (err: Error) => handleWarn(err, this.Discord))
			.on('debug', (err: Error) => handleDebug(err))
			.on('commandError', (cmd, err) => handleCommandError(cmd, err));
	}

	private login = () => {
		if (this.Config.token) {
			console.log(chalk.magenta('Logging in to Discord...'));
			this.Discord.login(this.Config.token);
		} else {
			console.error('Spudnik must have a Discord bot token...');
			process.exit(-1);
		}
	}

	private startHeart = () => {
		http.createServer((request, response) => {
			response.writeHead(200, { 'Content-Type': 'text/plain' });
			response.end('Ok!');
		}).listen(PORT);

		// Print URL for accessing server
		console.log(chalk.red(`Heartbeat running on port ${PORT}`));
	}
}
