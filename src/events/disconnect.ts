/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(err) {
		this.client.emit('error', `Disconnected | ${err.code}: ${err.reason}`);
		process.exit();
	}

}
