import { Event, KlasaClient, EventStore } from 'klasa';

export default class extends Event {

	constructor(client: KlasaClient, store: EventStore, file: string[], directory: string) {
		super(client, store, file, directory, { emitter: process });
		if (this.client.options.production) this.unload();
	}

	run(err) {
		if (!err) return;
		this.client.emit('error', `Uncaught Promise Error: \n${err.stack || err}`);
	}

};
