/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(message) {
		if (message.command && message.command.deletable) {
			for (const msg of message.responses) {
				msg.delete();
			}
		}
	}

};
