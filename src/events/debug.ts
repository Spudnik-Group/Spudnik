/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(warning) {
		if (this.client.ready) this.client.console.debug(warning);
	}

};
