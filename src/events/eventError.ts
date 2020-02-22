/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(event, args, error) {
		this.client.emit('wtf', `[EVENT] ${event.path}\n${error ?
			error.stack ? error.stack : error : 'Unknown error'}`);
	}

};
