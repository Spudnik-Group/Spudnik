import chalk from 'chalk';
import { Client, KlasaClientOptions } from 'klasa';
import * as http from 'http';
const { token } = require('./config');

const PORT = process.env.PORT || 1337;

export interface Configuration {
	'bfdApiKey': string,
	'bodApiKey': string,
	'botListUpdateInterval': number;
	'botsggApiKey': string,
	'dbApiKey': string,
	'dblApiKey': string;
	'debug': boolean;
	'spudStatsDB': string;
	'spudCoreDB': string;
	'owner': string;
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
	constructor(options: KlasaClientOptions) {
		super(options);

		console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));
		this.login(token);
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
