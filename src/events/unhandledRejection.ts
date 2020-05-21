/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { emitter: process });
		if (this.client.options.production) this.unload();
	}

	public run(err: any): void {
		if (!err) return;
		this.client.emit('error', `Uncaught Promise Error: \n${err.stack || err}`);
	}

}
