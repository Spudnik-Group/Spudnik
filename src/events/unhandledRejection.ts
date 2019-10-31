import { Event, KlasaClient, EventStore } from 'klasa';

export default class extends Event {

	constructor(client: KlasaClient, store: EventStore, file: string[], directory: string) {
		super(client, store, file, directory, { emitter: process });
		if (this.client.options.production) this.unload();
	}

	run(err) {
		// TODO: change this
		// const message = stripIndents`
		// Caught **General Warning**!
		// **Time:** ${format(new Date(), 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		// **Warning Message:** ${err}`;

		// if (process.env.spud_issuelog) {
		// 	const channel = client.channels.get(process.env.spud_issuelog) as TextChannel;
		// 	channel.send(message);
		// }

		if (!err) return;
		this.client.emit('error', `Uncaught Promise Error: \n${err.stack || err}`);
	}

};
