/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_REACTION_REMOVE', emitter: store.client.ws });
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async run(event: any): Promise<void> {
		this.client.emit('starboardMessageReactionRemove', event);
	}

}
