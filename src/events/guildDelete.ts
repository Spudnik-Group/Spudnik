/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';

export default class extends Event {

	run(guild) {
		if (this.client.ready && guild.available && !this.client.options.preserveSettings) guild.settings.destroy().catch(() => null);
	}

};
