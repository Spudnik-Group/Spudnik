/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	async run(old, message) {
		if (this.client.ready && !old.partial && old.content !== message.content) this.client.monitors.run(message);
	}

};
