/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Colors, Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true });
	}

	public run() {
		this.client.emit('verbose', new Colors({ text: 'blue' }).format('---Spudnik Launch Success---'));
	}

}
