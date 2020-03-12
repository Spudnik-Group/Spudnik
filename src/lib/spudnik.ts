/**
 * Copyright (c) 2020 Spudnik Group
 */
/* eslint-disable @typescript-eslint/no-floating-promises */

import chalk from 'chalk';
import { Client } from 'klasa';
import * as http from 'http';
import { SpudConfig } from './config/spud-config';
import { KlasaConfig } from './config/klasa-config';

const PORT = SpudConfig.port;

// Define Default Schemas
import('./schemas/client-schema');
import('./schemas/guild-schema');

/**
 * The Spudnik Discord Bot.
 *
 * @export
 * @class Spudnik
 * @property {Configuration} Config
 */
export default class Spudnik extends Client {

	public constructor() {
		super(KlasaConfig);

		this.startBot();
		this.startHeart();
	}

	private startBot = () => {

		console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));

		this.login(SpudConfig.token).catch(() => process.exit());
	};

	private startHeart = () => {
		http.createServer((request, response) => {
			response.writeHead(200, { 'Content-Type': 'text/plain' });
			response.end('Ok!');
		}).listen(PORT);

		// Print URL for accessing server
		console.log(chalk.red(`Heartbeat running on port ${PORT}`));
	};

}
