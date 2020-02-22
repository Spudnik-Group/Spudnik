/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(message, command, response) {
		if (response && response.length) message.sendMessage(response);
	}

};
