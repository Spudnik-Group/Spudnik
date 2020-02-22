/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(message, monitor, error) {
		this.client.emit('wtf', `[MONITOR] ${monitor.path}\n${error ?
			error.stack ? error.stack : error : 'Unknown error'}`);
	}

};
