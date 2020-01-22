import chalk from 'chalk';
import { Client, KlasaClientOptions } from 'klasa';
import { Configuration } from './interfaces';
import * as http from 'http';
import { SpudConfig } from './config/spud-config';

const PORT = SpudConfig.port || 1337;

// Define Default Schemas
Client.defaultGuildSchema
	.add('warnings', 'any', { array: true })
	.add('disabledCommands', 'string', { array: true })
	.add('disabledCommandCategories', 'string', { array: true })
	.add('roles', folder => folder
		.add('defaultRole', 'Role')
		.add('muted', 'Role')
		.add('selfAssignableRoles', 'Role', { array: true })
	)
	.add('starboard', folder => folder
		.add('enabled', 'boolean')
		.add('channel', 'TextChannel')
		.add('trigger', 'string', { default: '⭐' })
	)
	.add('welcome', folder => folder
		.add('enabled', 'boolean')
		.add('channel', 'TextChannel')
		.add('message', 'string', { default: '@here, please Welcome {user} to {guild}!' })
	)
	.add('goodbye', folder => folder
		.add('enabled', 'boolean')
		.add('channel', 'TextChannel')
		.add('message', 'string', { default: '{user} has left the server.' })
	)
	.add('modlog', folder => folder
		.add('channel', 'TextChannel')
		.add('enabled', 'boolean')
	)
	.add('tos', folder => folder
		.add('channel', 'TextChannel')
		.add('messages', 'any', { array: true })
	)
	.add('embedColor', 'string', { default: '555555' })
	.add('adblockEnabled', 'boolean')
	.add('deleteCommandMessages', 'boolean')
	.add('hasSentModLogMessage', 'boolean');

/**
 * The Spudnik Discord Bot.
 *
 * @export
 * @class Spudnik
 * @property {Configuration} Config
 */
export default class Spudnik extends Client {
	/**
	 * @name Spudnik#Config
	 * @type Configuration
	 */
	public Config: Configuration;

	/**
	 * Creates an instance of Spudnik.
	 *
	 * @param {Configuration} config
	 * @memberof Spudnik
	 */
	constructor(options: KlasaClientOptions, config: Configuration) {
		super(options);

		console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));

		this.Config = config;
		this.login(config.token);
		this.startHeart();

		console.log(chalk.blue('---Spudnik MECO---'));
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
