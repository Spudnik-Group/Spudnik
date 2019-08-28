import chalk from 'chalk';
import { Client, KlasaClientOptions } from 'klasa';
import { Configuration } from './interfaces';
import * as http from 'http';

const PORT = process.env.PORT || 1337;

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
