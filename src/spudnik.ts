import chalk from 'chalk';
import * as Discord from 'discord.js';
import { Client as DiscordClient, Message, RichEmbed } from 'discord.js';
import * as fs from 'fs';
import * as Mongoose from 'mongoose';
import * as path from 'path';
import { Auth, Authorization } from './lib/auth';
import { Config, Configuration } from './lib/config';
import { SettingProviderConfig } from './lib/setting-provider';

export class Spudnik {
	public Auth: Authorization;
	public Config: Configuration;
	public Discord: DiscordClient;
	public Database: Mongoose.Mongoose;
	public Commands: { [index: string]: any } = {};

	private _commandFiles: string[];
	private _commandDirectory: string;
	private _uptime: number;

	constructor(auth: Authorization, config: Configuration) {
		this.Auth = auth;
		this.Config = config;
		this._uptime = new Date().getTime();

		// Set up database
		const databaseConfig = this.Config.getDatabase();

		if (!databaseConfig) {
			throw new Error('There are not any database settings specified in the config file.');
		}

		Mongoose.connect(`mongodb://${databaseConfig.getConnection()}`, (databaseConfig.getOptions() || {}), (err) => {
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

			console.log(chalk.blue('---Spudnik MECO---'));
		});

		try {
			this._commandDirectory = 'dist/modules';
			this._commandFiles = this.getFileArray(this._commandDirectory);
		} catch (err) {
			console.log(chalk.red(err));
		}

		this.setupCommands();
	}

	public require = (filePath: string) => {
		delete require.cache[path.join('./', filePath)];
		return require(path.join('./', filePath))(this);
	}
	public getFileContents = (filePath: string) => {
		try {
			return fs.readFileSync(filePath, 'utf-8');
		} catch (err) {
			console.log(chalk.red(err));
			return '';
		}
	}
	public getFileArray = (srcPath: string) => {
		try {
			srcPath = path.join('./', srcPath);
			return fs.readdirSync(srcPath).filter((file) => fs.statSync(path.join(srcPath, file)).isFile());
		} catch (err) {
			console.log(chalk.red(err));
			return [];
		}
	}
	public getJsonObject = (filePath: string) => {
		return JSON.parse(this.getFileContents(filePath));
	}
	public getUptime = () => {
		const now = Date.now();
		let msec = now - this._uptime;
		console.log(`Uptime is ${msec} milliseconds`);
		const days = Math.floor(msec / 1000 / 60 / 60 / 24);
		msec -= days * 1000 * 60 * 60 * 24;
		const hours = Math.floor(msec / 1000 / 60 / 60);
		msec -= hours * 1000 * 60 * 60;
		const mins = Math.floor(msec / 1000 / 60);
		msec -= mins * 1000 * 60;
		const secs = Math.floor(msec / 1000);
		let timestr = '';
		if (days > 0) {
			timestr += `${days} days `;
		}
		if (hours > 0) {
			timestr += `${hours} hours `;
		}
		if (mins > 0) {
			timestr += `${mins} minutes `;
		}
		if (secs > 0) {
			timestr += `${secs} seconds `;
		}
		return timestr;
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
	public addCommand = (commandName: string, commandObject: object) => {
		try {
			this.Commands[commandName] = commandObject;
		} catch (err) {
			console.log(err);
		}
	}
	public defaultEmbed = (message: string) => {
		return new RichEmbed({ color: this.Config.getDefaultEmbedColor(), description: message });
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
	public commandCount = () => {
		return Object.keys(this.Commands).length;
	}
	public setupCommands = () => {
		this.Commands = {};

		// Load more complex response commands from markdown files
		let markdownCommands = [];
		try {
			markdownCommands = this.getJsonObject('config/markdown-commands.json');
		} catch (err) {
			console.log(chalk.red(err));
		}
		markdownCommands.forEach((markdownCommand: any) => {
			const command = markdownCommand.command;
			const description = markdownCommand.description;
			const deleteRequest = markdownCommand.deleteRequest;
			const channelRestriction = markdownCommand.channelRestriction;
			const file = markdownCommand.file;
			const messagesToSend = this.getFileContents(file);
			if (messagesToSend) {
				this.addCommand(command, {
					description,
					process: (msg: Message, suffix: string) => {
						if (channelRestriction === undefined || (channelRestriction && msg.channel.id === channelRestriction)) {
							if (deleteRequest) {
								msg.delete();
							}

							const messages = messagesToSend.split('=====');
							messages.forEach((message) => {
								const msgSplit = message.split('-----');
								// tslint:disable:object-literal-sort-keys
								this.processMessage(new RichEmbed({
									color: this.Config.getDefaultEmbedColor(),
									title: msgSplit[0].trim(),
									description: msgSplit[1].trim(),
								}), msg, false, false);
							});
						}
					},
				});
			}
		});

		// Load command files
		this._commandFiles.forEach((commandFile: string) => {
			try {
				const file = this.require(`${path.join(this._commandDirectory, commandFile)}`);

				if (file) {
					if (file.commands) {
						file.commands.forEach((command: any) => {
							if (command in file) {
								this.addCommand(command, file[command]);
							}
						});
					}
				}
			} catch (err) {
				console.log(chalk.red(`Improper setup of the '${commandFile}' command file. : ${err}`));
			}

		});

		// Load simple commands from json file
		let jsonCommands = [];
		try {
			jsonCommands = this.getJsonObject('config/commands.json');
		} catch (err) {
			console.log(chalk.red(err));
		}
		jsonCommands.forEach((jsonCommand: any) => {
			const command = jsonCommand.command;
			const description = jsonCommand.description;
			const response = jsonCommand.response;

			this.addCommand(command, {
				description,
				process: (msg: Message, suffix: string) => {
					this.processMessage(new RichEmbed({
						color: this.Config.getDefaultEmbedColor(),
						description: response,
					}), msg, false, false);
				},
			});
		});
	}
}
