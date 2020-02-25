/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';
import { ClientSettings } from '@lib/types/settings/ClientSettings';

export default class extends Event {

	run(guild) {
		if (!guild.available) return;
		if (this.client.settings.get(ClientSettings.Blacklist.Guilds).includes(guild.id)) {
			guild.leave();
			this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
		}
	}

};
