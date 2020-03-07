/**
 * Copyright (c) 2020 Spudnik Group
 */
/* eslint-disable @typescript-eslint/no-floating-promises */

import chalk from 'chalk';
import { Client } from 'klasa';
import { Server } from './server';
import { SpudConfig } from './config/spud-config';
import { KlasaConfig } from './config/klasa-config';

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

	public server: Server;

	public constructor() {
		super(KlasaConfig);

		this.server = new Server(this);

		this.startBot();
	}

	private startBot = () => {

		console.log(chalk.blue('---Spudnik Stage 2 Engaged.---'));

		this.login(SpudConfig.token).catch(() => process.exit());
	};

}
