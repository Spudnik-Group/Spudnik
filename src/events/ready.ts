import { Event, KlasaClient, EventStore } from 'klasa';
import chalk from 'chalk';

export default class extends Event {

	constructor(client: KlasaClient, store: EventStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			once: true,
			event: 'ready'
		});
	}

	async run() {

		console.log(chalk.magenta(`Logged into Discord! Serving in ${this.client.guilds.array().length} Discord servers`));
		console.log(chalk.blue('---Spudnik Launch Success---'));
	}

};