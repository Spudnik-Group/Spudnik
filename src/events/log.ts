/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(data) {
		this.client.console.log(data);
	}

};
