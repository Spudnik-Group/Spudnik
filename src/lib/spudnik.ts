import chalk from 'chalk';
import { Client, KlasaClientOptions } from 'klasa';
import { Configuration } from './interfaces';
import * as http from 'http';

const PORT = process.env.PORT || 1337;

/**
 * Define Default Schemas
 * 
 */
Client.defaultPermissionLevels
	.add(2, ({ guild, member }) => guild && member.permissions.has('MANAGE_ROLES'), { fetch: true })
	.add(3, ({ guild, member }) => guild && member.permissions.has('KICK_MEMBERS'), { fetch: true })
	.add(4, ({ guild, member }) => guild && member.permissions.has('BAN_MEMBERS'), { fetch: true })
	// TODO: add staff feature
	// .add(5, ({ guild, author }) => guild.settings['staff'].includes(author.id));
Client.defaultGuildSchema
	.add('channels', folder => folder
		.add('botAnnounce', 'TextChannel')
	)
	.add('roles', folder => folder
		// TODO: add botAdmin feature
		// .add('botAdmin', 'Role')
		// TODO: add staff feature
		// .add('staff', 'Role')
		.add('defaultRole', 'Role')
		.add('muted', 'Role')
	)
	.add('features', folder => folder
		.add('starboard', folder => folder
			.add('starboardEnabled', 'boolean', { default: false })
			.add('starboardChannel', 'TextChannel', { default: null })
			.add('starboardTrigger', 'string', { default: '⭐' })
		)
		.add('welcome', folder => folder
			.add('welcomeEnabled', 'boolean', { default: false })
			.add('welcomeChannel', 'TextChannel', { default: null })
			.add('welcomeMessage', 'string', { default: `` })
		)
		.add('goodbye', folder => folder
			.add('goodbyeEnabled', 'boolean', { default: false })
			.add('goodbyeChannel', 'TextChannel', { default: null })
			.add('goodbyeMessage', 'string', { default: `` })
		)
		.add('modlog', folder => folder
			.add('modlogChannel', 'TextChannel', { default: null })
			.add('modlogEnabled', 'boolean', { default: false })
		)
		.add('tos', folder => folder
			.add('tosChannel', 'TextChannel', { default: null })
			.add('tosMessages', 'any', { array: true })
		)
		.add('embedColor', 'string', { default: '555555' })
		.add('adblockEnabled', 'boolean', { default: false })
		.add('deleteCommandMessages', 'boolean', { default: false })
		.add('hasSendModLogMessage', 'boolean', { default: false })
		.add('selfAssignableRoles', 'any', { array: true })
	)

/**
 * The Spudnik Discord Bot.
 *
 * @export
 * @class Spudnik
 * @property {Configuration} Config
 * @property {CommandoClient} Discord
 */
export class Spudnik extends Client {
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
