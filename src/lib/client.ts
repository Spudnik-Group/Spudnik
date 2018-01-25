import { CommandoClient } from 'discord.js-commando';
import { Configuration } from './config';

export class SpudnikClient extends CommandoClient {
	public config: Configuration;
	constructor(options = {}, config = new Configuration()) {
		super(options);
		this.config = config;
	}
}
